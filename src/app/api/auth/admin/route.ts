import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

function senhasIguais(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a)
    const bb = Buffer.from(b)
    if (ba.length !== bb.length) {
      // Compara mesmo assim para evitar timing attack
      timingSafeEqual(ba, Buffer.alloc(ba.length))
      return false
    }
    return timingSafeEqual(ba, bb)
  } catch {
    return false
  }
}

// POST /api/auth/admin — Login
export async function POST(request: NextRequest) {
  const { senha } = await request.json()
  const senhaCorreta = process.env.ADMIN_PASSWORD

  const sessionToken = process.env.ADMIN_SESSION_TOKEN

  if (!senhaCorreta || !sessionToken || !senhasIguais(senha, senhaCorreta)) {
    return NextResponse.json({ erro: 'Senha incorreta' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: '/',
  })
  return response
}

// DELETE /api/auth/admin — Logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('admin_token')
  return response
}
