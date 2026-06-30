// src/app/api/cart/count/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ count: 0 })
  }

  const result = await prisma.cartItem.aggregate({
    where: { userId: session.user.id },
    _sum: { quantity: true },
  })

  return NextResponse.json({ count: result._sum.quantity ?? 0 })
}
