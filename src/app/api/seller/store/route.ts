// src/app/api/seller/store/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// POST — crear tienda (solo si el vendedor no tiene una)
export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const existing = await prisma.store.findUnique({
    where: { userId: session.user.id },
  })

  if (existing) {
    return NextResponse.json(
      { error: 'Ya tienes una tienda creada' },
      { status: 409 }
    )
  }

  const { name, slug, description, logoUrl } = await req.json()

  if (!name || !slug) {
    return NextResponse.json(
      { error: 'El nombre es requerido' },
      { status: 400 }
    )
  }

  let finalSlug = slug
  let counter = 1
  while (await prisma.store.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter}`
    counter++
  }

  const store = await prisma.store.create({
    data: {
      userId: session.user.id,
      name,
      slug: finalSlug,
      description,
      logoUrl: logoUrl ?? null,
      isActive: true,
    },
  })

  return NextResponse.json(store, { status: 201 })
}

// GET — obtener la tienda del vendedor actual
export async function GET() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
    include: {
      _count: { select: { products: true } },
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  return NextResponse.json(store)
}
