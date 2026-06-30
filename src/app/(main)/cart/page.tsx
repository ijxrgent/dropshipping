import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import CartView from '@/components/cart/CartView'

export default async function CartPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Tu carrito</h1>
      <CartView />
    </main>
  )
}
