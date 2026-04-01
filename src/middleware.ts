import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rota de login não precisa de autenticação
  if (pathname === '/admin/login') return NextResponse.next()

  // Protege todas as rotas /admin/*
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value
    const expectedToken = process.env.ADMIN_SESSION_TOKEN

    if (!token || !expectedToken || token !== expectedToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
