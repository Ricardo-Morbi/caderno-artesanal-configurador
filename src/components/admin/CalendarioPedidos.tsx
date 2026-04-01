'use client'

import { useState, useMemo } from 'react'
import type { Pedido } from '@/types/pedido'

interface Props {
  pedidos: Pedido[]
  mesSelecionado: string // 'YYYY-MM'
  onMesChange: (mes: string) => void
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function CalendarioPedidos({ pedidos, mesSelecionado, onMesChange }: Props) {
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null)

  const { ano, mes } = useMemo(() => {
    const [a, m] = mesSelecionado.split('-').map(Number)
    return { ano: a, mes: m - 1 } // mes é 0-indexed
  }, [mesSelecionado])

  const primeiroDia = new Date(ano, mes, 1).getDay() // 0 = Dom
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()

  // Mapeia dia → quantidade de pedidos
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

  // Pedidos do dia selecionado
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
  // Completa para múltiplo de 7
  while (celulas.length % 7 !== 0) celulas.push(null)

  return (
    <div className="bg-white border border-ivoire-400 mb-6">
      {/* Cabeçalho do calendário */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ivoire-300">
        <button
          onClick={mesAnterior}
          className="text-onix-400 hover:text-onix-700 text-sm px-2 py-1 transition-colors"
          aria-label="Mês anterior"
        >
          ←
        </button>
        <h3 className="font-serif text-onix-700 text-base">
          {MESES[mes]} {ano}
        </h3>
        <button
          onClick={proximoMes}
          className="text-onix-400 hover:text-onix-700 text-sm px-2 py-1 transition-colors"
          aria-label="Próximo mês"
        >
          →
        </button>
      </div>

      <div className="p-4">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-1">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-xs text-onix-400 font-sans py-1">
              {d}
            </div>
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
                className={`
                  bg-white aspect-square flex flex-col items-center justify-center cursor-pointer
                  transition-colors duration-100
                  ${dia ? 'hover:bg-ivoire-100' : ''}
                  ${selecionado ? 'bg-onix-700 hover:bg-onix-700' : ''}
                `}
              >
                {dia && (
                  <>
                    <span className={`text-xs font-sans ${selecionado ? 'text-ivoire-100' : hoje ? 'font-bold text-ouro-500' : 'text-onix-600'}`}>
                      {dia}
                    </span>
                    {qtd > 0 && (
                      <span className={`mt-0.5 text-[10px] font-sans font-medium ${selecionado ? 'text-ouro-300' : 'text-ouro-500'}`}>
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

      {/* Pedidos do dia selecionado */}
      {diaSelecionado && (
        <div className="border-t border-ivoire-300 px-6 py-4">
          <p className="text-xs text-onix-500 tracking-widest uppercase font-sans mb-3">
            Pedidos em {diaSelecionado}/{mes + 1}/{ano}
          </p>
          {pedidosDoDia.length === 0 ? (
            <p className="text-sm text-onix-400">Nenhum pedido neste dia.</p>
          ) : (
            <div className="space-y-2">
              {pedidosDoDia.map(p => (
                <div key={p.id} className="flex justify-between items-center py-2 border-b border-ivoire-200 last:border-0">
                  <div>
                    <p className="text-sm text-onix-700 font-sans">{p.nome}</p>
                    <p className="text-xs text-onix-400 font-sans">{p.whatsapp}</p>
                  </div>
                  <p className="text-sm font-serif text-onix-700">
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
