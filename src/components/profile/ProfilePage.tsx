'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Loader2,
  Camera,
  Check,
  X,
  ChevronRight,
  Package,
  Store,
  Settings,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  phone: string | null
  avatarUrl: string | null
  createdAt: string
}

interface RecentOrder {
  id: string
  total: number
  status: string
  createdAt: string
  orderItems: { product: { name: string } }[]
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-amber-600',
  PAID: 'text-blue-600',
  SHIPPED: 'text-purple-600',
  DELIVERED: 'text-green-600',
  CANCELLED: 'text-red-600',
}

const ROLE_LABELS: Record<string, string> = {
  BUYER: 'Comprador',
  SELLER: 'Vendedor',
  ADMIN: 'Administrador',
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  // Edit states
  const [editingName, setEditingName] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoFeedback, setInfoFeedback] = useState<{
    ok: boolean
    msg: string
  } | null>(null)

  // Password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<{
    ok: boolean
    msg: string
  } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)

        // Profile fetch
        const profileRes = await fetch('/api/profile')
        console.log('📊 Profile Status:', profileRes.status)
        console.log(
          '📊 Profile Headers:',
          Object.fromEntries(profileRes.headers)
        )

        const profileText = await profileRes.text()
        console.log('📊 Profile Body (raw):', profileText)

        // Intentar parsear el profile
        let profileData
        try {
          profileData = JSON.parse(profileText)
          console.log('✅ Profile parsed successfully:', profileData)
        } catch (parseError) {
          console.error('❌ Error parsing profile:', parseError)
          console.log('⚠️ Profile text was not valid JSON:', profileText)
        }

        // Orders fetch
        const ordersRes = await fetch('/api/orders/recent')
        console.log('📦 Orders Status:', ordersRes.status)
        console.log('📦 Orders Headers:', Object.fromEntries(ordersRes.headers))

        const ordersText = await ordersRes.text()
        console.log('📦 Orders Body (raw):', ordersText)

        // Intentar parsear las orders
        let ordersData
        try {
          ordersData = JSON.parse(ordersText)
          console.log('✅ Orders parsed successfully:', ordersData)
        } catch (parseError) {
          console.error('❌ Error parsing orders:', parseError)
          console.log('⚠️ Orders text was not valid JSON:', ordersText)
        }

        // Solo actualizar el estado si ambas respuestas fueron exitosas
        if (profileRes.ok && ordersRes.ok && profileData && ordersData) {
          setUser(profileData)
          setName(profileData.name)
          setPhone(profileData.phone ?? '')
          setOrders(ordersData)
          console.log('✅ State updated successfully')
        } else {
          console.error('❌ One or both requests failed')
          if (!profileRes.ok)
            console.error('Profile failed with status:', profileRes.status)
          if (!ordersRes.ok)
            console.error('Orders failed with status:', ordersRes.status)
        }
      } catch (error) {
        console.error('🔥 Unexpected error in load function:', error)
      } finally {
        setLoading(false)
        console.log('🔄 Loading set to false')
      }
    }

    load()
  }, [])

  async function saveInfo() {
    setSavingInfo(true)
    setInfoFeedback(null)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    })
    const data = await res.json()
    if (res.ok) {
      setUser((prev) =>
        prev ? { ...prev, name: data.name, phone: data.phone } : prev
      )
      setInfoFeedback({ ok: true, msg: 'Guardado correctamente' })
      setEditingName(false)
      setEditingPhone(false)
      router.refresh()
    } else {
      setInfoFeedback({ ok: false, msg: data.error ?? 'Error al guardar' })
    }
    setSavingInfo(false)
  }

  async function handleAvatarUploaded(url: string) {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarUrl: url }),
    })
    if (res.ok) {
      setUser((prev) => (prev ? { ...prev, avatarUrl: url } : prev))
      router.refresh()
    }
  }

  async function savePassword() {
    setPasswordFeedback(null)
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ ok: false, msg: 'Las contraseñas no coinciden' })
      return
    }
    setSavingPassword(true)
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    if (res.ok) {
      setPasswordFeedback({
        ok: true,
        msg: 'Contraseña actualizada correctamente',
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setPasswordFeedback({
        ok: false,
        msg: data.error ?? 'Error al cambiar contraseña',
      })
    }
    setSavingPassword(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24 sm:pb-8 space-y-4">
      {/* Avatar y nombre */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-blue-600 overflow-hidden flex items-center justify-center">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-lg font-bold">{initials}</span>
              )}
            </div>
            {/* Botón de cámara sobre el avatar */}
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer">
              <Camera size={12} color="white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Reutiliza la lógica de LogoUploader — abre selector directo
                    const reader = new FileReader()
                    reader.onload = async () => {
                      // Sube directo sin cropper para avatar (más simple)
                      const formData = new FormData()
                      formData.append('file', file)
                      formData.append(
                        'upload_preset',
                        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
                      )
                      formData.append('folder', 'modaguajira/avatars')
                      const res = await fetch(
                        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                        { method: 'POST', body: formData }
                      )
                      const data = await res.json()
                      if (data.secure_url) handleAvatarUploaded(data.secure_url)
                    }
                    reader.readAsDataURL(file)
                    e.target.value = ''
                  }
                }}
              />
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
      </div>

      {/* Información personal */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Información personal
        </h2>

        {infoFeedback && (
          <p
            className={`text-xs mb-3 ${infoFeedback.ok ? 'text-green-600' : 'text-red-600'}`}
          >
            {infoFeedback.msg}
          </p>
        )}

        {/* Nombre */}
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1">Nombre</p>
          {editingName ? (
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="flex-1 h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button
                onClick={saveInfo}
                disabled={savingInfo}
                className="w-9 h-9 flex items-center justify-center bg-gray-900 rounded-lg text-white"
              >
                {savingInfo ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
              </button>
              <button
                onClick={() => {
                  setEditingName(false)
                  setName(user.name)
                }}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-900">{user.name}</p>
              <button
                onClick={() => setEditingName(true)}
                className="text-xs text-gray-400 hover:text-gray-700"
              >
                Editar
              </button>
            </div>
          )}
        </div>

        {/* Email — no editable */}
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1">Email</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Teléfono */}
        <div>
          <p className="text-xs text-gray-400 mb-1">Teléfono</p>
          {editingPhone ? (
            <div className="flex gap-2">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoFocus
                placeholder="+57 300 0000000"
                className="flex-1 h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button
                onClick={saveInfo}
                disabled={savingInfo}
                className="w-9 h-9 flex items-center justify-center bg-gray-900 rounded-lg text-white"
              >
                {savingInfo ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
              </button>
              <button
                onClick={() => {
                  setEditingPhone(false)
                  setPhone(user.phone ?? '')
                }}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-900">
                {user.phone || (
                  <span className="text-gray-400">No agregado</span>
                )}
              </p>
              <button
                onClick={() => setEditingPhone(true)}
                className="text-xs text-gray-400 hover:text-gray-700"
              >
                {user.phone ? 'Editar' : 'Agregar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Cambiar contraseña
        </h2>

        {passwordFeedback && (
          <p
            className={`text-xs mb-3 ${passwordFeedback.ok ? 'text-green-600' : 'text-red-600'}`}
          >
            {passwordFeedback.msg}
          </p>
        )}

        <div className="space-y-3">
          {[
            {
              value: currentPassword,
              set: setCurrentPassword,
              label: 'Contraseña actual',
            },
            {
              value: newPassword,
              set: setNewPassword,
              label: 'Nueva contraseña',
            },
            {
              value: confirmPassword,
              set: setConfirmPassword,
              label: 'Confirmar nueva contraseña',
            },
          ].map(({ value, set, label }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full h-9 px-3 pr-9 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPasswords((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-400"
            >
              {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
              {showPasswords ? 'Ocultar' : 'Mostrar'} contraseñas
            </button>
          </div>

          <button
            onClick={savePassword}
            disabled={
              savingPassword ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="w-full h-10 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {savingPassword && <Loader2 size={14} className="animate-spin" />}
            Actualizar contraseña
          </button>
        </div>
      </div>

      {/* Mis pedidos recientes — solo BUYER */}
      {user.role === 'BUYER' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Mis pedidos</h2>
            <Link
              href="/orders"
              className="text-xs text-gray-400 hover:text-gray-700"
            >
              Ver todos
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Package size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Aún no has hecho pedidos</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {order.orderItems[0]?.product.name}
                        {order.orderItems.length > 1 &&
                          ` +${order.orderItems.length - 1} más`}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${STATUS_COLORS[order.status]}`}
                      >
                        {STATUS_LABELS[order.status]}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 flex-shrink-0">
                      ${order.total.toLocaleString('es-CO')}
                    </p>
                    <ChevronRight
                      size={14}
                      className="text-gray-300 flex-shrink-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Accesos rápidos según rol */}
      {user.role === 'SELLER' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
        </div>
      )}

      {user.role === 'ADMIN' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
        </div>
      )}

      {/* Cerrar sesión */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="w-full flex items-center justify-center gap-2 h-11 border border-gray-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </main>
  )
}
