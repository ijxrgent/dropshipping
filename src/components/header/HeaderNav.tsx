//src/components/header/HeaderNav.tsx
'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'

const CATEGORIES = [
  { label: 'Mujer', href: '/categoria/mujer' },
  { label: 'Hombre', href: '/categoria/hombre' },
  { label: 'Artesanías', href: '/categoria/artesanias' },
  { label: 'Accesorios', href: '/categoria/accesorios' },
  { label: 'Calzado', href: '/categoria/calzado' },
]

export default function HeaderNav() {
  return (
    <nav
      aria-label="Navegación secundaria"
      className="hidden md:block border-t border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-center md:justify-between">
        {/* Izquierda: categorías + ofertas */}
        <ul className="hidden md:flex items-center gap-1">
          {CATEGORIES.map((cat) => (
            <li key={cat.href}>
              <Link
                href={cat.href}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                {cat.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/ofertas"
              className="px-3 py-1 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              🔥 Ofertas
            </Link>
          </li>
        </ul>

        {/* Derecha: Mis compras + notificaciones */}
        <div className="flex items-center gap-1">
          <Link
            href="/mis-compras"
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Mis compras
          </Link>

          <Link
            href="/notificaciones"
            aria-label="Notificaciones"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} className="text-gray-600" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
