'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MapPin, ShieldCheck, Package } from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

interface CartItemData {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: { url: string }[]
    store: { name: string }
  }
}

export default function CheckoutView() {
  const router = useRouter()
  const [items, setItems] = useState<CartItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [address, setAddress] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  async function handleConfirm() {
    if (address.trim().length < 5) {
      setError('Ingresa una dirección de envío válida')
      return
    }

    setProcessing(true)
    setError(null)

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'No se pudo procesar el pedido')
      setProcessing(false)
      return
    }

    router.push(`/checkout/success?orderId=${data.id}`)
  }

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
        <Package size={32} className="text-gray-300 mx-auto mb-3" />
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
      {/* Columna principal */}
      <div className="lg:col-span-2 space-y-5">
        {/* Dirección de envío */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-teal-600" />
            <h2 className="text-sm font-semibold text-gray-900">
              Dirección de envío
            </h2>
          </div>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, número, barrio, ciudad..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
          />
        </div>

        {/* Productos del pedido */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Productos
          </h2>
          <div className="space-y-3">
            {items.map((item) => {
              const cover = item.product.images[0]?.url
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={withCloudinaryTransform(
                          cover,
                          'c_fill,g_auto,w_120,h_120,f_auto,q_auto'
                        )}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={14} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.product.store.name} · x{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    $
                    {(item.product.price * item.quantity).toLocaleString(
                      'es-CO'
                    )}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Método de pago — simulado */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} className="text-teal-600" />
            <h2 className="text-sm font-semibold text-gray-900">
              Método de pago
            </h2>
          </div>
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2.5">
            Pago simulado — la integración con Wompi (PSE, Nequi, tarjeta)
            estará disponible próximamente. Al confirmar, tu pedido se marcará
            como pagado para fines de prueba.
          </div>
        </div>
      </div>

      {/* Resumen y confirmación */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-20">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Resumen</h2>

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

          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={processing}
            className="w-full h-11 mt-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {processing && <Loader2 size={16} className="animate-spin" />}
            Confirmar pedido
          </button>
        </div>
      </div>
    </div>
  )
}
