'use client'

import { useEffect, useState } from 'react'
import type { Pedido } from '@/types/pedido'
import type { ConfiguracaoCaderno } from '@/types/caderno'
import type { StatusPedido } from '@/types/pedido'
import { STATUS_LABELS, STATUS_COLUNAS } from '@/types/pedido'
import type { TabelaPrecos } from '@/lib/calcularPreco'
import { TABELA_PADRAO } from '@/lib/calcularPreco'
import PreviewCadernoMini from './PreviewCadernoMini'
import FichaTecnica from './FichaTecnica'

interface Props {
  pedido: Pedido
  onFechar: () => void
  onStatusChange: (id: string, status: StatusPedido) => Promise<void>
}

const COR_STATUS: Record<StatusPedido, string> = {
  novo:        'bg-blue-50 text-blue-700 border-blue-200',
  em_producao: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pronto:      'bg-green-50 text-green-700 border-green-200',
  entregue:    'bg-onix-100 text-onix-600 border-onix-300',
}

export default function ModalPedido({ pedido, onFechar, onStatusChange }: Props) {
  const configuracao = pedido.configuracao as unknown as ConfiguracaoCaderno
  const [tabela, setTabela] = useState<TabelaPrecos>(TABELA_PADRAO)

  useEffect(() => {
    fetch('/api/configuracoes-preco')
      .then(r => r.json())
      .then((d: TabelaPrecos) => setTabela(d))
      .catch(() => {})
  }, [])

  const data = new Date(pedido.criado_em)
  const dataStr = data.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const whatsappLink = `https://wa.me/${pedido.whatsapp.replace(/\D/g, '')}`

  // Fecha com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onFechar])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onFechar() }}
    >
      <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-ivoire-300 bg-onix-800 text-ivoire-100 flex-shrink-0">
          <div>
            <h2 className="font-serif text-lg">{pedido.nome}</h2>
            <p className="text-xs text-ivoire-300 font-sans mt-0.5">{dataStr}</p>
          </div>
          <button
            onClick={onFechar}
            className="text-ivoire-400 hover:text-ivoire-100 text-xl leading-none mt-0.5 transition-colors"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Body — scrollável */}
        <div className="overflow-y-auto flex-1">
          {/* Preview + Info */}
          <div className="flex gap-6 p-6 border-b border-ivoire-200">
            {/* Preview SVG */}
            <div className="flex-shrink-0 flex items-center justify-center bg-ivoire-100 border border-ivoire-300 p-4 w-40 h-40">
              <PreviewCadernoMini configuracao={configuracao} tamanho={110} />
            </div>

            {/* Nome, telefone, valor, status */}
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-0.5">Cliente</p>
                <p className="font-sans text-sm font-medium text-onix-700">{pedido.nome}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-0.5">WhatsApp</p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-sm text-onix-700 hover:text-ouro-600 underline transition-colors"
                >
                  {pedido.whatsapp}
                </a>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-0.5">Valor</p>
                <p className="font-serif text-xl text-onix-700">
                  R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                </p>
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-1.5">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_COLUNAS.map(s => (
                    <button
                      key={s}
                      onClick={() => onStatusChange(pedido.id, s)}
                      className={`
                        px-3 py-1 text-xs font-sans border transition-all
                        ${pedido.status === s
                          ? COR_STATUS[s] + ' font-medium'
                          : 'bg-white text-onix-400 border-ivoire-300 hover:border-onix-300'
                        }
                      `}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ficha técnica */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-px bg-ouro-400" />
              <p className="text-xs tracking-widest uppercase font-sans text-onix-500">Ficha Técnica</p>
            </div>
            <FichaTecnica c={configuracao} t={tabela} />
          </div>
        </div>
      </div>
    </div>
  )
}
