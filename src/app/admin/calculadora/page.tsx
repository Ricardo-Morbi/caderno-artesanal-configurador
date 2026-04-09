'use client'

import { useEffect, useState } from 'react'
import type { TabelaPrecos } from '@/lib/calcularPreco'
import { TABELA_PADRAO } from '@/lib/calcularPreco'

// Preços de referência dos fornecedores (Abril 2026)
const PRECOS_REF = [
  { categoria: 'Papel Miolo', itens: [
    { descricao: 'Offset 90g — 500 folhas A4', preco: 60.85, unidade: 'resma', unitario: 'R$0,122/folha A4' },
    { descricao: 'Offset 120g — 250 folhas A4', preco: 40.58, unidade: 'resma', unitario: 'R$0,162/folha A4' },
    { descricao: 'Offset 180g — 250 folhas A4', preco: 67.18, unidade: 'resma', unitario: 'R$0,269/folha A4' },
    { descricao: 'Offset 240g — 250 folhas A4', preco: 89.55, unidade: 'resma', unitario: 'R$0,358/folha A4' },
    { descricao: 'Pólen Bold 90g — 250 folhas A4', preco: 37.07, unidade: 'resma', unitario: 'R$0,148/folha A4' },
    { descricao: 'Reciclado 80g — 50 folhas A4', preco: 6.81, unidade: 'pacote', unitario: 'R$0,136/folha A4' },
  ]},
  { categoria: 'Papelão Base', itens: [
    { descricao: 'Papelão cinza A5 — 50 folhas', preco: 30.99, unidade: 'pacote', unitario: 'R$0,62/folha A5' },
  ]},
  { categoria: 'Couro e Tecido', itens: [
    { descricao: 'Couro classe B — painel 25×36cm', preco: 37.90, unidade: 'painel', unitario: 'por peça' },
    { descricao: 'Courvin (sintético) — por metro', preco: 28.40, unidade: 'metro', unitario: '~1,4m de largura' },
    { descricao: 'Tricoline lisa — por metro', preco: 21.49, unidade: 'metro', unitario: '~1,4m de largura' },
    { descricao: 'Linho misto — por ½ metro', preco: 45.00, unidade: '½m', unitario: 'R$90/m' },
    { descricao: 'Linho puro — por ½ metro', preco: 66.00, unidade: '½m', unitario: 'R$132/m' },
  ]},
  { categoria: 'Papel Especial Capa', itens: [
    { descricao: 'Vtex — folha 66×96cm', preco: 43.31, unidade: 'folha', unitario: 'por peça' },
    { descricao: 'Star Coat — folha ~66×96cm', preco: 22.00, unidade: 'folha', unitario: 'R$18,12–R$31' },
    { descricao: 'Árbol — folha ~66×96cm', preco: 19.65, unidade: 'folha', unitario: 'por peça' },
  ]},
  { categoria: 'Acessórios', itens: [
    { descricao: 'Cantoneiras simples — 100 unidades', preco: 75.00, unidade: 'caixa', unitario: 'R$0,75/un (4 cantos = R$3,00)' },
    { descricao: 'Cantoneiras trabalhadas — 100 unidades', preco: 160.00, unidade: 'caixa', unitario: 'R$1,60/un (4 cantos = R$6,40)' },
    { descricao: 'Elástico roliço — 100 metros', preco: 31.00, unidade: 'rolo', unitario: 'R$0,31/m (~60cm/caderno)' },
    { descricao: 'Fita cetim 7mm — 100 metros', preco: 14.90, unidade: 'rolo', unitario: 'R$0,149/m (~40cm/marcador)' },
  ]},
]

