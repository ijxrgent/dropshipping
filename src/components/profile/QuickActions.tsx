'use client'

import Link from 'next/link'
import { Store, Settings, ChevronRight } from 'lucide-react'

interface QuickActionsProps {
  role: 'BUYER' | 'SELLER' | 'ADMIN'
}

export function QuickActions({ role }: QuickActionsProps) {
  if (role === 'BUYER') return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {role === 'SELLER' && (
        <Link
          href="/dashboard/seller"
          className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <Store size={18} className="text-teal-600" />
          <span className="text-sm font-medium text-gray-900 flex-1">
            Mi tienda
          </span>
          <ChevronRight size={15} className="text-gray-300" />
        </Link>
      )}

      {role === 'ADMIN' && (
        <Link
          href="/dashboard/admin"
          className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
        >
          <Settings size={18} className="text-blue-600" />
          <span className="text-sm font-medium text-gray-900 flex-1">
            Panel de administración
          </span>
          <ChevronRight size={15} className="text-gray-300" />
        </Link>
      )}
    </div>
  )
}
