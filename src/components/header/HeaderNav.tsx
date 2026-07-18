'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'

interface Category {
  name: string
  slug: string
}

interface HeaderNavProps {
  categories: Category[]
}

export default function HeaderNav({ categories }: HeaderNavProps) {
  return (
    <nav
      aria-label="Navegación secundaria"
      className="hidden md:block border-t border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between">
        <ul className="flex items-center gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <li key={cat.slug} className="flex-shrink-0">
              <Link
                href={`/categoria/${cat.slug}`}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            </li>
          ))}
          <li className="flex-shrink-0">
            <Link
              href="/ofertas"
              className="px-3 py-1 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              🔥 Ofertas
            </Link>
          </li>
        </ul>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            href="/orders"
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
