'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  Store,
  Tag,
  ShoppingBag,
  Image,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Métricas', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Usuarios', href: '/dashboard/admin/users', icon: Users },
  { label: 'Tiendas', href: '/dashboard/admin/shops', icon: Store },
  { label: 'Categorías', href: '/dashboard/admin/categories', icon: Tag },
  { label: 'Órdenes', href: '/dashboard/admin/orders', icon: ShoppingBag },
  { label: 'Banners', href: '/dashboard/admin/banners', icon: Image },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-30
        flex flex-col bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-56'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-16 border-b border-gray-100 flex-shrink-0 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          {!collapsed && (
            <span className="font-bold text-gray-900 text-sm truncate">
              Riohacha<span className="text-blue-600">Market</span>
              <span className="ml-1.5 text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                Admin
              </span>
            </span>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden lg:flex"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={16} className="text-gray-500" />
            ) : (
              <ChevronLeft size={16} className="text-gray-500" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? label : undefined}
                    className={`
                      flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100 p-2 flex-shrink-0">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            title={collapsed ? 'Cerrar sesión' : undefined}
            className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar móvil */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 bg-white border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <span className="font-bold text-gray-900 text-sm">
            Moda<span className="text-blue-600">Guajira</span>
            <span className="ml-1.5 text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
              Admin
            </span>
          </span>
        </div>

        {/* Página */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
