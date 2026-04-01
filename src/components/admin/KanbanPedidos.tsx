'use client'

import { useState, useRef } from 'react'
import type { Pedido, StatusPedido } from '@/types/pedido'
import { STATUS_LABELS, STATUS_COLUNAS } from '@/types/pedido'

interface Props {
  pedidos: Pedido[]
  onStatusChange: (id: string, novoStatus: StatusPedido) => Promise<void>
}

const COR_COLUNA: Record<StatusPedido, string> = {
  novo: 'border-t-blue-400',
  em_producao: 'border-t-yellow-400',
  pronto: 'border-t-green-400',
  entregue: 'border-t-onix-400',
}

function CartaoPedido({
  pedido,
  onDragStart,
}: {
  pedido: Pedido
  onDragStart: (id: string) => void
}) {
  const data = new Date(pedido.criado_em)
  const dataStr = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  return (
    <div
      draggable
      onDragStart={() => onDragStart(pedido.id)}
      className="bg-white border border-ivoire-400 p-4 cursor-grab active:cursor-grabbing hover:border-onix-300 transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-sans text-onix-700 font-medium leading-tight">{pedido.nome}</p>
        <span className="text-xs font-sans text-onix-400 ml-2 flex-shrink-0">{dataStr}</span>
      </div>
      <p className="text-xs text-onix-400 font-sans mb-3">{pedido.whatsapp}</p>
      <p className="text-base font-serif text-onix-700">
        R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
      </p>
      {pedido.notas && (
        <p className="mt-2 text-xs text-onix-500 font-sans bg-ivoire-100 px-2 py-1 border-l-2 border-ouro-300">
          {pedido.notas}
        </p>
      )}
    </div>
  )
}

export default function KanbanPedidos({ pedidos, onStatusChange }: Props) {
  const [arrastando, setArrastando] = useState<string | null>(null)
  const [sobreColuna, setSobreColuna] = useState<StatusPedido | null>(null)
  const dragIdRef = useRef<string | null>(null)

  function handleDragStart(id: string) {
    dragIdRef.current = id
    setArrastando(id)
  }

  function handleDragOver(e: React.DragEvent, coluna: StatusPedido) {
    e.preventDefault()
    setSobreColuna(coluna)
  }

  function handleDragLeave() {
    setSobreColuna(null)
  }

  async function handleDrop(e: React.DragEvent, coluna: StatusPedido) {
    e.preventDefault()
    setSobreColuna(null)
    setArrastando(null)

    const id = dragIdRef.current
    if (!id) return

    const pedido = pedidos.find(p => p.id === id)
    if (!pedido || pedido.status === coluna) return

    await onStatusChange(id, coluna)
    dragIdRef.current = null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {STATUS_COLUNAS.map(coluna => {
        const cartoes = pedidos.filter(p => p.status === coluna)
        const sobre = sobreColuna === coluna

        return (
          <div
            key={coluna}
            onDragOver={e => handleDragOver(e, coluna)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, coluna)}
            className={`
              flex flex-col bg-ivoire-100 border border-ivoire-400 border-t-4 ${COR_COLUNA[coluna]}
              transition-all duration-150 min-h-[300px]
              ${sobre ? 'bg-ivoire-200 ring-2 ring-ouro-300' : ''}
            `}
          >
            {/* Cabeçalho da coluna */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ivoire-400">
              <p className="text-xs font-sans tracking-widest uppercase text-onix-600">
                {STATUS_LABELS[coluna]}
              </p>
              <span className="text-xs font-sans text-onix-400 bg-white border border-ivoire-400 px-2 py-0.5">
                {cartoes.length}
              </span>
            </div>

            {/* Cartões */}
            <div className="flex flex-col gap-3 p-3 flex-1">
              {cartoes.map(p => (
                <CartaoPedido
                  key={p.id}
                  pedido={p}
                  onDragStart={handleDragStart}
                />
              ))}
              {cartoes.length === 0 && !sobre && (
                <div className="flex items-center justify-center h-20 text-xs text-onix-300 font-sans">
                  Arraste um cartão aqui
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
