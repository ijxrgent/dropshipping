import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Store, Package } from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

interface StorePageProps {
  params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params

  const store = await prisma.store.findUnique({
    where: { slug, isActive: true },
    include: {
      products: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: { take: 1, orderBy: { order: 'asc' }, select: { url: true } },
        },
      },
    },
  })

  if (!store) notFound()

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Cabecera de la tienda */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="relative w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={withCloudinaryTransform(
                store.logoUrl,
                'c_fill,g_auto,w_200,h_200,f_auto,q_auto'
              )}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store size={28} className="text-gray-400" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
          {store.description && (
            <p className="text-sm text-gray-500 mt-1 max-w-lg">
              {store.description}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {store.products.length} producto
            {store.products.length !== 1 ? 's' : ''} disponible
            {store.products.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Grid de productos */}
      {store.products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <Package size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            Esta tienda aún no tiene productos publicados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {store.products.map((product) => {
            const cover = product.images[0]?.url
            return (
              <Link
                key={product.id}
                href={`/shop/${store.slug}/${product.slug}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#D98A4F]/40 transition-all"
              >
                <div className="relative h-40 sm:h-44 bg-gray-100">
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
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    ${product.price.toLocaleString('es-CO')}
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
