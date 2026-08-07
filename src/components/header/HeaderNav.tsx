'use client'

import Link from 'next/link'
import { Bell, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface Category {
  name: string
  slug: string
}

interface HeaderNavProps {
  categories: Category[]
}

export default function HeaderNav({ categories }: HeaderNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Definir categorías principales (las que siempre se muestran)
  const mainCategories = ['Mujer', 'Hombre', 'Artesanías']

  // Filtrar categorías principales y el resto para el dropdown
  const mainCategoriesList = categories.filter((cat) =>
    mainCategories.includes(cat.name)
  )

  const otherCategories = categories.filter(
    (cat) => !mainCategories.includes(cat.name)
  )

  return (
    <nav
      aria-label="Navegación secundaria"
      className="hidden md:block border-t border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-between">
        <ul className="flex items-center gap-1">
          {/* Dropdown de Categorías */}
          <li className="flex-shrink-0 relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
            >
              Categorías
              <ChevronDown
                size={16}
                className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Menú desplegable */}
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] py-1 z-50">
                {otherCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categoria/${cat.slug}`}
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
                {otherCategories.length === 0 && (
                  <span className="block px-4 py-2 text-sm text-gray-400">
                    No hay más categorías
                  </span>
                )}
              </div>
            )}
          </li>

          {/* Categorías principales */}
          {mainCategoriesList.map((cat) => (
            <li key={cat.slug} className="flex-shrink-0">
              <Link
                href={`/categoria/${cat.slug}`}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            </li>
          ))}

          {/* Ofertas */}
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
