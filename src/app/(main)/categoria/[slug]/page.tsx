import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Package } from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) notFound()

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isPublished: true,
      store: { isActive: true },
    },
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

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 pb-24 sm:pb-8">
      <div className="mb-5">
        <h1 className="font-bold text-gray-900" style={{ fontSize: '20px' }}>
          {category.name}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {products.length} producto{products.length !== 1 ? 's' : ''}{' '}
          disponible{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-gray-200 py-20 text-center">
          <Package size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            No hay productos en esta categoría aún
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.map((product) => {
            const cover = product.images[0]?.url
            return (
              <Link
                key={product.id}
                href={`/shop/${product.store.slug}/${product.slug}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="relative bg-gray-100"
                  style={{ aspectRatio: '1/1' }}
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={withCloudinaryTransform(
                        cover,
                        'c_fill,g_auto,w_400,h_400,f_auto,q_auto'
                      )}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={22} className="text-gray-300" />
                    </div>
                  )}
                  {product.discount && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      -{product.discount}%
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <div className="mt-0.5">
                    <p className="text-xs font-bold text-gray-900">
                      ${product.price.toLocaleString('es-CO')}
                    </p>
                    {product.originalPrice && (
                      <p className="text-[10px] text-gray-400 line-through">
                        ${product.originalPrice.toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {product.store.name}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
