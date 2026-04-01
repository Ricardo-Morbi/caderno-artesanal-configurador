import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verificarAdmin } from '@/lib/admin-auth'

// GET /api/pedidos — Lista pedidos (admin)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const mes = searchParams.get('mes') // formato: 2024-03
  const sb = getSupabaseAdmin()

  let query = sb
    .from('pedidos')
    .select('*')
    .order('criado_em', { ascending: false })

  if (status) query = query.eq('status', status)

  if (mes) {
    const inicio = `${mes}-01`
    const [ano, mesNum] = mes.split('-').map(Number)
    const fim = new Date(ano, mesNum, 1).toISOString().split('T')[0]
    query = query.gte('criado_em', inicio).lt('criado_em', fim)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/pedidos — Cria pedido (público)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { nome, whatsapp, configuracao, total } = body

  if (!nome || !whatsapp || !configuracao || total == null) {
    return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('pedidos')
    .insert({ nome, whatsapp, configuracao, total })
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
