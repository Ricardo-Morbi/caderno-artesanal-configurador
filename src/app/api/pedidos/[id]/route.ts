import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// PATCH /api/pedidos/[id] — Atualiza status e/ou notas
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const atualizacao: Record<string, unknown> = {}

  if (body.status !== undefined) atualizacao.status = body.status
  if (body.notas !== undefined) atualizacao.notas = body.notas

  if (Object.keys(atualizacao).length === 0) {
    return NextResponse.json({ erro: 'Nada para atualizar' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('pedidos')
    .update(atualizacao)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json(data)
}
