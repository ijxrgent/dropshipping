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
    include: {
      product: {
        include: {
          store: {
            select: {
              id: true,
              name: true,
              userId: true,
            },
          },
        },
      },
    },
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
      // 1. Crear pedido
      const newOrder = await tx.order.create({
        data: {
          buyerId: session.user.id,
          total,
          status: 'PAID',
          address,
          wompiRef: `SIMULATED-${Date.now()}`,
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
        include: {
          orderItems: true,
        },
      })

      // 2. Crear notificaciones para los vendedores
      const sellers = new Map<
        string,
        {
          storeId: string
          storeName: string
        }
      >()

      for (const item of cartItems) {
        const sellerId = item.product.store.userId

        if (!sellers.has(sellerId)) {
          sellers.set(sellerId, {
            storeId: item.product.store.id,
            storeName: item.product.store.name,
          })
        }
      }

      for (const [sellerId, store] of sellers) {
        await tx.notification.create({
          data: {
            userId: sellerId,
            type: 'NEW_SALE',
            title: 'Nueva venta',
            body: `Has recibido una nueva venta en ${store.storeName}.`,
            link: `/dashboard/seller/orders`,
            metadata: {
              orderId: newOrder.id,
              storeId: store.storeId,
            },
          },
        })
      }

      // 3. Descontar stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // 4. Vaciar carrito
      await tx.cartItem.deleteMany({
        where: {
          userId: session.user.id,
        },
      })

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
