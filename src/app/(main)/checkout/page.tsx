import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import CheckoutView from '@/components/checkout/CheckoutView'

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Finalizar compra</h1>
      <CheckoutView />
    </main>
  )
}
