'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="w-full flex items-center justify-center gap-2 h-11 border border-gray-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
    >
      <LogOut size={16} />
      Cerrar sesión
    </button>
  )
}
