'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { ProfileAvatar } from './ProfileAvatar'
import { PersonalInfo } from './PersonalInfo'
import { PasswordSection } from './PasswordSection'
import { RecentOrders } from './RecentOrders'
import { QuickActions } from './QuickActions'
import { SignOutButton } from './SignOutButton'
import { ROLE_LABELS } from '@/utils/profileConstants'

export function ProfilePage() {
  const { user, orders, loading, updateUser, router } = useProfile()
  const [infoFeedback, setInfoFeedback] = useState<{
    ok: boolean
    msg: string
  } | null>(null)
  const [passwordFeedback, setPasswordFeedback] = useState<{
    ok: boolean
    msg: string
  } | null>(null)

  const handleInfoSave = async (data: { name: string; phone: string }) => {
    setInfoFeedback(null)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()

    if (res.ok) {
      updateUser({ name: result.name, phone: result.phone })
      setInfoFeedback({ ok: true, msg: 'Guardado correctamente' })
      router.refresh()
    } else {
      setInfoFeedback({ ok: false, msg: result.error ?? 'Error al guardar' })
    }
  }

  const handlePasswordSave = async (data: {
    currentPassword: string
    newPassword: string
  }) => {
    setPasswordFeedback(null)
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()

    if (res.ok) {
      setPasswordFeedback({
        ok: true,
        msg: 'Contraseña actualizada correctamente',
      })
    } else {
      setPasswordFeedback({
        ok: false,
        msg: result.error ?? 'Error al cambiar contraseña',
      })
    }
  }

  const handleAvatarUpload = async (url: string) => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarUrl: url }),
    })
    if (res.ok) {
      updateUser({ avatarUrl: url })
      router.refresh()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
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
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            avatarUrl={user.avatarUrl}
            name={user.name}
            initials={initials}
            onAvatarUpload={handleAvatarUpload}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
      </div>

      <PersonalInfo
        name={user.name}
        email={user.email}
        phone={user.phone}
        onSave={handleInfoSave}
        feedback={infoFeedback}
      />

      <PasswordSection
        onSave={handlePasswordSave}
        feedback={passwordFeedback}
      />

      {user.role === 'BUYER' && <RecentOrders orders={orders} />}

      <QuickActions role={user.role} />

      <SignOutButton />
    </main>
  )
}
