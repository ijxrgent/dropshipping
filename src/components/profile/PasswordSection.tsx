'use client'

import { useState } from 'react'
import { Loader2, Eye, EyeOff } from 'lucide-react'

interface PasswordSectionProps {
  onSave: (data: {
    currentPassword: string
    newPassword: string
  }) => Promise<void>
  feedback?: { ok: boolean; msg: string } | null
}

// Componente auxiliar fuera del componente principal
interface PasswordInputProps {
  label: string
  value: string
  setValue: (value: string) => void
  showPasswords: boolean
}

function PasswordInput({
  label,
  value,
  setValue,
  showPasswords,
}: PasswordInputProps) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <input
        type={showPasswords ? 'text' : 'password'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    </div>
  )
}

export function PasswordSection({ onSave, feedback }: PasswordSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      return
    }
    setSaving(true)
    await onSave({ currentPassword, newPassword })
    setSaving(false)
    if (!feedback?.ok) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const isDisabled =
    saving ||
    !currentPassword ||
    !newPassword ||
    !confirmPassword ||
    newPassword !== confirmPassword

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hover:text-gray-700 transition-colors"
        >
          Cambiar contraseña
          <span className="ml-2 text-xs font-normal text-gray-400 underline">
            {isExpanded ? 'ocultar' : 'mostrar'}
          </span>
        </button>
      </h2>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {feedback && (
            <p
              className={`text-xs ${feedback.ok ? 'text-green-600' : 'text-red-600'}`}
            >
              {feedback.msg}
            </p>
          )}

          <PasswordInput
            label="Contraseña actual"
            value={currentPassword}
            setValue={setCurrentPassword}
            showPasswords={showPasswords}
          />

          <PasswordInput
            label="Nueva contraseña"
            value={newPassword}
            setValue={setNewPassword}
            showPasswords={showPasswords}
          />

          <PasswordInput
            label="Confirmar nueva contraseña"
            value={confirmPassword}
            setValue={setConfirmPassword}
            showPasswords={showPasswords}
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
              {showPasswords ? 'Ocultar' : 'Mostrar'} contraseñas
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isDisabled}
            className="w-full h-10 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Actualizar contraseña
          </button>
        </div>
      )}
    </div>
  )
}
