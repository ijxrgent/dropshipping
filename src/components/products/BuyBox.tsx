'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, ShoppingCart, Zap, Loader2 } from 'lucide-react'

interface BuyBoxProps {
  productId: string
  price: number
  stock: number
  isLoggedIn: boolean
}

export default function BuyBox({
  productId,
  price,
  stock,
  isLoggedIn,
}: BuyBoxProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [loadingAction, setLoadingAction] = useState<'cart' | 'buy' | null>(
    null
  )
  const [feedback, setFeedback] = useState<string | null>(null)

  const subtotal = price * quantity
  const outOfStock = stock === 0

  function increment() {
    setQuantity((q) => Math.min(q + 1, stock))
  }
  function decrement() {
    setQuantity((q) => Math.max(q - 1, 1))
  }

  async function handleAddToCart() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    setLoadingAction('cart')
    setFeedback(null)

    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    })

    setLoadingAction(null)

    if (res.ok) {
      setFeedback('Agregado al carrito')
      router.refresh()
    } else {
      const data = await res.json()
      setFeedback(data.error ?? 'No se pudo agregar al carrito')
    }
  }

  async function handleBuyNow() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    setLoadingAction('buy')
    setFeedback(null)

    // Agrega al carrito y va directo al checkout
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    })

    setLoadingAction(null)

    if (res.ok) {
      router.push('/checkout')
    } else {
      const data = await res.json()
      setFeedback(data.error ?? 'No se pudo procesar la compra')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Precio */}
      <p className="text-2xl font-bold text-gray-900">
        ${price.toLocaleString('es-CO')}
      </p>

      {/* Stock */}
      <p
        className={`text-xs mt-1 ${outOfStock ? 'text-red-500' : 'text-gray-400'}`}
      >
        {outOfStock ? 'Sin stock disponible' : `${stock} disponibles`}
      </p>

      {!outOfStock && (
        <>
          {/* Selector de cantidad */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Cantidad</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={decrement}
                  disabled={quantity <= 1}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-medium text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={increment}
                  disabled={quantity >= stock}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Subtotal:{' '}
                <span className="font-semibold text-gray-900">
                  ${subtotal.toLocaleString('es-CO')}
                </span>
              </p>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <p className="mt-3 text-xs text-teal-600 font-medium">{feedback}</p>
          )}

          {/* Botones */}
          <div className="mt-5 space-y-2">
            <button
              onClick={handleBuyNow}
              disabled={loadingAction !== null}
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loadingAction === 'buy' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Zap size={15} />
              )}
              Comprar ahora
            </button>
            <button
              onClick={handleAddToCart}
              disabled={loadingAction !== null}
              className="w-full h-11 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loadingAction === 'cart' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShoppingCart size={15} />
              )}
              Agregar al carrito
            </button>
          </div>

          {!isLoggedIn && (
            <p className="mt-3 text-xs text-gray-400 text-center">
              Inicia sesión para comprar o agregar al carrito
            </p>
          )}
        </>
      )}
    </div>
  )
}
