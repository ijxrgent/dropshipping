// src/app/api/admin/categorias/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET — listar todas las categorías
export async function GET() {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return NextResponse.json(categories)
}

// POST — crear categoría
export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { name, slug } = await req.json()

  if (!name || !slug) {
    return NextResponse.json(
      { error: 'Nombre y slug son requeridos' },
      { status: 400 }
    )
  }

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json(
      { error: 'Ya existe una categoría con ese nombre' },
      { status: 409 }
    )
  }

  const category = await prisma.category.create({
    data: { name, slug },
  })

  return NextResponse.json(category, { status: 201 })
}
