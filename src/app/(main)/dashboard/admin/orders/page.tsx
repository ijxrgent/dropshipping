'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Loader2, ChevronDown, ChevronUp, Package } from 'lucide-react'

interface OrderItemDetail {
  id: string
  quantity: number
  unitPrice: number
  commission: number
  product: {
    name: string
    store: { name: string }
  }
}

interface Order {
  id: string
  total: number
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  address: string | null
  wompiRef: string | null
  createdAt: string
  buyer: { name: string; email: string }
  orderItems: OrderItemDetail[]
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter !== 'ALL') params.set('status', statusFilter)

    const res = await fetch(`/api/admin/orders?${params}`)
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => {
    const timeout = setTimeout(fetchOrders, 300)
    return () => clearTimeout(timeout)
  }, [fetchOrders])

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Órdenes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Supervisa todas las órdenes del marketplace
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar por comprador o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 pr-8 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white appearance-none cursor-pointer"
        >
          <option value="ALL">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="PAID">Pagadas</option>
          <option value="SHIPPED">Enviadas</option>
          <option value="DELIVERED">Entregadas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No se encontraron órdenes
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {orders.map((order) => {
              const isExpanded = expandedId === order.id
              return (
                <li key={order.id}>
                  {/* Fila resumen */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={16} className="text-gray-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {order.buyer.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {order.buyer.email}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-sm font-semibold text-gray-900">
                        ${order.total.toLocaleString('es-CO')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('es-CO')}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>

                    {isExpanded ? (
                      <ChevronUp
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                    )}
                  </button>

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <div className="px-5 pb-4 bg-gray-50">
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        {/* Info adicional */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-xs">
                          <div>
                            <p className="text-gray-400">
                              Total (visible en móvil)
                            </p>
                            <p className="font-medium text-gray-900 sm:hidden">
                              ${order.total.toLocaleString('es-CO')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Referencia de pago</p>
                            <p className="font-mono text-gray-700">
                              {order.wompiRef ?? '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Dirección de envío</p>
                            <p className="text-gray-700">
                              {order.address ?? 'No especificada'}
                            </p>
                          </div>
                        </div>

                        {/* Productos de la orden */}
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Productos ({order.orderItems.length})
                        </p>
                        <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0"
                            >
                              <div>
                                <p className="font-medium text-gray-800">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Vendido por {item.product.store.name} · x
                                  {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-800">
                                  $
                                  {(
                                    item.unitPrice * item.quantity
                                  ).toLocaleString('es-CO')}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Comisión: $
                                  {item.commission.toLocaleString('es-CO')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
