import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verificarAdmin } from '@/lib/admin-auth'

// POST /api/leads — Salva lead parcial
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { configuracao, total, pergunta_index } = body

  if (!configuracao || total == null || pergunta_index == null) {
    return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('leads')
    .insert({ configuracao, total, pergunta_index })
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// GET /api/leads — Lista leads (admin)
export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from('leads')
    .select('*')
    .order('criado_em', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json(data)
}
