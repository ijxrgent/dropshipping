'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

export interface FeaturedProduct {
  id: string
  name: string
  slug: string
  price: number
  images: { url: string }[]
  store: { name: string; slug: string }
}

interface ProductCarouselProps {
  products: FeaturedProduct[]
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 'left' | 'right') {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -260 : 260,
      behavior: 'smooth',
    })
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 py-12 text-center">
        <Package size={28} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Aún no hay productos publicados</p>
      </div>
    )
  }

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((product) => {
          const cover = product.images[0]?.url
          return (
            <Link
              key={product.id}
              href={`/shop/${product.store.slug}/${product.slug}`}
              className="flex-shrink-0 w-44 sm:w-52 bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#D98A4F]/40 transition-all"
            >
              <div className="relative h-44 sm:h-48 bg-gray-100">
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
                    <Package size={24} className="text-gray-300" />
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

      {/* Controles — solo visibles en hover en desktop */}
      <button
        onClick={() => scroll('left')}
        aria-label="Desplazar a la izquierda"
        className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={15} className="text-gray-600" />
      </button>
      <button
        onClick={() => scroll('right')}
        aria-label="Desplazar a la derecha"
        className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={15} className="text-gray-600" />
      </button>
    </div>
  )
}
