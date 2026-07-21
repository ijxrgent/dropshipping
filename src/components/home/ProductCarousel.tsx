'use client'

import Link from 'next/link'
import { Package } from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

export interface FeaturedProduct {
  id: string
  name: string
  slug: string
  price: number // precio final
  originalPrice: number | null
  discount: number | null

  images: { url: string }[]
  store: {
    name: string
    slug: string
  }
}

export default function ProductCarousel({
  products,
}: {
  products: FeaturedProduct[]
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 py-10 text-center">
        <Package size={24} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Aún no hay productos publicados</p>
      </div>
    )
  }

  return (
    <div>
      {/* Scroll horizontal centrado:
          En móvil cada card ocupa calc(50% - 6px) → 2 cards visibles exactas
          En sm+ cada card tiene ancho fijo de 180px → se ven más cards */}
      <div className="flex justify-center">
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {products.map((product) => {
            console.log(product)
            const cover = product.images[0]?.url
            return (
              <Link
                key={product.id}
                href={`/shop/${product.store.slug}/${product.slug}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-none hover:shadow-md transition-shadow"
                // En móvil: 2 cards visibles (50% - mitad del gap)
                // En desktop: ancho fijo de 180px
                style={{
                  width: 'calc(50vw - 24px)',
                  maxWidth: '180px',
                  minWidth: '140px',
                }}
              >
                <div className="bg-gray-100" style={{ aspectRatio: '1/1' }}>
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={withCloudinaryTransform(
                        cover,
                        'c_fill,g_auto,w_320,h_320,f_auto,q_auto'
                      )}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  {/* Nombre */}
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {product.name}
                  </p>

                  {product.discount && product.originalPrice ? (
                    <>
                      {/* Precio original + descuento */}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[11px] text-gray-400 line-through">
                          ${product.originalPrice.toLocaleString('es-CO')}
                        </span>

                        <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          -{product.discount}%
                        </span>
                      </div>

                      {/* Precio final */}
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        ${product.price.toLocaleString('es-CO')}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      ${product.price.toLocaleString('es-CO')}
                    </p>
                  )}

                  {/* Tienda */}
                  <p className="text-xs text-gray-400 truncate mt-1">
                    {product.store.name}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Botón Ver más */}
      <div className="mt-4 text-center">
        <Link
          href="/products"
          className="inline-block px-5 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
        >
          Ver más productos
        </Link>
      </div>
    </div>
  )
}
