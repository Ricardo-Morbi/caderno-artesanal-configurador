import { NextRequest, NextResponse } from 'next/server'

// Rate limiting simples em memória (Edge Runtime)
// Reinicia a cada deploy — suficiente para conter brute force
const tentativas = new Map<string, { count: number; resetAt: number }>()
const LIMITE = 10       // tentativas
const JANELA = 15 * 60  // 15 minutos em segundos

function checarRateLimit(ip: string): boolean {
  const agora = Math.floor(Date.now() / 1000)
  const reg = tentativas.get(ip)

  if (!reg || agora > reg.resetAt) {
    tentativas.set(ip, { count: 1, resetAt: agora + JANELA })
    return false // não bloqueado
  }

  reg.count++
  if (reg.count > LIMITE) return true // bloqueado

  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limit no endpoint de login
  if (pathname === '/api/auth/admin' && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (checarRateLimit(ip)) {
      return NextResponse.json(
        { erro: 'Muitas tentativas. Aguarde 15 minutos.' },
        { status: 429 }
      )
    }
    return NextResponse.next()
  }

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
  matcher: ['/admin/:path*', '/api/auth/admin'],
}
