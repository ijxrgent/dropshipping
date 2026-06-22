import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role

  // Si ya está logueado, no debe ver login/register
  if ((pathname === '/login' || pathname === '/register') && isLoggedIn) {
    const redirectPath =
      role === 'ADMIN'
        ? '/dashboard/admin'
        : role === 'SELLER'
          ? '/dashboard/seller'
          : '/'
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  // Rutas solo para vendedores
  if (pathname.startsWith('/dashboard/seller') && role !== 'SELLER') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Rutas solo para admin
  if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Rutas protegidas en general
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}
