import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Store, ChevronRight } from 'lucide-react'
import ProductGallery from '@/components/products/ProductGallery'
import BuyBox from '@/components/products/BuyBox'

interface ProductPageProps {
  params: Promise<{ slug: string; productSlug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, productSlug } = await params
  const session = await auth()

  const product = await prisma.product.findUnique({
    where: { slug: productSlug, isPublished: true },
    include: {
      images: { orderBy: { order: 'asc' } },
      category: { select: { name: true } },
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          isActive: true,
        },
      },
    },
  })

  // Verifica que el producto exista, esté publicado, y pertenezca a la tienda del slug de la URL
  if (!product || !product.store.isActive || product.store.slug !== slug) {
    notFound()
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
        <Link href="/" className="hover:text-gray-600 transition-colors">
          Inicio
        </Link>
        <ChevronRight size={12} />
        <Link
          href={`/shop/${product.store.slug}`}
          className="hover:text-gray-600 transition-colors"
        >
          {product.store.name}
        </Link>
        <ChevronRight size={12} />
        <span className="text-gray-600 truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Info y compra */}
        <div>
          <p className="text-xs font-medium text-teal-600 mb-1">
            {product.category.name}
          </p>
          <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>

          {/* Vendedor */}
          <Link
            href={`/shop/${product.store.slug}`}
            className="flex items-center gap-2 mt-3 mb-5 group"
          >
            <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              {product.store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.store.logoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store size={13} className="text-gray-400" />
              )}
            </div>
            <span className="text-sm text-gray-500 group-hover:text-teal-600 transition-colors">
              Vendido por{' '}
              <span className="font-medium">{product.store.name}</span>
            </span>
          </Link>

          {/* Compra */}
          <BuyBox
            productId={product.id}
            price={product.price}
            stock={product.stock}
            isLoggedIn={!!session?.user}
          />

          {/* Descripción */}
          {product.description && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                Descripción
              </p>
              <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
