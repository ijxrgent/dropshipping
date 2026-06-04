import { prisma } from '@/lib/prisma'
import { Users, Store, ShoppingBag, TrendingUp } from 'lucide-react'

async function getMetrics() {
  const [totalUsers, totalStores, totalOrders, totalRevenue] =
    await Promise.all([
      prisma.user.count(),
      prisma.store.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: 'PAID' } }),
      prisma.orderItem.aggregate({
        _sum: { commission: true },
      }),
    ])

  return {
    totalUsers,
    totalStores,
    totalOrders,
    totalRevenue: totalRevenue._sum.commission ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const metrics = await getMetrics()

  const cards = [
    {
      label: 'Usuarios registrados',
      value: metrics.totalUsers.toLocaleString('es-CO'),
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Tiendas activas',
      value: metrics.totalStores.toLocaleString('es-CO'),
      icon: Store,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      label: 'Órdenes pagadas',
      value: metrics.totalOrders.toLocaleString('es-CO'),
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Comisiones generadas',
      value: `$${metrics.totalRevenue.toLocaleString('es-CO')}`,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Panel de administración
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen general del marketplace
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
            >
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Órdenes recientes */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Órdenes recientes
          </h2>
        </div>
        <RecentOrders />
      </div>
    </div>
  )
}

async function RecentOrders() {
  const orders = await prisma.order.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    where: { status: 'PAID' },
    include: {
      buyer: { select: { name: true, email: true } },
      orderItems: { select: { unitPrice: true, quantity: true } },
    },
  })

  if (orders.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-gray-400">
        No hay órdenes aún
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">
              Comprador
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">
              Total
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">
              Estado
            </th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td className="px-5 py-3">
                <p className="font-medium text-gray-900">{order.buyer.name}</p>
                <p className="text-xs text-gray-400">{order.buyer.email}</p>
              </td>
              <td className="px-5 py-3 font-medium text-gray-900">
                ${order.total.toLocaleString('es-CO')}
              </td>
              <td className="px-5 py-3">
                <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Pagada
                </span>
              </td>
              <td className="px-5 py-3 text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('es-CO')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
