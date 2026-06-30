'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Minus,
  Plus,
  Trash2,
  Loader2,
  ShoppingCart,
  Package,
} from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'
import { useCartCount } from '@/components/header/CartCountProvider'

interface CartItemData {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    stock: number
    images: { url: string }[]
    store: { name: string; slug: string }
  }
}

export default function CartView() {
  const router = useRouter()
  const { refreshCount } = useCartCount()
  const [items, setItems] = useState<CartItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadCart() {
      setLoading(true)

      const res = await fetch('/api/cart')
      const data = await res.json()

      setItems(data)
      setLoading(false)
    }

    loadCart()
  }, [])

  async function updateQuantity(
    itemId: string,
    newQuantity: number,
    stock: number
  ) {
    if (newQuantity < 1 || newQuantity > stock) return
    setUpdatingId(itemId)

    await fetch(`/api/cart/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQuantity }),
    })

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
    refreshCount()
    setUpdatingId(null)
  }

  async function removeItem(itemId: string) {
    setUpdatingId(itemId)
    await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((item) => item.id !== itemId))
    refreshCount()
    setUpdatingId(null)
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
        <ShoppingCart size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 mb-4">Tu carrito está vacío</p>
        <Link
          href="/"
          className="inline-block px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Explorar productos
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de items */}
      <div className="lg:col-span-2 space-y-3">
        {items.map((item) => {
          const cover = item.product.images[0]?.url
          const subtotal = item.product.price * item.quantity

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4"
            >
              {/* Imagen */}
              <Link
                href={`/shop/${item.product.store.slug}/${item.product.slug}`}
                className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0"
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={withCloudinaryTransform(
                      cover,
                      'c_fill,g_auto,w_160,h_160,f_auto,q_auto'
                    )}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={18} className="text-gray-300" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/shop/${item.product.store.slug}/${item.product.slug}`}
                  className="text-sm font-medium text-gray-900 hover:text-teal-600 transition-colors line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.product.store.name}
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1.5">
                  ${item.product.price.toLocaleString('es-CO')}
                </p>

                {/* Controles */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1,
                          item.product.stock
                        )
                      }
                      disabled={item.quantity <= 1 || updatingId === item.id}
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-xs font-medium text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1,
                          item.product.stock
                        )
                      }
                      disabled={
                        item.quantity >= item.product.stock ||
                        updatingId === item.id
                      }
                      className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={updatingId === item.id}
                    className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    {updatingId === item.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    Quitar
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">
                  ${subtotal.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Resumen */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Resumen del pedido
          </h2>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Productos ({items.reduce((s, i) => s + i.quantity, 0)})</span>
            <span>${total.toLocaleString('es-CO')}</span>
          </div>

          <div className="border-t border-gray-100 pt-3 mt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">
              ${total.toLocaleString('es-CO')}
            </span>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full h-11 mt-4 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Ir a pagar
          </button>
        </div>
      </div>
    </div>
  )
}
