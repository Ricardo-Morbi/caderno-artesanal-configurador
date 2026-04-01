'use client'

import { useEffect, useState } from 'react'
import type { Pedido } from '@/types/pedido'

interface Contato {
  nome: string
  whatsapp: string
  totalPedidos: number
  totalGasto: number
  ultimoPedido: string
}

export default function PaginaContatos() {
  const [contatos, setContatos] = useState<Contato[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function carregar() {
      const res = await fetch('/api/pedidos')
      if (!res.ok) { setCarregando(false); return }
      const pedidos: Pedido[] = await res.json()

      // Agrupa por whatsapp
      const mapa: Record<string, Contato> = {}
      pedidos.forEach(p => {
        const chave = p.whatsapp.replace(/\D/g, '')
        if (!mapa[chave]) {
          mapa[chave] = {
            nome: p.nome,
            whatsapp: p.whatsapp,
            totalPedidos: 0,
            totalGasto: 0,
            ultimoPedido: p.criado_em,
          }
        }
        mapa[chave].totalPedidos++
        mapa[chave].totalGasto += Number(p.total)
        if (p.criado_em > mapa[chave].ultimoPedido) {
          mapa[chave].ultimoPedido = p.criado_em
          mapa[chave].nome = p.nome // Usa o nome mais recente
        }
      })

      const lista = Object.values(mapa).sort(
        (a, b) => new Date(b.ultimoPedido).getTime() - new Date(a.ultimoPedido).getTime()
      )
      setContatos(lista)
      setCarregando(false)
    }
    carregar()
  }, [])

  const filtrados = contatos.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.whatsapp.includes(busca)
  )

  if (carregando) {
    return <div className="text-sm text-onix-400 py-20 text-center">Carregando contatos...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <div className="w-6 h-px bg-ouro-400 mb-3" />
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-onix-700">Contatos</h2>
          <p className="text-xs text-onix-500 font-sans">
            {contatos.length} cliente{contatos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-4">
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou número..."
          className="w-full max-w-xs border border-ivoire-400 bg-white px-4 py-2 text-sm text-onix-700 outline-none focus:border-onix-400 transition-colors font-sans"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="text-sm text-onix-400 py-10 text-center">
          {busca ? 'Nenhum contato encontrado.' : 'Nenhum pedido realizado ainda.'}
        </p>
      ) : (
        <div className="bg-white border border-ivoire-400 divide-y divide-ivoire-200">
          {/* Cabeçalho */}
          <div className="grid grid-cols-12 px-4 py-2 bg-ivoire-100">
            <div className="col-span-4 text-[10px] tracking-widest uppercase font-sans text-onix-400">Nome</div>
            <div className="col-span-3 text-[10px] tracking-widest uppercase font-sans text-onix-400">WhatsApp</div>
            <div className="col-span-2 text-[10px] tracking-widest uppercase font-sans text-onix-400 text-center">Pedidos</div>
            <div className="col-span-2 text-[10px] tracking-widest uppercase font-sans text-onix-400 text-right">Total gasto</div>
            <div className="col-span-1 text-[10px] tracking-widest uppercase font-sans text-onix-400 text-right">Ação</div>
          </div>

          {filtrados.map((c, i) => {
            const numero = c.whatsapp.replace(/\D/g, '')
            const dataUltimo = new Date(c.ultimoPedido).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'short', year: '2-digit',
            })

            return (
              <div key={i} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-ivoire-50 transition-colors">
                <div className="col-span-4">
                  <p className="text-sm font-sans text-onix-700">{c.nome}</p>
                  <p className="text-[10px] text-onix-400 font-sans mt-0.5">
                    Ultimo: {dataUltimo}
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm font-sans text-onix-600">{c.whatsapp}</p>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-sans text-onix-700 bg-ivoire-100 border border-ivoire-300 px-2 py-0.5">
                    {c.totalPedidos}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-serif text-onix-700">
                    R$ {c.totalGasto.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="col-span-1 text-right">
                  <a
                    href={`https://wa.me/${numero}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs text-ouro-600 hover:text-ouro-700 border border-ouro-300 hover:border-ouro-400 px-2 py-1 transition-colors font-sans"
                    title="Abrir WhatsApp"
                  >
                    WA
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
