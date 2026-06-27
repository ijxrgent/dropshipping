//src/app/(main)/dashboard/admin/shops/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Loader2,
  ShieldCheck,
  ShieldOff,
  Store as StoreIcon,
} from 'lucide-react'

interface Shop {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  createdAt: string
  user: { name: string; email: string }
  _count: { products: number }
  subscriptions: { plan: string; status: string; endDate: string }[]
}

const PLAN_LABELS: Record<string, string> = {
  STARTER: 'Starter',
  PRO: 'Pro',
  BUSINESS: 'Business',
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchShops = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)

    const res = await fetch(`/api/admin/shops?${params}`)
    const data = await res.json()
    setShops(data)
    setLoading(false)
  }, [search])

  useEffect(() => {
    const timeout = setTimeout(fetchShops, 300)
    return () => clearTimeout(timeout)
  }, [fetchShops])

  async function toggleActive(shop: Shop) {
    setUpdating(shop.id)
    await fetch(`/api/admin/shops/${shop.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !shop.isActive }),
    })
    await fetchShops()
    setUpdating(null)
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Tiendas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona las tiendas de los vendedores
        </p>
      </div>

      {/* Buscador */}
      <div className="relative max-w-sm mb-5">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Buscar tienda o vendedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Grid de tiendas */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-sm text-gray-400">
          No hay tiendas registradas aún
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {shops.map((shop) => {
            const activeSub = shop.subscriptions[0]
            return (
              <div
                key={shop.id}
                className={`bg-white rounded-xl border p-5 transition-opacity ${
                  shop.isActive
                    ? 'border-gray-200'
                    : 'border-gray-200 opacity-60'
                }`}
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <StoreIcon size={18} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {shop.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      /{shop.slug}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      shop.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {shop.isActive ? 'Activa' : 'Suspendida'}
                  </span>
                </div>

                {/* Descripción */}
                {shop.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {shop.description}
                  </p>
                )}

                {/* Info del vendedor */}
                <div className="text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
                  <p className="font-medium text-gray-700">{shop.user.name}</p>
                  <p className="text-gray-400">{shop.user.email}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Productos</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {shop._count.products}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Plan</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {activeSub ? PLAN_LABELS[activeSub.plan] : 'Sin plan'}
                    </p>
                  </div>
                </div>

                {/* Acción */}
                <button
                  onClick={() => toggleActive(shop)}
                  disabled={updating === shop.id}
                  className={`w-full flex items-center justify-center gap-2 h-9 rounded-lg text-sm font-medium transition-colors ${
                    shop.isActive
                      ? 'border border-red-200 text-red-600 hover:bg-red-50'
                      : 'border border-green-200 text-green-600 hover:bg-green-50'
                  } disabled:opacity-50`}
                >
                  {updating === shop.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : shop.isActive ? (
                    <ShieldOff size={14} />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  {shop.isActive ? 'Suspender tienda' : 'Reactivar tienda'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
