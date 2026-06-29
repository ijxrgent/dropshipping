// src/app/api/seller/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET — listar productos de la tienda del vendedor actual
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
  })
  if (!store) {
    return NextResponse.json(
      { error: 'No tienes una tienda creada' },
      { status: 404 }
    )
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''

  const products = await prisma.product.findMany({
    where: {
      storeId: store.id,
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { order: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

// POST — crear producto nuevo
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
  })
  if (!store) {
    return NextResponse.json(
      { error: 'No tienes una tienda creada' },
      { status: 404 }
    )
  }

  const { name, slug, description, price, stock, categoryId, images } =
    await req.json()

  if (!name || !categoryId || price == null) {
    return NextResponse.json(
      { error: 'Faltan campos requeridos' },
      { status: 400 }
    )
  }

  // Verificar slug único, agregar sufijo si ya existe
  let finalSlug = slug
  let counter = 1
  while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter}`
    counter++
  }

  const product = await prisma.product.create({
    data: {
      storeId: store.id,
      categoryId,
      name,
      slug: finalSlug,
      description,
      price,
      stock: stock ?? 0,
      isPublished: false, // se publica manualmente desde el listado
      images: {
        create: (images ?? []).map((img: { url: string; order: number }) => ({
          url: img.url,
          order: img.order,
        })),
      },
    },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { order: 'asc' } },
    },
  })

  return NextResponse.json(product, { status: 201 })
}
