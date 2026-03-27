'use client'

import { useRef, useEffect } from 'react'
import { useCadernoStore } from '@/store/useCadernoStore'
import { getPerguntasVisiveis, GRUPOS } from '@/data/perguntas'
import PreviewCaderno from '@/components/configurador/PreviewCaderno'
import PerguntaUnica from '@/components/configurador/PerguntaUnica'
import {
  IconeTamanho, IconeLivroAberto, IconeCostura, IconePapel,
  IconeElastico, IconeCantos, IconeCoracao,
  IconeSeta, IconeSetaEsq, IconeCheck,
} from '@/components/ui/Icons'

// Mapa de ícones SVG por grupo
const ICONES_GRUPO: Record<string, React.FC<{ tamanho?: number; className?: string }>> = {
  tamanho:  IconeTamanho,
  capa:     IconeLivroAberto,
  costura:  IconeCostura,
  papel:    IconePapel,
  elastico: IconeElastico,
  cantos:   IconeCantos,
  coracao:  IconeCoracao,
}

export default function PaginaConfigurador() {
  const { configuracao, perguntaIndex, avancarPergunta, voltarPergunta, irParaPergunta } = useCadernoStore()
  const direcaoRef = useRef(1)
  const previewRef = useRef<HTMLElement>(null)
  const configAnteriorRef = useRef(configuracao)

  // Auto-scroll ao preview no mobile quando qualquer opção muda
  useEffect(() => {
    if (configuracao !== configAnteriorRef.current) {
      configAnteriorRef.current = configuracao
      if (typeof window !== 'undefined' && window.innerWidth < 1024 && previewRef.current) {
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

  return (
    <div className="flex flex-col min-h-screen bg-ivoire-100">

      {/* ── CABEÇALHO MONTBLANC ── */}
      <header className="sticky top-0 z-40 bg-ivoire-100/95 backdrop-blur-sm border-b border-ivoire-400">
        <div className="flex items-center justify-between px-5 py-4 max-w-screen-xl mx-auto">

          {/* Logo / título */}
          <div>
            <p className="text-xs tracking-widest text-onix-300 uppercase font-sans mb-0.5">Ateliê</p>
            <h1 className="text-base font-serif text-onix-700 leading-tight tracking-tight">
              Caderno Artesanal
            </h1>
          </div>

          {/* Contador central — apenas desktop */}
          <div className="hidden md:block text-center">
            <p className="text-xs text-onix-300 tracking-widest uppercase">
              {perguntaIndex + 1} <span className="text-onix-200">de</span> {total}
            </p>
          </div>

          {/* Botão finalizar */}
          <button
            className="botao-primario"
            onClick={() => alert('Em breve: envio via WhatsApp!')}
          >
            Solicitar
          </button>
        </div>

        {/* Linha de progresso — muito fina */}
        <div className="h-px bg-ivoire-400">
          <div
            className="h-full bg-ouro-400 transition-all duration-700"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </header>

      {/* ── NAVEGAÇÃO DE GRUPOS — mobile (chips minimalistas) ── */}
      <div className="lg:hidden sticky top-[61px] z-30 bg-ivoire-100/98 backdrop-blur-sm border-b border-ivoire-300">
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
                onClick={() => {
                  direcaoRef.current = grupo.numero > grupoAtual ? 1 : -1
                  irParaPergunta(primeiroIndex)
                }}
                className={`
                  flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 border-b-2 transition-all duration-200 text-xs
                  ${ativo
                    ? 'border-ouro-400 text-onix-700'
                    : completo
                    ? 'border-transparent text-onix-300'
                    : 'border-transparent text-onix-200'
                  }
                `}
              >
                {completo
                  ? <IconeCheck tamanho={14} className="text-ouro-400" />
                  : Icone && <Icone tamanho={14} />
                }
                {ativo && (
                  <span className="font-sans tracking-wide text-xs">{grupo.titulo}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── LAYOUT PRINCIPAL ── */}
      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">

        {/* SIDEBAR — só desktop */}
        <aside className="hidden lg:flex flex-col w-52 xl:w-60 flex-shrink-0 border-r border-ivoire-400 bg-white sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto py-8 px-4">

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
                  flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 mb-px
                  border-l-2
                  ${ativo
                    ? 'border-l-ouro-400 text-onix-700'
                    : completo
                    ? 'border-l-transparent text-onix-300'
                    : 'border-l-transparent text-onix-200 hover:text-onix-400'
                  }
                `}
              >
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  {completo
                    ? <IconeCheck tamanho={12} className="text-ouro-400" />
                    : Icone && <Icone tamanho={14} className={ativo ? 'text-onix-600' : 'text-onix-300'} />
                  }
                </span>
                <span className={`text-xs font-sans tracking-wide ${ativo ? 'font-medium' : 'font-normal'}`}>
                  {grupo.titulo}
                </span>
              </button>
            )
          })}

          {/* Contador desktop */}
          <div className="mt-auto px-2 pt-6 border-t border-ivoire-400">
            <p className="text-xs text-onix-300 text-center tracking-widest">
              {perguntaIndex + 1} / {total}
            </p>
          </div>
        </aside>

        {/* ÁREA CENTRAL */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row flex-1">

            {/* PREVIEW — topo no mobile, centro fixo no desktop */}
            <section ref={previewRef} className="lg:flex-1 flex items-center justify-center bg-ivoire-200 py-8 px-6 lg:sticky lg:top-[61px] lg:h-[calc(100vh-61px)]">
              <PreviewCaderno />
            </section>

            {/* PAINEL DA PERGUNTA */}
            <aside className="
              w-full lg:w-96 xl:w-[420px] flex-shrink-0
              border-t lg:border-t-0 lg:border-l border-ivoire-400
              bg-white flex flex-col
              lg:sticky lg:top-[61px] lg:h-[calc(100vh-61px)] lg:overflow-hidden
            ">
              {/* Cabeçalho do painel — desktop */}
              <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-ivoire-300 flex-shrink-0">
                <span className="label-categoria">
                  {GRUPOS.find(g => g.numero === grupoAtual)?.titulo}
                </span>
                <span className="text-xs font-mono text-onix-300">
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
                  />
                )}
              </div>

              {/* Navegação — desktop */}
              <div className="hidden lg:flex gap-2 px-6 py-5 border-t border-ivoire-300 flex-shrink-0">
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
                  onClick={eUltima ? () => alert('Em breve: envio via WhatsApp!') : avancar}
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
            </aside>
          </div>
        </div>
      </div>

      {/* ── BARRA FIXA INFERIOR — apenas mobile ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-sm border-t border-ivoire-400 px-5 py-3 flex items-center gap-3 safe-bottom">

        {/* Mini progresso */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-onix-300 tracking-wide truncate">
              {GRUPOS.find(g => g.numero === grupoAtual)?.titulo}
            </span>
            <span className="text-xs font-mono text-onix-300 flex-shrink-0 ml-2">
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
          onClick={eUltima ? () => alert('Em breve: envio via WhatsApp!') : avancar}
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
      </nav>

      <div className="lg:hidden h-20" />
    </div>
  )
}
