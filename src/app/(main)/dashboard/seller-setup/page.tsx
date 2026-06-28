'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Store, Loader2 } from 'lucide-react'
import LogoUploader from '@/components/upload/LogoUploader'

const SetupSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(50),
  description: z.string().max(300, 'Máximo 300 caracteres').optional(),
})

type SetupForm = z.infer<typeof SetupSchema>

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function SellerSetupPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetupForm>({
    resolver: zodResolver(SetupSchema),
  })

  const name = watch('name') || ''
  const slugPreview = slugify(name)

  async function onSubmit(data: SetupForm) {
    setServerError(null)

    const res = await fetch('/api/seller/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        slug: slugPreview,
        description: data.description || null,
        logoUrl, // ← puede ser null si el vendedor no subió logo, es opcional
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setServerError(json.error ?? 'Error al crear la tienda')
      return
    }

    router.push('/dashboard/seller')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo de la plataforma */}
        <div className="text-center mb-8">
          <span className="inline-block text-2xl font-bold text-gray-900">
            Moda<span className="text-blue-600">Guajira</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
              <Store size={22} className="text-teal-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Crea tu tienda</h1>
            <p className="text-sm text-gray-500 mt-1">
              Este es el último paso antes de empezar a vender en ModaGuajira
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {serverError}
              </div>
            )}

            {/* Logo de la tienda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo de tu tienda{' '}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <LogoUploader onUploaded={setLogoUrl} />
            </div>

            {/* Nombre de la tienda */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nombre de tu tienda
              </label>
              <input
                id="name"
                type="text"
                placeholder="Ej: Mochilas Wayuu María"
                {...register('name')}
                className={`w-full h-11 px-4 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
                  errors.name
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              />
              {errors.name ? (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.name.message}
                </p>
              ) : name ? (
                <p className="mt-1.5 text-xs text-gray-400">
                  Tu tienda se verá en:{' '}
                  <span className="font-mono">
                    modaguajira.com/tienda/{slugPreview}
                  </span>
                </p>
              ) : null}
            </div>

            {/* Descripción */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Descripción{' '}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Cuéntale a tus compradores qué vendes y qué hace especial tu tienda..."
                {...register('description')}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none ${
                  errors.description
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creando tienda...
                </>
              ) : (
                'Crear mi tienda'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Podrás cambiar el nombre, logo y descripción más adelante desde tu
          panel
        </p>
      </div>
    </main>
  )
}
