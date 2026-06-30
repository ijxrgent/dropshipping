import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Package, SearchX } from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = (q ?? '').trim()

  const products = query
    ? await prisma.product.findMany({
        where: {
          isPublished: true,
          store: { isActive: true },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { store: { name: { contains: query, mode: 'insensitive' } } },
            { category: { name: { contains: query, mode: 'insensitive' } } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: { take: 1, orderBy: { order: 'asc' }, select: { url: true } },
          store: { select: { name: true, slug: true } },
        },
      })
    : []

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-lg font-bold text-gray-900 mb-1">
        {query ? (
          <>Resultados para &ldquo;{query}&rdquo;</>
        ) : (
          'Buscar productos'
        )}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {query &&
          `${products.length} producto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
      </p>

      {!query ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <SearchX size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            Escribe algo en el buscador para empezar
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
          <SearchX size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            No encontramos productos que coincidan con tu búsqueda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const cover = product.images[0]?.url
            return (
              <Link
                key={product.id}
                href={`/shop/${product.store.slug}/${product.slug}`}
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
                  <p className="text-xs text-gray-400 truncate mt-0.5">
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
