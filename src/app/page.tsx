'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useCadernoStore } from '@/store/useCadernoStore'
import type { ConfiguracaoCaderno } from '@/types/caderno'
import { getPerguntasVisiveis, GRUPOS } from '@/data/perguntas'
import PreviewCaderno from '@/components/configurador/PreviewCaderno'
import PerguntaUnica from '@/components/configurador/PerguntaUnica'
import {
  IconeTamanho, IconeLivroAberto, IconeCostura, IconePapel,
  IconeElastico, IconeCantos, IconeCoracao,
  IconeSeta, IconeSetaEsq, IconeCheck,
} from '@/components/ui/Icons'

// ─── Mapa de ícones SVG por grupo ─────────────────────────────
const ICONES_GRUPO: Record<string, React.FC<{ tamanho?: number; className?: string }>> = {
  tamanho:  IconeTamanho,
  capa:     IconeLivroAberto,
  costura:  IconeCostura,
  papel:    IconePapel,
  elastico: IconeElastico,
  cantos:   IconeCantos,
  coracao:  IconeCoracao,
}

// ─── Mensagens da sobrancelha ──────────────────────────────────
const MENSAGENS_SOBRANCELHA = [
  '✦  Entregas rápidas em todo o país',
  '✦  Garantia de 10 anos',
  '✦  Feito à mão com amor artesanal',
]

// ─── Cálculo do total ──────────────────────────────────────────
function calcularTotal(c: ConfiguracaoCaderno): number {
  let total = 89 // base

  // Tamanho
  if (c.tamanho === 'A5')            total += 15
  else if (c.tamanho === 'A4')       total += 30
  else if (c.tamanho === 'personalizado') total += 50

  // Espessura
  if (c.espessura === 'medio')       total += 10
  else if (c.espessura === 'grosso') total += 20
  else if (c.espessura === 'extra-grosso') total += 35

  // Material capa
  if      (c.materialCapa === 'couro')         total += 80
  else if (c.materialCapa === 'sintetico')     total += 40
  else if (c.materialCapa === 'linho')         total += 35
  else if (c.materialCapa === 'tecido')        total += 30
  else if (c.materialCapa === 'papel-especial') total += 20
  else if (c.materialCapa === 'kraft')         total += 10

  // Estampa
  if      (c.estampaCapa === 'tematica')   total += 30
  else if (c.estampaCapa === 'abstrata')   total += 20
  else if (c.estampaCapa === 'floral')     total += 15
  else if (c.estampaCapa === 'minimalista') total += 10

  // Gravação
  if      (c.gravacaoCapa === 'bordado')      total += 45
  else if (c.gravacaoCapa === 'alto-relevo')  total += 35
  else if (c.gravacaoCapa === 'baixo-relevo') total += 25

  // Encadernação
  if      (c.tipoEncadernacao === 'francesa-cruzada') total += 25
  else if (c.tipoEncadernacao === 'wire-o')            total += 30
  else if (c.tipoEncadernacao === 'long-stitch')       total += 20

  // Papel
  if      (c.tipoPapel === 'vegetal')   total += 20
  else if (c.tipoPapel === 'polen')     total += 10
  else if (c.tipoPapel === 'reciclado') total += 5

  // Gramatura
  if      (c.graturaPapel === '240g') total += 30
  else if (c.graturaPapel === '180g') total += 18
  else if (c.graturaPapel === '120g') total += 8

  // Elementos funcionais
  if (c.elasticoAtivo)       total += 12
  if (c.marcadorAtivo)       total += 15
  if (c.bolsoInterno)        total += 20
  if (c.portaCaneta)         total += 10
  if (c.envelopeAcoplado)    total += 18
  if (c.abasOrelhas)         total += 12

  // Acabamentos
  if (c.pinturaBordasAtiva)             total += 35
  if (c.tipoCorteEspecial === 'deckle-edge') total += 25
  if (c.tipoLaminacao === 'fosca')      total += 15
  else if (c.tipoLaminacao === 'brilho') total += 15

  // Guarda
  if (c.materialGuarda !== 'branca')    total += 15

  return total
}

