'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'

interface PersonalInfoProps {
  name: string
  email: string
  phone: string | null
  onSave: (data: { name: string; phone: string }) => Promise<void>
  feedback?: { ok: boolean; msg: string } | null
}

// Componente auxiliar fuera del componente principal
interface InfoFieldProps {
  label: string
  value: string
  editing: boolean
  setEditing: (value: boolean) => void
  inputValue: string
  onInputChange: (value: string) => void
  placeholder: string
  saving: boolean
  onSave: () => void
  initialValue: string
  setInputValue: (value: string) => void
}

function InfoField({
  label,
  value,
  editing,
  setEditing,
  inputValue,
  onInputChange,
  placeholder,
  saving,
  onSave,
  initialValue,
  setInputValue,
}: InfoFieldProps) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {editing ? (
        <div className="flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            autoFocus
            placeholder={placeholder}
            className="flex-1 h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            onClick={onSave}
            disabled={saving}
            className="w-9 h-9 flex items-center justify-center bg-gray-900 rounded-lg text-white hover:bg-gray-800 transition-colors disabled:bg-gray-300"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
          </button>
          <button
            onClick={() => {
              setEditing(false)
              setInputValue(initialValue)
            }}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-900">
            {value || <span className="text-gray-400">No agregado</span>}
          </p>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            {value ? 'Editar' : 'Agregar'}
          </button>
        </div>
      )}
    </div>
  )
}

export function PersonalInfo({
  name: initialName,
  email,
  phone: initialPhone,
  onSave,
  feedback,
}: PersonalInfoProps) {
  const [editingName, setEditingName] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave({ name, phone })
    setSaving(false)
    setEditingName(false)
    setEditingPhone(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Información personal
      </h2>

      {feedback && (
        <p
          className={`text-xs mb-3 ${feedback.ok ? 'text-green-600' : 'text-red-600'}`}
        >
          {feedback.msg}
        </p>
      )}

      <InfoField
        label="Nombre"
        value={name}
        editing={editingName}
        setEditing={setEditingName}
        inputValue={name}
        onInputChange={setName}
        placeholder="Tu nombre"
        saving={saving}
        onSave={handleSave}
        initialValue={initialName}
        setInputValue={setName}
      />

      <div className="mb-3 last:mb-0">
        <p className="text-xs text-gray-400 mb-1">Email</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>

      <InfoField
        label="Teléfono"
        value={phone}
        editing={editingPhone}
        setEditing={setEditingPhone}
        inputValue={phone}
        onInputChange={setPhone}
        placeholder="+57 300 0000000"
        saving={saving}
        onSave={handleSave}
        initialValue={initialPhone || ''}
        setInputValue={setPhone}
      />
    </div>
  )
}
