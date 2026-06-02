'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import LogoRM from '@/assets/logo_rm.webp'

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

type LoginForm = z.infer<typeof LoginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setServerError(null)

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setServerError('Email o contraseña incorrectos')
      return
    }

    // Redirigir según rol — next-auth actualiza la sesión automáticamente
    // Usamos window.location para forzar recarga de sesión
    const res = await fetch('/api/auth/session')
    const session = await res.json()
    const role = session?.user?.role

    if (role === 'SELLER') router.push('/dashboard/seller')
    else if (role === 'ADMIN') router.push('/dashboard/admin')
    else router.push('/')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex flex-col items-center gap-2">
              <Image
                src={LogoRM}
                alt="Logo"
                width={56}
                height={56}
                className="rounded-lg object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          </Link>
          <p className="mt-3 text-sm text-gray-600">
            Inicia sesión en tu cuenta
          </p>
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
                className={`w-full h-11 px-4 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition ${
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
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <Link
                  href="/recuperar-contrasena"
                  className="text-xs text-gray-600 hover:text-gray-900 hover:underline"
                >
                  ¿Olvidaste la contraseña?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className={`w-full h-11 px-4 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition ${
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

            {/* Botón */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </div>

        {/* Enlace a registro */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link
            href="/register"
            className="text-gray-900 font-medium hover:underline hover:text-gray-700"
          >
            Regístrate gratis
          </Link>
        </p>
      </div>
    </main>
  )
}
