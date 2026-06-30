import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Package, User } from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

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

export default async function SellerOrdersPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
  })
  if (!store) redirect('/dashboard/seller-setup')

  // Trae solo los OrderItem que pertenecen a productos de ESTA tienda,
  // agrupados por su Order original (un pedido puede tener productos de otras tiendas también)
  const orderItems = await prisma.orderItem.findMany({
    where: { product: { storeId: store.id } },
    orderBy: { order: { createdAt: 'desc' } },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          address: true,
          createdAt: true,
          buyer: { select: { name: true, email: true } },
        },
      },
      product: {
        select: {
          name: true,
          images: { take: 1, orderBy: { order: 'asc' }, select: { url: true } },
        },
      },
    },
  })

  // Ingresos netos totales (lo que realmente recibe el vendedor, ya sin comisión)
  const netRevenue = orderItems.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity - item.commission),
    0
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">Ventas de tu tienda</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Ingresos netos totales</p>
          <p className="text-lg font-bold text-gray-900">
            ${netRevenue.toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      {orderItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <Package size={28} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Aún no tienes ventas</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {orderItems.map((item) => {
            const cover = item.product.images[0]?.url
            const netAmount = item.unitPrice * item.quantity - item.commission

            return (
              <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                {/* Imagen del producto */}
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={withCloudinaryTransform(
                        cover,
                        'c_fill,g_auto,w_100,h_100,f_auto,q_auto'
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

                {/* Info del producto y comprador */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.product.name}{' '}
                    <span className="text-gray-400">x{item.quantity}</span>
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <User size={11} /> {item.order.buyer.name}
                  </p>
                </div>

                {/* Fecha */}
                <div className="text-xs text-gray-400 hidden sm:block flex-shrink-0">
                  {new Date(item.order.createdAt).toLocaleDateString('es-CO')}
                </div>

                {/* Montos */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    ${(item.unitPrice * item.quantity).toLocaleString('es-CO')}
                  </p>
                  <p className="text-xs text-gray-400">
                    Neto:{' '}
                    <span className="text-teal-600 font-medium">
                      ${netAmount.toLocaleString('es-CO')}
                    </span>
                  </p>
                </div>

                {/* Estado */}
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[item.order.status]}`}
                >
                  {STATUS_LABELS[item.order.status]}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
