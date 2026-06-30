// src/app/api/cart/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// Verifica que el item pertenezca al usuario que hace la petición
async function getOwnedCartItem(itemId: string, userId: string) {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId } })
  if (!item || item.userId !== userId) return null
  return item
}

// PATCH — actualizar cantidad de un item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const owned = await getOwnedCartItem(id, session.user.id)
  if (!owned) {
    return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 })
  }

  const { quantity } = await req.json()
  if (!quantity || quantity < 1) {
    return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { id: owned.productId },
  })
  if (product && quantity > product.stock) {
    return NextResponse.json(
      { error: `Solo quedan ${product.stock} unidades disponibles` },
      { status: 400 }
    )
  }

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  })

  return NextResponse.json(updated)
}

// DELETE — quitar item del carrito
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const owned = await getOwnedCartItem(id, session.user.id)
  if (!owned) {
    return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 })
  }

  await prisma.cartItem.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
