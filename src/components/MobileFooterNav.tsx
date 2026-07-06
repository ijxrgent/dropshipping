'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Store, ShoppingCart, User } from 'lucide-react'
import { useCartCount } from '@/components/header/CartCountProvider'

const NAV = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/products', label: 'Productos', icon: Store },
  { href: '/cart', label: 'Carrito', icon: ShoppingCart, showBadge: true },
  { href: '/profile', label: 'Perfil', icon: User },
]

export default function MobileFooterNav() {
  const pathname = usePathname()
  const { count } = useCartCount()

  // No mostrar en dashboards (admin/seller) — ellos tienen su propio sidebar
  if (pathname.startsWith('/dashboard')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 sm:hidden">
      <div className="grid grid-cols-4 h-14">
        {NAV.map(({ href, label, icon: Icon, showBadge }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 relative"
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={isActive ? 'text-gray-900' : 'text-gray-400'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {showBadge && count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>
              <span
                className="text-[10px]"
                style={{ color: isActive ? '#111' : '#9ca3af' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
