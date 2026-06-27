// src/app/api/admin/shops/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''

  const shops = await prisma.store.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {},
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { products: true } },
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { plan: true, status: true, endDate: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(shops)
}
