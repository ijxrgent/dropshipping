// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') // id del último producto cargado
  const take = 10

  const products = await prisma.product.findMany({
    where: { isPublished: true, store: { isActive: true } },
    take: take + 1, // toma uno extra para saber si hay más
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      originalPrice: true,
      discount: true,
      images: { take: 1, orderBy: { order: 'asc' }, select: { url: true } },
      store: { select: { name: true, slug: true } },
    },
  })

  const hasMore = products.length > take
  const items = hasMore ? products.slice(0, take) : products
  const nextCursor = hasMore ? items[items.length - 1].id : null

  return NextResponse.json({ items, nextCursor })
}
