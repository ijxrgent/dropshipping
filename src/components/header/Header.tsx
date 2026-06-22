'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import HeaderTop from './HeaderTop'
import HeaderNav from './HeaderNav'
import MobileMenu from './MobileMenu'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount] = useState(0)
  const { data: session, status } = useSession()

  // Adapta la forma que espera HeaderTop y MobileMenu
  const sessionData = {
    user: session?.user
      ? {
          name: session.user.name ?? '',
          email: session.user.email ?? '',
          role: session.user.role ?? 'BUYER',
        }
      : null,
  }

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <HeaderTop
        session={sessionData}
        cartCount={cartCount}
        onMenuToggle={() => setMobileOpen((v) => !v)}
        isLoading={status === 'loading'}
      />
      <HeaderNav />
      {mobileOpen && (
        <MobileMenu
          session={sessionData}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </header>
  )
}
