'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Pedido, StatusPedido } from '@/types/pedido'
import CalendarioPedidos from '@/components/admin/CalendarioPedidos'
import KanbanPedidos from '@/components/admin/KanbanPedidos'
import ToastRealtime from '@/components/admin/ToastRealtime'

function mesAtual(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function PaginaPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mes, setMes] = useState(mesAtual())

  const carregarPedidos = useCallback(async () => {
    const res = await fetch('/api/pedidos')
    if (res.ok) {
      const data = await res.json()
      setPedidos(Array.isArray(data) ? data : [])
    }
    setCarregando(false)
  }, [])

  useEffect(() => {
    carregarPedidos()
  }, [carregarPedidos])

  const handleNovoPedido = useCallback((pedido: Pedido) => {
    setPedidos(prev => [pedido, ...prev])
  }, [])

  async function handleStatusChange(id: string, novoStatus: StatusPedido) {
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p))
    const res = await fetch(`/api/pedidos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus }),
    })
    if (!res.ok) carregarPedidos()
  }

  const pedidosDoMes = pedidos.filter(p => p.criado_em.startsWith(mes))

  if (carregando) {
    return <div className="text-sm text-onix-400 py-20 text-center">Carregando pedidos...</div>
  }

  return (
    <div>
      <ToastRealtime onNovoPedido={handleNovoPedido} />

      <div className="mb-5">
        <div className="w-6 h-px bg-ouro-400 mb-3" />
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-onix-700">Pedidos</h2>
          <p className="text-xs text-onix-500 font-sans">
            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} no total
          </p>
        </div>
      </div>

      {/* Layout: calendário à esquerda + kanban à direita */}
      <div className="flex gap-6 items-start">
        {/* Calendário compacto */}
        <div className="flex-shrink-0">
          <CalendarioPedidos
            pedidos={pedidos}
            mesSelecionado={mes}
            onMesChange={setMes}
          />
        </div>

        {/* Kanban */}
        <div className="flex-1 min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-onix-500 tracking-widest uppercase font-sans">
              {pedidosDoMes.length} pedido{pedidosDoMes.length !== 1 ? 's' : ''} em {mes.split('-').reverse().join('/')}
            </p>
          </div>
          <KanbanPedidos
            pedidos={pedidosDoMes}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  )
}
