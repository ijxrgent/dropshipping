//src/components/header/UserMenu.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  User,
  Package,
  Store,
  LogOut,
  Settings,
} from 'lucide-react'
// import { signOut } from 'next-auth/react'  ← descomenta cuando tengas la sesión real

interface UserMenuProps {
  user: { name: string; email: string; role: string }
}

export default function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Cierra el dropdown si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const isSeller = user.role === 'SELLER'
  const isAdmin = user.role === 'ADMIN'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Menú de usuario"
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* Avatar con iniciales */}
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <span className="hidden lg:block text-sm font-medium text-gray-900 max-w-[120px] truncate">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Info del usuario */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-900 text-white">
              {user.role === 'SELLER'
                ? 'Vendedor'
                : user.role === 'ADMIN'
                  ? 'Admin'
                  : 'Comprador'}
            </span>
          </div>

          {/* Links según rol */}
          <div className="py-1">
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <User size={15} className="text-gray-400" /> Mi perfil
            </Link>

            <Link
              href="/mis-compras"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <Package size={15} className="text-gray-400" /> Mis compras
            </Link>

            {isSeller && (
              <Link
                href="/dashboard/seller"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Store size={15} className="text-gray-400" /> Mi tienda
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/dashboard/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Settings size={15} className="text-gray-400" /> Panel admin
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => {
                setOpen(false)
                // signOut({ callbackUrl: '/' })  ← descomenta cuando tengas la sesión real
                alert('signOut() — conectar con NextAuth')
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} className="text-red-500" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
