'use client'

import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS } from '@/utils/profileConstants'

interface RecentOrder {
  id: string
  total: number
  status: string
  createdAt: string
  orderItems: { product: { name: string } }[]
}

interface RecentOrdersProps {
  orders: RecentOrder[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">Mis pedidos</h2>
        <Link
          href="/orders"
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          Ver todos
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <Package size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400">Aún no has hecho pedidos</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href="/orders"
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {order.orderItems[0]?.product.name}
                    {order.orderItems.length > 1 &&
                      ` +${order.orderItems.length - 1} más`}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status]}
                  </p>
                </div>
                <p className="text-xs font-semibold text-gray-900 flex-shrink-0">
                  ${order.total.toLocaleString('es-CO')}
                </p>
                <ChevronRight
                  size={14}
                  className="text-gray-300 flex-shrink-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
