'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { Pedido } from '@/types/pedido'

interface Toast {
  id: string
  pedido: Pedido
}

interface Props {
  onNovoPedido: (pedido: Pedido) => void
}

export default function ToastRealtime({ onNovoPedido }: Props) {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const sb = getSupabase()
    const canal = sb
      .channel('pedidos-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        (payload) => {
          const pedido = payload.new as Pedido
          const toast: Toast = { id: `${Date.now()}`, pedido }

          setToasts(prev => [...prev, toast])
          onNovoPedido(pedido)

          // Remove após 6 segundos
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== toast.id))
          }, 6000)
        }
      )
      .subscribe()

    return () => {
      sb.removeChannel(canal)
    }
  }, [onNovoPedido])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-onix-800 text-ivoire-100 border border-onix-600 shadow-lg px-5 py-4 w-72 pointer-events-auto"
          style={{ animation: 'slide-in 0.3s ease-out' }}
        >
          <div className="flex items-start gap-3">
            <span className="text-ouro-400 text-lg flex-shrink-0">◆</span>
            <div>
              <p className="text-xs tracking-widest uppercase font-sans text-ouro-300 mb-1">
                Novo pedido!
              </p>
              <p className="text-sm font-sans font-medium">{toast.pedido.nome}</p>
              <p className="text-xs text-ivoire-400 font-sans mt-0.5">
                R$ {Number(toast.pedido.total).toFixed(2).replace('.', ',')} · {toast.pedido.whatsapp}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
