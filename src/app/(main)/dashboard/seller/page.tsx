//src/app/(main)/dashboard/seller/page.tsx
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import StoreLogo from '@/components/upload/StoreLogo'
import { Package, ShoppingBag, TrendingUp } from 'lucide-react'

export default async function SellerDashboardPage() {
  const session = await auth()

  const store = await prisma.store.findUnique({
    where: { userId: session!.user.id },
    include: {
      _count: { select: { products: true } },
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  // El layout ya garantiza que store existe, pero TypeScript no lo sabe
  if (!store) return null

  const activeSub = store.subscriptions[0]

  const stats = await prisma.orderItem.aggregate({
    where: { product: { storeId: store.id } },
    _sum: { unitPrice: true, commission: true },
    _count: true,
  })

  return (
    <div>
      {/* Cabecera de la tienda */}
      <div className="flex items-center gap-4 mb-6">
        <StoreLogo logoUrl={store.logoUrl} storeName={store.name} size={56} />
        <div>
          <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
          <p className="text-sm text-gray-500">
            riohachamarket.com/tienda/{store.slug}
          </p>
        </div>
        <span
          className={`ml-auto text-xs font-medium px-3 py-1 rounded-full ${
            store.isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {store.isActive ? 'Tienda activa' : 'Tienda suspendida'}
        </span>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Package size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Productos publicados</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {store._count.products}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Ventas totales</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              {stats._count}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Ingresos netos</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              $
              {(
                (stats._sum.unitPrice ?? 0) - (stats._sum.commission ?? 0)
              ).toLocaleString('es-CO')}
            </p>
          </div>
        </div>
      </div>

      {/* Estado de suscripción */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Suscripción
        </h2>
        {activeSub ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Plan <span className="font-medium">{activeSub.plan}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Vence el{' '}
                {new Date(activeSub.endDate).toLocaleDateString('es-CO')}
              </p>
            </div>
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full ${
                activeSub.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {activeSub.status === 'ACTIVE' ? 'Activa' : 'Vencida'}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              No tienes una suscripción activa todavía
            </p>
            <a
              href="/dashboard/seller/subscription"
              className="text-sm font-medium text-teal-600 hover:underline"
            >
              Activar plan →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
