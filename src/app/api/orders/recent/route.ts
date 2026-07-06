// src/app/api/orders/recent/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json([])
  }

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      orderItems: {
        take: 1,
        select: { product: { select: { name: true } } },
      },
    },
  })

  return NextResponse.json(orders)
}
