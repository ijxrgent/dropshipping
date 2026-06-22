// src/app/api/admin/usuarios/[id]/route.ts
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
  const body = await req.json()

  // Protección: no permitir modificar otros admins
  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) {
    return NextResponse.json(
      { error: 'Usuario no encontrado' },
      { status: 404 }
    )
  }
  if (target.role === 'ADMIN' && session.user.id !== id) {
    return NextResponse.json(
      { error: 'No puedes modificar otro admin' },
      { status: 403 }
    )
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(body.role !== undefined && { role: body.role }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  })

  // Si se suspende un vendedor, desactivar su tienda también
  if (body.isActive === false && target.role === 'SELLER') {
    await prisma.store.updateMany({
      where: { userId: id },
      data: { isActive: false },
    })
  }

  // Si se reactiva, reactivar su tienda
  if (body.isActive === true && target.role === 'SELLER') {
    await prisma.store.updateMany({
      where: { userId: id },
      data: { isActive: true },
    })
  }

  return NextResponse.json(user)
}
