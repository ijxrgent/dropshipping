'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Package, Loader2 } from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: { url: string }[]
  store: { name: string; slug: string }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  async function loadMore(cursor?: string) {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)

    const url = cursor ? `/api/products?cursor=${cursor}` : '/api/products'
    const res = await fetch(url)
    const data = await res.json()

    setProducts((prev) => (cursor ? [...prev, ...data.items] : data.items))
    setNextCursor(data.nextCursor)
    setLoading(false)
    setInitialLoading(false)
    loadingRef.current = false
  }

  // Carga inicial
  useEffect(() => {
    loadMore()
  }, [])

  // Observer para scroll infinito
  useEffect(() => {
    loadMore()
  }, [])

  // Observer para scroll infinito
  useEffect(() => {
    const el = loaderRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          setNextCursor((cursor) => {
            if (cursor) loadMore(cursor)
            return cursor
          })
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <main className="max-w-7xl mx-auto px-4 pb-24 sm:pb-8 pt-6">
      <h1 className="font-bold text-gray-900 mb-5" style={{ fontSize: '18px' }}>
        Todos los productos
      </h1>

      {initialLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-gray-200 py-20 text-center">
          <Package size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            Aún no hay productos publicados
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((product) => {
              const cover = product.images[0]?.url
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.store.slug}/${product.slug}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-gray-100" style={{ aspectRatio: '1/1' }}>
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
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">
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

          {/* Trigger de scroll infinito */}
          <div
            ref={loaderRef}
            className="flex items-center justify-center py-8"
          >
            {loading && (
              <Loader2 size={22} className="animate-spin text-gray-400" />
            )}
            {!loading && !nextCursor && products.length > 0 && (
              <p className="text-xs text-gray-400">
                Ya viste todos los productos
              </p>
            )}
          </div>
        </>
      )}
    </main>
  )
}
