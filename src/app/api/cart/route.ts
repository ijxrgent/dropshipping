//src/app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET — listar items del carrito del usuario actual
export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          store: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(items)
}

// POST — agregar producto al carrito (o incrementar cantidad si ya existe)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { productId, quantity } = await req.json()

  if (!productId || !quantity || quantity < 1) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || !product.isPublished) {
    return NextResponse.json(
      { error: 'Producto no disponible' },
      { status: 404 }
    )
  }

  // Verifica si ya existe en el carrito para sumar cantidades en vez de duplicar
  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  })

  const newQuantity = (existing?.quantity ?? 0) + quantity

  if (newQuantity > product.stock) {
    return NextResponse.json(
      { error: `Solo quedan ${product.stock} unidades disponibles` },
      { status: 400 }
    )
  }

  const cartItem = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { quantity: newQuantity },
    create: { userId: session.user.id, productId, quantity: newQuantity },
  })

  return NextResponse.json(cartItem, { status: 201 })
}
