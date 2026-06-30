// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

const COMMISSION_RATE = 0.06 // 6% fijo para todos los vendedores

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { address } = await req.json()

  if (!address || address.trim().length < 5) {
    return NextResponse.json(
      { error: 'Ingresa una dirección de envío válida' },
      { status: 400 }
    )
  }

  // Trae el carrito con los datos de producto necesarios para validar stock y precio
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  })

  if (cartItems.length === 0) {
    return NextResponse.json(
      { error: 'Tu carrito está vacío' },
      { status: 400 }
    )
  }

  // Verifica que todos los productos sigan disponibles y con stock suficiente
  // ANTES de iniciar la transacción, para dar un mensaje de error claro
  for (const item of cartItems) {
    if (!item.product.isPublished) {
      return NextResponse.json(
        { error: `"${item.product.name}" ya no está disponible` },
        { status: 409 }
      )
    }
    if (item.quantity > item.product.stock) {
      return NextResponse.json(
        {
          error: `Solo quedan ${item.product.stock} unidades de "${item.product.name}"`,
        },
        { status: 409 }
      )
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  try {
    // Transacción: todo ocurre junto, o nada ocurre
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: session.user.id,
          total,
          status: 'PAID', // simulado: se marca como pagada directamente
          address,
          wompiRef: `SIMULATED-${Date.now()}`, // referencia falsa hasta integrar Wompi real
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price,
              commission: Math.round(
                item.product.price * item.quantity * COMMISSION_RATE
              ),
            })),
          },
        },
        include: { orderItems: true },
      })

      // Descuenta el stock de cada producto
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // Vacía el carrito del comprador
      await tx.cartItem.deleteMany({ where: { userId: session.user.id } })

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('[CHECKOUT]', error)
    return NextResponse.json(
      { error: 'No se pudo procesar el pedido' },
      { status: 500 }
    )
  }
}
