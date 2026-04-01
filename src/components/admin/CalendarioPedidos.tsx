'use client'

import { useState, useMemo } from 'react'
import type { Pedido } from '@/types/pedido'

interface Props {
  pedidos: Pedido[]
  mesSelecionado: string
  onMesChange: (mes: string) => void
}

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function CalendarioPedidos({ pedidos, mesSelecionado, onMesChange }: Props) {
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null)

  const { ano, mes } = useMemo(() => {
    const [a, m] = mesSelecionado.split('-').map(Number)
    return { ano: a, mes: m - 1 }
  }, [mesSelecionado])

  const primeiroDia = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()

  const pedidosPorDia = useMemo(() => {
    const mapa: Record<number, number> = {}
    pedidos.forEach(p => {
      const data = new Date(p.criado_em)
      if (data.getFullYear() === ano && data.getMonth() === mes) {
        const dia = data.getDate()
        mapa[dia] = (mapa[dia] ?? 0) + 1
      }
    })
    return mapa
  }, [pedidos, ano, mes])

  const pedidosDoDia = useMemo(() => {
    if (!diaSelecionado) return []
    return pedidos.filter(p => {
      const d = new Date(p.criado_em)
      return d.getFullYear() === ano && d.getMonth() === mes && d.getDate() === diaSelecionado
    })
  }, [pedidos, diaSelecionado, ano, mes])

  function mesAnterior() {
    const d = new Date(ano, mes - 1, 1)
    onMesChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    setDiaSelecionado(null)
  }

  function proximoMes() {
    const d = new Date(ano, mes + 1, 1)
    onMesChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    setDiaSelecionado(null)
  }

  const celulas: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ]
  while (celulas.length % 7 !== 0) celulas.push(null)

  return (
    <div className="bg-white border border-ivoire-400 mb-4 w-64">
      {/* Cabecalho */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-ivoire-300">
        <button onClick={mesAnterior} className="text-onix-400 hover:text-onix-700 text-xs px-1 transition-colors" aria-label="Mes anterior">
          &larr;
        </button>
        <h3 className="font-serif text-onix-700 text-sm">
          {MESES[mes]} {ano}
        </h3>
        <button onClick={proximoMes} className="text-onix-400 hover:text-onix-700 text-xs px-1 transition-colors" aria-label="Proximo mes">
          &rarr;
        </button>
      </div>

      <div className="p-2">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-0.5">
          {DIAS_SEMANA.map((d, i) => (
            <div key={i} className="text-center text-[10px] text-onix-400 font-sans py-0.5">{d}</div>
          ))}
        </div>

        {/* Dias */}
        <div className="grid grid-cols-7 gap-px bg-ivoire-300">
          {celulas.map((dia, i) => {
            const qtd = dia ? (pedidosPorDia[dia] ?? 0) : 0
            const selecionado = dia === diaSelecionado
            const hoje = dia
              ? new Date().getFullYear() === ano && new Date().getMonth() === mes && new Date().getDate() === dia
              : false

            return (
              <div
                key={i}
                onClick={() => dia && setDiaSelecionado(selecionado ? null : dia)}
                className={`bg-white flex flex-col items-center justify-center cursor-pointer transition-colors duration-100 h-7 ${dia ? 'hover:bg-ivoire-100' : ''} ${selecionado ? 'bg-onix-700 hover:bg-onix-700' : ''}`}
              >
                {dia && (
                  <>
                    <span className={`text-[11px] font-sans leading-none ${selecionado ? 'text-ivoire-100' : hoje ? 'font-bold text-ouro-500' : 'text-onix-600'}`}>
                      {dia}
                    </span>
                    {qtd > 0 && (
                      <span className={`text-[8px] font-sans font-medium leading-none ${selecionado ? 'text-ouro-300' : 'text-ouro-500'}`}>
                        {qtd}
                      </span>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Pedidos do dia */}
      {diaSelecionado && (
        <div className="border-t border-ivoire-300 px-3 py-2">
          <p className="text-[10px] text-onix-500 tracking-widest uppercase font-sans mb-2">
            {diaSelecionado}/{mes + 1}
          </p>
          {pedidosDoDia.length === 0 ? (
            <p className="text-xs text-onix-400">Nenhum pedido.</p>
          ) : (
            <div className="space-y-1.5">
              {pedidosDoDia.map(p => (
                <div key={p.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-onix-700 font-sans leading-tight">{p.nome}</p>
                    <p className="text-[10px] text-onix-400 font-sans">{p.whatsapp}</p>
                  </div>
                  <p className="text-xs font-serif text-onix-700 ml-2 flex-shrink-0">
                    R$ {Number(p.total).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
