'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Loader2,
  ShieldCheck,
  ShieldOff,
  ChevronDown,
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  isActive: boolean
  createdAt: string
}

const ROLE_COLORS: Record<string, string> = {
  BUYER: 'bg-gray-100 text-gray-700',
  SELLER: 'bg-teal-100 text-teal-700',
  ADMIN: 'bg-blue-100 text-blue-700',
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter !== 'ALL') params.set('role', roleFilter)

    const res = await fetch(`/api/admin/usuarios?${params}`)
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }, [search, roleFilter])

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timeout)
  }, [fetchUsers])

  async function toggleActive(user: User) {
    setUpdating(user.id)
    await fetch(`/api/admin/usuarios/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    })
    await fetchUsers()
    setUpdating(null)
  }

  async function changeRole(user: User, role: string) {
    setUpdating(user.id)
    await fetch(`/api/admin/usuarios/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    await fetchUsers()
    setUpdating(null)
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona los usuarios del marketplace
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 pr-8 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white appearance-none cursor-pointer"
        >
          <option value="ALL">Todos los roles</option>
          <option value="BUYER">Compradores</option>
          <option value="SELLER">Vendedores</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No se encontraron usuarios
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">
                    Usuario
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">
                    Rol
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">
                    Estado
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">
                    Registro
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-50 transition-colors ${
                      !user.isActive
                        ? 'bg-gray-50 opacity-60'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Usuario */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rol con selector */}
                    <td className="px-5 py-3">
                      <div className="relative inline-block">
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user, e.target.value)}
                          disabled={
                            updating === user.id || user.role === 'ADMIN'
                          }
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer appearance-none pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed ${ROLE_COLORS[user.role]}`}
                        >
                          <option value="BUYER">Comprador</option>
                          <option value="SELLER">Vendedor</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <ChevronDown
                          size={11}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60"
                        />
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('es-CO')}
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end">
                        {updating === user.id ? (
                          <Loader2
                            size={16}
                            className="animate-spin text-gray-400"
                          />
                        ) : (
                          <button
                            onClick={() => toggleActive(user)}
                            disabled={user.role === 'ADMIN'}
                            title={
                              user.role === 'ADMIN'
                                ? 'No puedes suspender un admin'
                                : user.isActive
                                  ? 'Suspender usuario'
                                  : 'Reactivar usuario'
                            }
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                              user.isActive
                                ? 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                                : 'hover:bg-green-50 text-gray-400 hover:text-green-600'
                            }`}
                          >
                            {user.isActive ? (
                              <ShieldOff size={16} />
                            ) : (
                              <ShieldCheck size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
