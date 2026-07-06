//src/components/header/MobileMenu.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'

import LogoRM from '@/assets/logo_rm.webp'

import { X, Bell, Package, Store, Settings, LogOut, User } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface Session {
  user: { name: string; email: string; role: string } | null
}

interface MobileMenuProps {
  session: Session
  onClose: () => void
}

const CATEGORIES = [
  { label: 'Mujer', href: '/categoria/mujer' },
  { label: 'Hombre', href: '/categoria/hombre' },
  { label: 'Artesanías', href: '/categoria/artesanias' },
  { label: 'Accesorios', href: '/categoria/accesorios' },
  { label: 'Calzado', href: '/categoria/calzado' },
]

export default function MobileMenu({ session, onClose }: MobileMenuProps) {
  const user = session.user
  const isSeller = user?.role === 'SELLER'
  const isAdmin = user?.role === 'ADMIN'

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl flex flex-col md:hidden overflow-y-auto">
        {/* Cabecera del panel */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
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
            <span className="font-bold text-lg text-gray-900">
              Riohacha Market
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Usuario logueado */}
        {user ? (
          <div className="px-4 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 border-b border-gray-200 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={onClose}
              className="w-full py-2.5 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="w-full py-2.5 text-center text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              Registrarse
            </Link>
          </div>
        )}

        {/* Categorías */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Categorías
          </p>
          <ul className="space-y-0.5">
            {CATEGORIES.map((cat) => (
              <li key={cat.href}>
                <Link
                  href={cat.href}
                  onClick={onClose}
                  className="block px-2 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/ofertas"
                onClick={onClose}
                className="block px-2 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                🔥 Ofertas
              </Link>
            </li>
          </ul>
        </div>

        {/* Links de usuario */}
        {user && (
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Mi cuenta
            </p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/perfil"
                  onClick={onClose}
                  className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <User size={15} className="text-gray-500" /> Mi perfil
                </Link>
              </li>
              <li>
                <Link
                  href="/mis-compras"
                  onClick={onClose}
                  className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Package size={15} className="text-gray-500" /> Mis compras
                </Link>
              </li>
              <li>
                <Link
                  href="/notificaciones"
                  onClick={onClose}
                  className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell size={15} className="text-gray-500" /> Notificaciones
                </Link>
              </li>
              {isSeller && (
                <li>
                  <Link
                    href="/dashboard/seller"
                    onClick={onClose}
                    className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Store size={15} className="text-gray-500" /> Mi tienda
                  </Link>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link
                    href="/dashboard/admin"
                    onClick={onClose}
                    className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings size={15} className="text-gray-500" /> Panel admin
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Logout */}
        {user && (
          <div className="px-4 py-3 mt-auto border-t border-gray-200">
            <button
              onClick={() => {
                onClose()
                signOut({ callbackUrl: '/' })
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={15} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </>
  )
}
