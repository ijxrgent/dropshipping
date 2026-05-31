//src/components/header/Header.tsx
'use client'

import { useState } from 'react'
import HeaderTop from './HeaderTop'
import HeaderNav from './HeaderNav'
import MobileMenu from './MobileMenu'

// Simulación de sesión — reemplaza con: import { useSession } from 'next-auth/react'
const mockSession = {
  user: null as null | { name: string; email: string; role: string },
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount] = useState(0)

  // Reemplaza esto con: const { data: session } = useSession()
  const session = mockSession

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <HeaderTop
        session={session}
        cartCount={cartCount}
        onMenuToggle={() => setMobileOpen((v) => !v)}
      />
      <HeaderNav />
      {mobileOpen && (
        <MobileMenu session={session} onClose={() => setMobileOpen(false)} />
      )}
    </header>
  )
}
