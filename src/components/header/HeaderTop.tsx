'use client'

import Image from 'next/image'
import Link from 'next/link'

import LogoRM from '@/assets/logo_rm.webp'

import { ShoppingCart, Menu } from 'lucide-react'
import UserMenu from './UserMenu'
import { useCartCount } from './CartCountProvider'
import SearchBar from './SearchBar'

interface Session {
  user: { name: string; email: string; role: string } | null
}

interface HeaderTopProps {
  session: Session
  onMenuToggle: () => void
  isLoading: boolean
}

export default function HeaderTop({
  session,
  onMenuToggle,
  isLoading,
}: HeaderTopProps) {
  const { count: cartCount } = useCartCount()

  return (
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <Image
          src={LogoRM}
          alt="Logo"
          width={40}
          height={40}
          className="rounded-lg object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </Link>

      {/* Buscador — ocupa el espacio disponible */}
      <SearchBar />

      {/* Carrito y menú hamburguesa — solo móvil */}
      <div className="flex items-center gap-2 md:hidden">
        <Link
          href="/cart"
          aria-label="Carrito"
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ShoppingCart size={22} className="text-gray-900" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>
        <button
          onClick={onMenuToggle}
          aria-label="Abrir menú"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={22} className="text-gray-900" />
        </button>
      </div>

      {/* Acciones — escritorio */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        {isLoading ? (
          // Skeleton mientras carga la sesión
          <div className="w-24 h-9 bg-gray-100 rounded-lg animate-pulse" />
        ) : session.user ? (
          <UserMenu user={session.user} />
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-black-700 rounded-lg transition-colors"
            >
              Registrarse
            </Link>
          </>
        )}

        {/* Carrito — escritorio */}
        <Link
          href="/cart"
          aria-label="Carrito"
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors ml-1"
        >
          <ShoppingCart size={22} className="text-gray-900" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  )
}
