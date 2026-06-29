// src/app/api/seller/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// Verifica que el producto pertenezca a la tienda del vendedor que hace la petición
async function getOwnedProduct(productId: string, userId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  })
  if (!product || product.store.userId !== userId) return null
  return product
}

// PATCH — editar producto (datos generales o solo isPublished)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const owned = await getOwnedProduct(id, session.user.id)
  if (!owned) {
    return NextResponse.json(
      { error: 'Producto no encontrado' },
      { status: 404 }
    )
  }

  const body = await req.json()

  // Caso simple: solo toggle de publicación (desde el botón del listado)
  if (Object.keys(body).length === 1 && 'isPublished' in body) {
    const product = await prisma.product.update({
      where: { id },
      data: { isPublished: body.isPublished },
    })
    return NextResponse.json(product)
  }

  // Caso completo: edición desde el modal de formulario
  const { name, slug, description, price, stock, categoryId, images } = body

  // Reemplaza todas las imágenes: borra las anteriores y crea las nuevas
  // (más simple y confiable que intentar diffear qué se quitó/agregó)
  await prisma.productImage.deleteMany({ where: { productId: id } })

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      price,
      stock,
      categoryId,
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

  return NextResponse.json(product)
}

// DELETE — eliminar producto
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SELLER') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const owned = await getOwnedProduct(id, session.user.id)
  if (!owned) {
    return NextResponse.json(
      { error: 'Producto no encontrado' },
      { status: 404 }
    )
  }

  // Las imágenes se borran en cascada automáticamente (onDelete: Cascade en el schema)
  await prisma.product.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
