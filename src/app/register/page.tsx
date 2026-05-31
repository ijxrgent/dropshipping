'use client'

import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Store } from 'lucide-react'

const RegisterSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
    role: z.enum(['BUYER', 'SELLER']),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof RegisterSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { role: 'BUYER' },
  })

  const selectedRole = useWatch<RegisterForm, 'role'>({
    control,
    name: 'role',
  })

  async function onSubmit(data: RegisterForm) {
    setServerError(null)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setServerError(json.error ?? 'Error al registrarse')
      return
    }

    // Auto login tras registro exitoso
    await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (data.role === 'SELLER') router.push('/dashboard/seller')
    else router.push('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-bold text-gray-900"
          >
            Moda<span className="text-blue-600">Guajira</span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Crea tu cuenta gratis</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            {/* Error del servidor */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {serverError}
              </div>
            )}

            {/* Selector de rol */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                ¿Cómo quieres usar ModaGuajira?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'BUYER')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    selectedRole === 'BUYER'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <ShoppingBag size={20} />
                  Comprar
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', 'SELLER')}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    selectedRole === 'SELLER'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Store size={20} />
                  Vender
                </button>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="María García"
                {...register('name')}
                className={`w-full h-11 px-4 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.name
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                {...register('email')}
                className={`w-full h-11 px-4 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.email
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                {...register('password')}
                className={`w-full h-11 px-4 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.password
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                {...register('confirmPassword')}
                className={`w-full h-11 px-4 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  errors.confirmPassword
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>
        </div>

        {/* Enlace a login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
