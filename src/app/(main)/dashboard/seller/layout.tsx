// src/app/(main)/dashboard/seller/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import SellerSidebar from '@/components/dashboard/SellerSidebar'

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'SELLER') {
    redirect('/login')
  }

  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
  })

  // Si el vendedor no tiene tienda, lo mandamos al setup
  // (excepto si ya está en /dashboard/seller/setup, eso lo maneja la propia página)
  if (!store) {
    redirect('/dashboard/seller-setup')
  }

  return <SellerSidebar>{children}</SellerSidebar>
}
