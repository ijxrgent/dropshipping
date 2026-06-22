// src/app/api/admin/usuarios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client' // Import your Role enum from Prisma

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const roleParam = searchParams.get('role')

  // Validate role if provided
  const role =
    roleParam && Object.values(Role).includes(roleParam as Role)
      ? (roleParam as Role)
      : undefined

  const users = await prisma.user.findMany({
    where: {
      AND: [
        role ? { role } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}
