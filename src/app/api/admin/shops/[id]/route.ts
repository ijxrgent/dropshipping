// src/app/api/admin/shops/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const { isActive } = await req.json()

  const shop = await prisma.store.update({
    where: { id },
    data: { isActive },
  })

  // Si se suspende la tienda, también despublicar todos sus productos
  if (isActive === false) {
    await prisma.product.updateMany({
      where: { storeId: id },
      data: { isPublished: false },
    })
  }

  return NextResponse.json(shop)
}
