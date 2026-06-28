// src/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client' // Importa el enum

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const statusParam = searchParams.get('status')

  // Validar y convertir el status
  let status: OrderStatus | undefined
  if (
    statusParam &&
    Object.values(OrderStatus).includes(statusParam as OrderStatus)
  ) {
    status = statusParam as OrderStatus
  }

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        status ? { status } : {},
        search
          ? {
              buyer: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              },
            }
          : {},
      ],
    },
    include: {
      buyer: { select: { name: true, email: true } },
      orderItems: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          commission: true,
          product: {
            select: {
              name: true,
              store: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(orders)
}
