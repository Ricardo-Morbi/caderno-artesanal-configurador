'use client'

import { useEffect, useState } from 'react'
import type { Pedido, Lead } from '@/types/pedido'
import { STATUS_LABELS } from '@/types/pedido'

interface Metricas {
  totalPedidos: number
  receitaTotal: number
  ticketMedio: number
  totalLeads: number
  porStatus: Record<string, number>
  porMes: { mes: string; total: number; receita: number }[]
}

function calcularMetricas(pedidos: Pedido[], leads: Lead[]): Metricas {
  const totalPedidos = pedidos.length
  const receitaTotal = pedidos.reduce((s, p) => s + Number(p.total), 0)
  const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0
  const totalLeads = leads.length

  const porStatus: Record<string, number> = {}
  pedidos.forEach(p => {
    porStatus[p.status] = (porStatus[p.status] ?? 0) + 1
  })

  const mesesMap: Record<string, { total: number; receita: number }> = {}
  pedidos.forEach(p => {
    const mes = p.criado_em.slice(0, 7)
    if (!mesesMap[mes]) mesesMap[mes] = { total: 0, receita: 0 }
    mesesMap[mes].total++
    mesesMap[mes].receita += Number(p.total)
  })

  const porMes = Object.entries(mesesMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([mes, v]) => ({ mes, ...v }))

  return { totalPedidos, receitaTotal, ticketMedio, totalLeads, porStatus, porMes }
}

function CardMetrica({ label, valor, sub }: { label: string; valor: string; sub?: string }) {
  return (
    <div className="bg-white border border-ivoire-400 p-6">
      <p className="text-xs text-onix-500 tracking-widest uppercase font-sans mb-1">{label}</p>
      <p className="text-2xl font-serif text-onix-700">{valor}</p>
      {sub && <p className="text-xs text-onix-400 mt-1 font-sans">{sub}</p>}
    </div>
  )
}

function BarraGrafico({ porMes }: { porMes: { mes: string; total: number; receita: number }[] }) {
  const maxReceita = Math.max(...porMes.map(m => m.receita), 1)

  const nomeMes = (mes: string) => {
    const [ano, m] = mes.split('-')
    const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    return `${nomes[parseInt(m) - 1]} ${ano.slice(2)}`
  }

  return (
    <div className="bg-white border border-ivoire-400 p-6">
      <p className="text-xs text-onix-500 tracking-widest uppercase font-sans mb-6">Receita por mês</p>
      {porMes.length === 0 ? (
        <p className="text-sm text-onix-400 text-center py-8">Sem dados ainda</p>
      ) : (
        <div className="flex items-end gap-3 h-40">
          {porMes.map(({ mes, total, receita }) => (
            <div key={mes} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-onix-500 font-sans">
                R$ {(receita / 1000).toFixed(1)}k
              </span>
              <div
                className="w-full bg-ouro-300 transition-all duration-500"
                style={{ height: `${Math.max((receita / maxReceita) * 100, 4)}%` }}
                title={`${total} pedidos`}
              />
              <span className="text-xs text-onix-400 font-sans whitespace-nowrap">
                {nomeMes(mes)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/pedidos').then(r => r.json()),
      fetch('/api/leads').then(r => r.json()),
    ]).then(([p, l]) => {
      setPedidos(Array.isArray(p) ? p : [])
      setLeads(Array.isArray(l) ? l : [])
    }).finally(() => setCarregando(false))
  }, [])

  const m = calcularMetricas(pedidos, leads)

  if (carregando) {
    return <div className="text-sm text-onix-400 py-20 text-center">Carregando...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <div className="w-6 h-px bg-ouro-400 mb-3" />
        <h2 className="text-xl font-serif text-onix-700">Dashboard</h2>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardMetrica
          label="Total de pedidos"
          valor={String(m.totalPedidos)}
        />
        <CardMetrica
          label="Receita total"
          valor={`R$ ${m.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        />
        <CardMetrica
          label="Ticket médio"
          valor={`R$ ${m.ticketMedio.toFixed(2).replace('.', ',')}`}
        />
        <CardMetrica
          label="Leads captados"
          valor={String(m.totalLeads)}
          sub="Configurações sem pedido"
        />
      </div>

      {/* Por status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(['novo', 'em_producao', 'pronto', 'entregue'] as const).map(s => (
          <div key={s} className="bg-white border border-ivoire-400 p-4">
            <p className="text-xs text-onix-500 tracking-widest uppercase font-sans mb-1">
              {STATUS_LABELS[s]}
            </p>
            <p className="text-3xl font-serif text-onix-700">{m.porStatus[s] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <BarraGrafico porMes={m.porMes} />

      {/* Últimos pedidos */}
      {pedidos.length > 0 && (
        <div className="bg-white border border-ivoire-400 mt-6">
          <div className="px-6 py-4 border-b border-ivoire-300">
            <p className="text-xs text-onix-500 tracking-widest uppercase font-sans">Pedidos recentes</p>
          </div>
          <div className="divide-y divide-ivoire-300">
            {pedidos.slice(0, 8).map(p => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm text-onix-700 font-sans">{p.nome}</p>
                  <p className="text-xs text-onix-400 font-sans">
                    {new Date(p.criado_em).toLocaleDateString('pt-BR')} · {p.whatsapp}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-serif text-onix-700">
                    R$ {Number(p.total).toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-xs text-onix-400 font-sans">{STATUS_LABELS[p.status]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
