import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { CheckCircle2, Package } from 'lucide-react'

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const session = await auth()
  const { orderId } = await searchParams

  if (!session?.user || !orderId) notFound()

  const order = await prisma.order.findUnique({
    where: { id: orderId, buyerId: session.user.id },
    include: {
      orderItems: {
        include: { product: { select: { name: true } } },
      },
    },
  })

  if (!order) notFound()

  return (
    <main className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={32} className="text-green-600" />
      </div>

      <h1 className="text-xl font-bold text-gray-900">¡Pedido confirmado!</h1>
      <p className="text-sm text-gray-500 mt-2">
        Tu pedido fue registrado correctamente. Pronto el vendedor preparará tu
        envío.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6 text-left">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <span className="text-xs text-gray-400">Número de pedido</span>
          <span className="text-xs font-mono text-gray-600">
            {order.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="space-y-2">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              <Package size={14} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 flex-1">
                {item.product.name} x{item.quantity}
              </span>
              <span className="font-medium text-gray-900">
                ${(item.unitPrice * item.quantity).toLocaleString('es-CO')}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            Total pagado
          </span>
          <span className="text-base font-bold text-gray-900">
            ${order.total.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Link
          href="/"
          className="flex-1 h-10 flex items-center justify-center border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Seguir comprando
        </Link>
        <Link
          href="/orders"
          className="flex-1 h-10 flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Ver mis pedidos
        </Link>
      </div>
    </main>
  )
}