// ─── Componente sobrancelha ────────────────────────────────────
function Sobrancelha() {
  const [idx, setIdx] = useState(0)
  const [visivel, setVisivel] = useState(true)

  useEffect(() => {
    const intervalo = setInterval(() => {
      setVisivel(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % MENSAGENS_SOBRANCELHA.length)
        setVisivel(true)
      }, 350)
    }, 3500)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <div className="bg-onix-800 text-ivoire-100 text-center py-2 px-4 text-xs tracking-widest font-sans uppercase overflow-hidden">
      <span
        className="inline-block transition-all duration-300"
        style={{ opacity: visivel ? 1 : 0, transform: visivel ? 'translateY(0)' : 'translateY(-6px)' }}
      >
        {MENSAGENS_SOBRANCELHA[idx]}
      </span>
    </div>
  )
}

// ─── Componente total ──────────────────────────────────────────
function TotalPedido({ valor }: { valor: number }) {
  return (
    <div className="px-6 py-4 border-t border-ivoire-300 bg-ivoire-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-onix-500 tracking-widest uppercase font-sans">Total estimado</p>
          <p className="text-xs text-onix-400 font-sans mt-0.5">Valores finais confirmados no pedido</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-serif text-onix-700 tracking-tight">
            R$ {valor.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Modal de solicitação ──────────────────────────────────────
function ModalSolicitar({
  total,
  configuracao,
  aoFechar,
}: {
  total: number
  configuracao: ConfiguracaoCaderno
  aoFechar: () => void
}) {
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, whatsapp, configuracao, total }),
      })

      if (!res.ok) throw new Error('Erro ao salvar pedido')

      const numeroWhats = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? '5500000000000'
      const texto = encodeURIComponent(
        `Olá! Acabei de configurar meu caderno artesanal pelo site.\n\n` +
        `*Nome:* ${nome}\n` +
        `*Valor estimado:* R$ ${total.toFixed(2).replace('.', ',')}\n\n` +
        `Gostaria de confirmar o pedido! 🎉`
      )
      window.open(`https://wa.me/${numeroWhats}?text=${texto}`, '_blank')
      aoFechar()
    } catch {
      setErro('Não foi possível enviar o pedido. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-onix-800/60 backdrop-blur-sm px-4 pb-8 lg:pb-0"
      onClick={aoFechar}
    >
      <div
        className="bg-white w-full max-w-sm p-8 border border-ivoire-400"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-8 h-px bg-ouro-400 mb-6" />
        <h3 className="text-lg font-serif text-onix-700 mb-2">Quase lá!</h3>
        <p className="text-sm text-onix-400 leading-relaxed mb-1">
          Seu caderno foi configurado. O valor estimado é:
        </p>
        <p className="text-2xl font-serif text-onix-700 mb-6">
          R$ {total.toFixed(2).replace('.', ',')}
        </p>

        <form onSubmit={handleEnviar}>
          <label className="block text-xs text-onix-500 tracking-widest uppercase font-sans mb-1.5">
            Seu nome
          </label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full border border-ivoire-400 bg-ivoire-50 px-4 py-2.5 text-sm text-onix-700 outline-none focus:border-onix-400 transition-colors mb-4"
            placeholder="Maria Silva"
            required
          />

          <label className="block text-xs text-onix-500 tracking-widest uppercase font-sans mb-1.5">
            WhatsApp
          </label>
          <input
            type="tel"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            className="w-full border border-ivoire-400 bg-ivoire-50 px-4 py-2.5 text-sm text-onix-700 outline-none focus:border-onix-400 transition-colors mb-6"
            placeholder="(11) 99999-9999"
            required
          />

          {erro && <p className="text-xs text-red-600 mb-4">{erro}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-onix-700 hover:bg-onix-800 disabled:opacity-50 text-ivoire-100 py-3 text-xs tracking-widest uppercase font-sans transition-colors duration-200 mb-3"
          >
            {enviando ? 'Enviando...' : 'Finalizar pelo WhatsApp'}
          </button>
          <button
            type="button"
            onClick={aoFechar}
            className="w-full text-xs text-onix-400 hover:text-onix-600 py-1 font-sans transition-colors"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Página principal ──────────────────────────────────────────
export default function PaginaConfigurador() {
  const { configuracao, perguntaIndex, avancarPergunta, voltarPergunta, irParaPergunta } = useCadernoStore()
  const direcaoRef = useRef(1)
  const previewRef = useRef<HTMLElement>(null)
  const configAnteriorRef = useRef(configuracao)
  const [modalAberto, setModalAberto] = useState(false)

  const abrirModal = useCallback(() => setModalAberto(true), [])
  const fecharModal = useCallback(() => setModalAberto(false), [])

  useEffect(() => {
    if (configuracao !== configAnteriorRef.current) {
      configAnteriorRef.current = configuracao
      if (typeof globalThis.window !== 'undefined' && globalThis.window.innerWidth < 1024 && previewRef.current) {
        previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [configuracao])

  const perguntas = getPerguntasVisiveis(configuracao)
  const total = perguntas.length
  const perguntaAtual = perguntas[perguntaIndex] ?? perguntas[0]
  const grupoAtual = perguntaAtual?.grupo ?? 1
  const progresso = ((perguntaIndex + 1) / total) * 100
  const eUltima = perguntaIndex === total - 1

  function avancar() {
    direcaoRef.current = 1
    avancarPergunta(total)
  }

  function voltar() {
    direcaoRef.current = -1
    voltarPergunta()
  }

  function avancarSeAutomatico() {
    if (perguntaAtual?.avancaAutomatico && perguntaIndex < total - 1) {
      setTimeout(() => {
        direcaoRef.current = 1
        avancarPergunta(total)
      }, 160)
    }
  }

  const totalValor = calcularTotal(configuracao)

  return (
    <div className="flex flex-col min-h-screen bg-ivoire-100">

      {/* Modal de solicitação */}
      {modalAberto && (
        <ModalSolicitar total={totalValor} configuracao={configuracao} aoFechar={fecharModal} />
      )}

      {/* ── SOBRANCELHA ── */}
      <Sobrancelha />

      {/* ── CABEÇALHO ── */}
      <header className="sticky top-[33px] z-40 bg-ivoire-100/95 backdrop-blur-sm border-b border-ivoire-400">
        <div className="flex items-center justify-between px-5 py-4 max-w-screen-xl mx-auto">

          {/* Logo */}
          <div>
            <p className="text-xs tracking-widest text-onix-500 uppercase font-sans mb-0.5">Ateliê</p>
            <h1 className="text-base font-serif text-onix-700 leading-tight tracking-tight">
              Caderno Artesanal
            </h1>
          </div>

          {/* Contador central */}
          <div className="text-center">
            <p className="text-xs text-onix-500 tracking-widest uppercase">
              {perguntaIndex + 1} <span className="text-onix-500">de</span> {total}
            </p>
          </div>
        </div>

        {/* Linha de progresso */}
        <div className="h-px bg-ivoire-400">
          <div
            className="h-full bg-ouro-400 transition-all duration-700"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </header>

      {/* ── NAVEGAÇÃO DE GRUPOS — mobile ── */}
      <div className="lg:hidden sticky top-[94px] z-30 bg-ivoire-100/98 backdrop-blur-sm border-b border-ivoire-300">
        <div className="flex gap-0 overflow-x-auto no-scrollbar">
          {GRUPOS.map((grupo) => {
            const perguntasDoGrupo = perguntas.filter((p) => p.grupo === grupo.numero)
            if (perguntasDoGrupo.length === 0) return null
            const primeiroIndex = perguntas.indexOf(perguntasDoGrupo[0])
            const ativo = grupo.numero === grupoAtual
            const completo = grupo.numero < grupoAtual
            const Icone = ICONES_GRUPO[grupo.iconeKey]

            return (
              <button
                key={grupo.numero}
                aria-label={grupo.titulo}
                onClick={() => {
                  direcaoRef.current = grupo.numero > grupoAtual ? 1 : -1
                  irParaPergunta(primeiroIndex)
                }}
                className={`
                  flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 border-b-2 transition-all duration-200 text-xs
                  ${ativo ? 'border-ouro-400 text-onix-700' : completo ? 'border-transparent text-onix-300' : 'border-transparent text-onix-200'}
                `}
              >
                {completo ? <IconeCheck tamanho={14} className="text-ouro-400" /> : Icone && <Icone tamanho={14} />}
                {ativo && <span className="font-sans tracking-wide text-xs">{grupo.titulo}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── LAYOUT PRINCIPAL ── */}
      <main className="flex flex-1 max-w-screen-xl mx-auto w-full">

        {/* SIDEBAR — desktop */}
        <aside className="hidden lg:flex flex-col w-52 xl:w-60 flex-shrink-0 border-r border-ivoire-400 bg-white sticky top-[94px] h-[calc(100vh-94px)] overflow-y-auto py-8 px-4">

          <p className="label-categoria mb-5 px-2">Categorias</p>

          {GRUPOS.map((grupo) => {
            const perguntasDoGrupo = perguntas.filter((p) => p.grupo === grupo.numero)
            if (perguntasDoGrupo.length === 0) return null
            const primeiroIndex = perguntas.indexOf(perguntasDoGrupo[0])
            const ativo = grupo.numero === grupoAtual
            const completo = grupo.numero < grupoAtual
            const Icone = ICONES_GRUPO[grupo.iconeKey]

            return (
              <button
                key={grupo.numero}
                onClick={() => {
                  direcaoRef.current = grupo.numero > grupoAtual ? 1 : -1
                  irParaPergunta(primeiroIndex)
                }}
                className={`
                  flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 mb-px border-l-2
                  ${ativo ? 'border-l-ouro-400 text-onix-700' : completo ? 'border-l-transparent text-onix-500' : 'border-l-transparent text-onix-500 hover:text-onix-700'}
                `}
              >
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  {completo
                    ? <IconeCheck tamanho={12} className="text-ouro-400" />
                    : Icone && <Icone tamanho={14} className={ativo ? 'text-onix-600' : 'text-onix-500'} />
                  }
                </span>
                <span className={`text-xs font-sans tracking-wide ${ativo ? 'font-medium' : 'font-normal'}`}>
                  {grupo.titulo}
                </span>
              </button>
            )
          })}

          <div className="mt-auto px-2 pt-6 border-t border-ivoire-400">
            <p className="text-xs text-onix-500 text-center tracking-widest">
              {perguntaIndex + 1} / {total}
            </p>
          </div>
        </aside>

        {/* ÁREA CENTRAL */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row flex-1">

            {/* PREVIEW */}
            <section ref={previewRef} className="lg:flex-1 flex items-center justify-center bg-ivoire-200 py-8 px-6 lg:sticky lg:top-[94px] lg:h-[calc(100vh-94px)]">
              <PreviewCaderno />
            </section>

            {/* PAINEL DA PERGUNTA */}
            <aside className="
              w-full lg:w-96 xl:w-[420px] flex-shrink-0
              border-t lg:border-t-0 lg:border-l border-ivoire-400
              bg-white flex flex-col
              lg:sticky lg:top-[94px] lg:h-[calc(100vh-94px)] lg:overflow-hidden
            ">
              {/* Cabeçalho do painel — desktop */}
              <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-ivoire-300 flex-shrink-0">
                <span className="label-categoria">
                  {GRUPOS.find(g => g.numero === grupoAtual)?.titulo}
                </span>
                <span className="text-xs font-mono text-onix-500">
                  {perguntaIndex + 1} / {total}
                </span>
              </div>

              {/* Conteúdo da pergunta */}
              <div className="flex-1 overflow-y-auto scrollbar-fino px-6 py-7">
                {perguntaAtual && (
                  <PerguntaUnica
                    pergunta={perguntaAtual}
                    totalPerguntas={total}
                    direcao={direcaoRef.current}
                    aoAvancarAutomatico={avancarSeAutomatico}
                  />
                )}
              </div>

              {/* Navegação — desktop */}
              <div className="hidden lg:flex gap-2 px-6 py-4 border-t border-ivoire-300 flex-shrink-0">
                <button
                  onClick={voltar}
                  disabled={perguntaIndex === 0}
                  className="
                    flex items-center gap-2 border border-ivoire-400 hover:border-onix-300
                    text-onix-400 hover:text-onix-600
                    px-5 py-3 text-xs tracking-widest uppercase font-sans
                    transition-all duration-200 disabled:opacity-30 active:scale-95
                  "
                >
                  <IconeSetaEsq tamanho={14} />
                  Voltar
                </button>
                <button
                  onClick={eUltima ? abrirModal : avancar}
                  className="
                    flex-1 flex items-center justify-center gap-2
                    bg-onix-700 hover:bg-onix-800 text-ivoire-100
                    px-5 py-3 text-xs tracking-widest uppercase font-sans
                    transition-all duration-200 active:scale-95
                  "
                >
                  {eUltima ? 'Finalizar' : 'Próximo'}
                  {!eUltima && <IconeSeta tamanho={14} />}
                </button>
              </div>

              {/* Total — desktop */}
              <div className="hidden lg:block flex-shrink-0">
                <TotalPedido valor={totalValor} />
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* ── BARRA FIXA INFERIOR — mobile ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-sm border-t border-ivoire-400 safe-bottom">

        {/* Total mobile */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <span className="text-xs text-onix-500 tracking-widest uppercase font-sans">Total</span>
          <span className="text-base font-serif text-onix-700">
            R$ {totalValor.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="flex items-center gap-3 px-5 py-3">
          {/* Mini progresso */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-onix-500 tracking-wide truncate">
                {GRUPOS.find(g => g.numero === grupoAtual)?.titulo}
              </span>
              <span className="text-xs font-mono text-onix-500 flex-shrink-0 ml-2">
                {perguntaIndex + 1}/{total}
              </span>
            </div>
            <div className="h-px bg-ivoire-400 overflow-hidden">
              <div
                className="h-full bg-ouro-400 transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          {/* Botão voltar */}
          <button
            onClick={voltar}
            disabled={perguntaIndex === 0}
            aria-label="Voltar pergunta"
            className="
              w-10 h-10 border border-ivoire-400 flex items-center justify-center
              text-onix-400 disabled:opacity-20 hover:border-onix-300
              transition-all duration-150 flex-shrink-0 active:scale-90
            "
          >
            <IconeSetaEsq tamanho={16} />
          </button>

          {/* Botão próximo */}
          <button
            onClick={eUltima ? abrirModal : avancar}
            aria-label={eUltima ? 'Finalizar pedido' : 'Próxima pergunta'}
            className="
              flex items-center gap-2
              bg-onix-700 hover:bg-onix-800 text-ivoire-100
              px-5 h-10 text-xs tracking-widest uppercase font-sans
              transition-all duration-200 active:scale-95 flex-shrink-0
            "
          >
            {eUltima ? 'Solicitar' : 'Próximo'}
            {!eUltima && <IconeSeta tamanho={14} />}
          </button>
        </div>
      </nav>

      <div className="lg:hidden h-28" />
    </div>
  )
}
