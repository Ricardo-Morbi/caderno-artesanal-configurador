import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

/**
 * Verifica se a requisição tem o cookie de admin válido.
 * Retorna null se autenticado, ou um NextResponse 401 se não.
 */
export function verificarAdmin(request: NextRequest): NextResponse | null {
  const token = request.cookies.get('admin_token')?.value
  const esperado = process.env.ADMIN_SESSION_TOKEN

  if (!token || !esperado) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  try {
    const a = Buffer.from(token)
    const b = Buffer.from(esperado)
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  return null // autenticado
}
