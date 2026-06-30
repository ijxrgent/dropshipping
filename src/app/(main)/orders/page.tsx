///src/app/(main)/orders/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Package, ChevronRight } from 'lucide-react'
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

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              images: {
                take: 1,
                orderBy: { order: 'asc' },
                select: { url: true },
              },
              store: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  })

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 py-20 text-center">
          <Package size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">
            Aún no has hecho ningún pedido
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Cabecera del pedido */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">
                    Pedido{' '}
                    <span className="font-mono text-gray-600">
                      {order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              {/* Productos del pedido */}
              <div className="p-5 space-y-3">
                {order.orderItems.map((item) => {
                  const cover = item.product.images[0]?.url
                  return (
                    <Link
                      key={item.id}
                      href={`/shop/${item.product.store.slug}/${item.product.slug}`}
                      className="flex items-center gap-3 hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                    >
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
                        {(item.unitPrice * item.quantity).toLocaleString(
                          'es-CO'
                        )}
                      </p>
                      <ChevronRight
                        size={14}
                        className="text-gray-300 flex-shrink-0"
                      />
                    </Link>
                  )
                })}
              </div>

              {/* Total */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Total del pedido</span>
                <span className="text-sm font-bold text-gray-900">
                  ${order.total.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