function R(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',')}`
}

function CampoCalc({
  label,
  valor,
  onChange,
  sufixo = 'R$',
  step = '0.01',
  min = '0',
}: {
  label: string
  valor: number
  onChange: (v: number) => void
  sufixo?: string
  step?: string
  min?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-ivoire-200 last:border-0">
      <label className="text-xs text-onix-600 font-sans flex-1">{label}</label>
      <div className="flex items-center gap-1.5">
        {sufixo === 'R$' && <span className="text-xs text-onix-400 font-sans">R$</span>}
        <input
          type="number"
          min={min}
          step={step}
          value={valor}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-24 border border-ivoire-400 bg-white px-2 py-1 text-xs text-onix-700 text-right outline-none focus:border-onix-400 font-sans"
        />
        {sufixo !== 'R$' && <span className="text-xs text-onix-400 font-sans">{sufixo}</span>}
      </div>
    </div>
  )
}

export default function PaginaCalculadora() {
  const [tabela, setTabela] = useState<TabelaPrecos>(TABELA_PADRAO)
  const [carregando, setCarregando] = useState(true)
  const [mostrarRef, setMostrarRef] = useState(false)

  // Entradas manuais da calculadora
  const [custoMaterial, setCustoMaterial] = useState(50)
  const [horasTrabalho, setHorasTrabalho] = useState(1.0)
  const [valorHora, setValorHora] = useState(35)
  const [custoFixoUnitario, setCustoFixoUnitario] = useState(25)
  const [margemLucro, setMargemLucro] = useState(50)
  const [margemInvestimento, setMargemInvestimento] = useState(10)

  useEffect(() => {
    fetch('/api/configuracoes-preco')
      .then(r => r.json())
      .then((d: TabelaPrecos) => {
        setTabela(d)
        setValorHora(d.valorHoraArtesa)
        setCustoFixoUnitario(Math.round((d.custoFixoMensal / Math.max(d.producaoMediaMensal, 1)) * 100) / 100)
        setMargemLucro(d.margemLucro)
        setMargemInvestimento(d.margemInvestimento ?? 10)
        setCarregando(false)
      })
      .catch(() => setCarregando(false))
  }, [])

  // Cálculo em tempo real
  const custoMaoObra   = Math.round(horasTrabalho * valorHora * 100) / 100
  const custoTotal     = Math.round((custoMaterial + custoMaoObra + custoFixoUnitario) * 100) / 100
  const multiplicador  = (1 + margemLucro / 100) * (1 + margemInvestimento / 100)
  const precoFinal     = Math.round(custoTotal * multiplicador * 100) / 100
  const margemValor    = Math.round((precoFinal - custoTotal) * 100) / 100
  const margemTotal    = custoTotal > 0 ? Math.round((margemValor / custoTotal) * 100) : 0

  if (carregando) {
    return <div className="text-sm text-onix-400 py-20 text-center">Carregando...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <div className="w-6 h-px bg-ouro-400 mb-3" />
        <h2 className="text-xl font-serif text-onix-700">Calculadora de Preço</h2>
        <p className="text-xs text-onix-400 font-sans mt-1">
          Calcule o preço de venda de qualquer caderno inserindo os custos manualmente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">

        {/* Entradas */}
        <div>
          <div className="mb-4">
            <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-2">Custo do produto</p>
            <div className="bg-white border border-ivoire-300 px-4 py-1">
              <CampoCalc
                label="Custo de material (total)"
                valor={custoMaterial}
                onChange={setCustoMaterial}
              />
              <CampoCalc
                label="Horas de trabalho"
                valor={horasTrabalho}
                onChange={setHorasTrabalho}
                sufixo="h"
                step="0.25"
              />
              <CampoCalc
                label="Valor por hora (R$/h)"
                valor={valorHora}
                onChange={setValorHora}
              />
              <CampoCalc
                label="Custo fixo por unidade"
                valor={custoFixoUnitario}
                onChange={setCustoFixoUnitario}
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-2">Margens</p>
            <div className="bg-white border border-ivoire-300 px-4 py-1">
              <CampoCalc
                label="Margem de lucro"
                valor={margemLucro}
                onChange={setMargemLucro}
                sufixo="%"
                step="1"
              />
              <CampoCalc
                label="Margem de investimento"
                valor={margemInvestimento}
                onChange={setMargemInvestimento}
                sufixo="%"
                step="1"
              />
            </div>
          </div>

          <div className="bg-ivoire-100 border border-ivoire-300 px-4 py-3">
            <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-1">Valores padrão</p>
            <p className="text-xs text-onix-500 font-sans leading-relaxed">
              Hora: {R(tabela.valorHoraArtesa)} ·
              Fixo/un: {R(tabela.custoFixoMensal / Math.max(tabela.producaoMediaMensal, 1))} ·
              Lucro: {tabela.margemLucro}% ·
              Investimento: {tabela.margemInvestimento ?? 10}%
            </p>
            <button
              onClick={() => {
                setValorHora(tabela.valorHoraArtesa)
                setCustoFixoUnitario(Math.round((tabela.custoFixoMensal / Math.max(tabela.producaoMediaMensal, 1)) * 100) / 100)
                setMargemLucro(tabela.margemLucro)
                setMargemInvestimento(tabela.margemInvestimento ?? 10)
              }}
              className="mt-2 text-[10px] text-onix-400 hover:text-onix-600 font-sans tracking-widest uppercase underline transition-colors"
            >
              Restaurar padrões salvos
            </button>
          </div>
        </div>

        {/* Resultado */}
        <div>
          <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-2">Resultado</p>
          <div className="bg-white border border-ivoire-400">

            <div className="px-5 py-4 divide-y divide-ivoire-100">
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-onix-500 font-sans">Material</span>
                <span className="text-xs font-sans text-onix-700">{R(custoMaterial)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-onix-500 font-sans">
                  Mão de obra ({horasTrabalho}h × {R(valorHora)}/h)
                </span>
                <span className="text-xs font-sans text-onix-700">{R(custoMaoObra)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-onix-500 font-sans">Custo fixo</span>
                <span className="text-xs font-sans text-onix-700">{R(custoFixoUnitario)}</span>
              </div>
            </div>

            <div className="px-5 py-3 bg-ivoire-50 border-t border-ivoire-200 divide-y divide-ivoire-200">
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-onix-600 font-sans font-medium">Custo total</span>
                <span className="text-xs font-sans text-onix-700 font-medium">{R(custoTotal)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-onix-500 font-sans">
                  Margem total ({margemLucro}% + {margemInvestimento}% = {margemTotal}% efetivo)
                </span>
                <span className="text-xs font-sans text-green-700">{R(margemValor)}</span>
              </div>
            </div>

            <div className="px-5 py-5 border-t border-ivoire-300">
              <div className="flex justify-between items-center">
                <span className="text-sm text-onix-600 font-sans tracking-wide">Preço ao cliente</span>
                <span className="text-3xl font-serif text-onix-700">{R(precoFinal)}</span>
              </div>
            </div>

          </div>

          {/* Fórmula */}
          <div className="mt-4 bg-ouro-50 border border-ouro-200 px-4 py-3">
            <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-2">Fórmula</p>
            <p className="text-xs text-onix-600 font-sans leading-relaxed">
              {R(custoTotal)} × (1+{margemLucro}%) × (1+{margemInvestimento}%) = {R(precoFinal)}
            </p>
          </div>
        </div>

      </div>

      {/* Tabela de preços de referência */}
      <div className="mt-10 max-w-3xl">
        <button
          onClick={() => setMostrarRef(!mostrarRef)}
          className="flex items-center gap-2 text-xs text-onix-400 hover:text-onix-600 font-sans tracking-widest uppercase transition-colors mb-3"
        >
          <span>{mostrarRef ? '▼' : '▶'}</span>
          Preços de referência fornecedores — Abril 2026
        </button>

        {mostrarRef && (
          <div className="space-y-5">
            {PRECOS_REF.map(cat => (
              <div key={cat.categoria}>
                <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-2">{cat.categoria}</p>
                <div className="bg-white border border-ivoire-300">
                  <div className="grid grid-cols-3 gap-0 px-4 py-2 bg-ivoire-100 border-b border-ivoire-300">
                    <span className="text-[10px] tracking-widest uppercase font-sans text-onix-400">Item</span>
                    <span className="text-[10px] tracking-widest uppercase font-sans text-onix-400 text-right">Preço</span>
                    <span className="text-[10px] tracking-widest uppercase font-sans text-onix-400 text-right">Unitário</span>
                  </div>
                  {cat.itens.map((item, i) => (
                    <div key={i} className="grid grid-cols-3 gap-0 px-4 py-2 border-b border-ivoire-100 last:border-0">
                      <span className="text-xs text-onix-600 font-sans">{item.descricao}</span>
                      <span className="text-xs text-onix-700 font-sans text-right">
                        {R(item.preco)}/{item.unidade}
                      </span>
                      <span className="text-xs text-onix-400 font-sans text-right">{item.unitario}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
