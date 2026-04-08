'use client'

import { LazyMotion, m as motion, AnimatePresence } from 'framer-motion'

const loadFeatures = () => import('@/lib/motion-features').then(r => r.default)
import { useCadernoStore } from '@/store/useCadernoStore'
import type { Pergunta } from '@/data/perguntas'
import type { ConfiguracaoCaderno } from '@/types/caderno'
import { IconeCheck } from '@/components/ui/Icons'

interface Props {
  pergunta: Pergunta
  totalPerguntas: number
  direcao: number   // 1 = avançando, -1 = voltando
  aoAvancarAutomatico?: () => void
}

// ─── Seleção em grade (2 colunas) ────────────────────────────
function SelecaoGrade({ pergunta, aoSelecionar }: {
  pergunta: Pergunta
  aoSelecionar: (valor: string) => void
}) {
  const { configuracao } = useCadernoStore()
  const valorAtual = String(configuracao[pergunta.campo] ?? '')

  return (
    <div className="grid grid-cols-2 gap-2">
      {pergunta.opcoes?.map((opcao) => {
        const selecionado = valorAtual === opcao.valor
        return (
          <button
            key={opcao.valor}
            onClick={() => aoSelecionar(opcao.valor)}
            className={`
              text-left p-4 border transition-all duration-200 active:scale-[0.98]
              ${selecionado
                ? 'border-onix-600 bg-white shadow-luxo'
                : 'border-ivoire-400 hover:border-onix-300 bg-white'
              }
            `}
          >
            {/* Indicador de cor — se hex disponível */}
            {opcao.hex && (
              <span
                className="block w-6 h-6 rounded-full mb-3 border border-ivoire-400"
                style={{ backgroundColor: opcao.hex }}
              />
            )}
            <span className={`block text-sm font-serif ${selecionado ? 'text-onix-700' : 'text-onix-500'}`}>
              {opcao.label}
            </span>
            {opcao.descricao && (
              <span className="block text-xs text-onix-500 mt-1 leading-snug">{opcao.descricao}</span>
            )}
            {selecionado && (
              <span className="block mt-2">
                <IconeCheck tamanho={12} className="text-ouro-400" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Seleção em lista (1 coluna) ─────────────────────────────
function SelecaoLista({ pergunta, aoSelecionar }: {
  pergunta: Pergunta
  aoSelecionar: (valor: string) => void
}) {
  const { configuracao } = useCadernoStore()
  const valorAtual = String(configuracao[pergunta.campo] ?? '')

  return (
    <div className="flex flex-col gap-1.5">
      {pergunta.opcoes?.map((opcao) => {
        const selecionado = valorAtual === opcao.valor
        return (
          <button
            key={opcao.valor}
            onClick={() => aoSelecionar(opcao.valor)}
            className={`
              flex items-center gap-4 p-4 border text-left transition-all duration-200 active:scale-[0.99]
              ${selecionado
                ? 'border-onix-600 bg-white shadow-luxo'
                : 'border-ivoire-400 hover:border-onix-300 bg-white'
              }
            `}
          >
            {/* Indicador de espessura */}
            {opcao.altura ? (
              <span
                className={`w-0.5 rounded-full flex-shrink-0 transition-colors duration-200 ${selecionado ? 'bg-ouro-400' : 'bg-onix-200'}`}
                style={{ height: `${opcao.altura}px` }}
              />
            ) : null}

            <span className="flex-1 min-w-0">
              <span className={`block text-sm font-serif ${selecionado ? 'text-onix-700' : 'text-onix-500'}`}>
                {opcao.label}
              </span>
              {opcao.descricao && (
                <span className="block text-xs text-onix-500 mt-0.5 leading-snug">{opcao.descricao}</span>
              )}
            </span>

            {selecionado && (
              <IconeCheck tamanho={14} className="text-ouro-400 flex-shrink-0" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Seletor de cor ───────────────────────────────────────────
function SeletorCor({ pergunta, aoSelecionar }: {
  pergunta: Pergunta
  aoSelecionar: (valor: string) => void
}) {
  const { configuracao, atualizarOpcao, marcarRespondida } = useCadernoStore()
  const valorAtual = String(configuracao[pergunta.campo] ?? '')

  return (
    <div className="flex flex-col gap-4">
      {/* Paleta de cores */}
      <div className="flex flex-wrap gap-3">
        {pergunta.opcoes?.map((opcao) => (
          <button
            key={opcao.valor}
            title={opcao.label}
            onClick={() => aoSelecionar(opcao.valor)}
            className={`
              w-10 h-10 rounded-full transition-all duration-200 active:scale-90
              ${valorAtual === opcao.valor
                ? 'scale-110 ring-2 ring-onix-500 ring-offset-2'
                : 'hover:scale-105 ring-1 ring-ivoire-400'
              }
            `}
            style={{ backgroundColor: opcao.hex ?? opcao.valor }}
          />
        ))}
      </div>

      {/* Separador */}
      <div className="border-t border-ivoire-400" />

      {/* Cor personalizada */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-onix-500 tracking-wide uppercase">Personalizada</span>
        <input
          type="color"
          value={valorAtual.startsWith('#') ? valorAtual : '#6B4226'}
          onChange={(e) => {
            atualizarOpcao(pergunta.campo as keyof ConfiguracaoCaderno, e.target.value as never)
            marcarRespondida(pergunta.id)
          }}
          className="w-9 h-9 rounded-full cursor-pointer border border-ivoire-400 flex-shrink-0"
        />
        <span className="text-xs font-mono text-onix-500">{valorAtual}</span>
      </div>

      {/* Preview da cor selecionada */}
      <motion.div
        className="h-14 border border-ivoire-400 flex items-end justify-end p-2"
        style={{ backgroundColor: valorAtual.startsWith('#') ? valorAtual : '#6B4226' }}
        animate={{ backgroundColor: valorAtual } as Record<string, string>}
        transition={{ duration: 0.3 }}
      >
        <span className="text-xs font-sans font-medium bg-white/70 px-2 py-0.5 text-onix-500 tracking-wider">
          PRÉVIA
        </span>
      </motion.div>
    </div>
  )
}

// ─── Toggle sim/não ───────────────────────────────────────────
function Toggle({ pergunta, aoSelecionar }: {
  pergunta: Pergunta
  aoSelecionar: (valor: boolean) => void
}) {
  const { configuracao } = useCadernoStore()
  const valorAtual = Boolean(configuracao[pergunta.campo])

  return (
    <div className="flex gap-2">
      <button
        onClick={() => aoSelecionar(true)}
        className={`
          flex-1 py-6 border text-center transition-all duration-200 active:scale-95
          ${valorAtual
            ? 'border-onix-600 bg-white shadow-luxo'
            : 'border-ivoire-400 bg-ivoire-100 hover:border-onix-200'
          }
        `}
      >
        <span className="block mb-2">
          <IconeCheck tamanho={20} className={`mx-auto ${valorAtual ? 'text-ouro-400' : 'text-onix-400'}`} />
        </span>
        <span className={`block text-sm font-serif ${valorAtual ? 'text-onix-700' : 'text-onix-500'}`}>
          Sim, quero
        </span>
      </button>
      <button
        onClick={() => aoSelecionar(false)}
        className={`
          flex-1 py-6 border text-center transition-all duration-200 active:scale-95
          ${!valorAtual
            ? 'border-onix-600 bg-white shadow-luxo'
            : 'border-ivoire-400 bg-ivoire-100 hover:border-onix-200'
          }
        `}
      >
        <span className={`block text-xl mb-2 font-sans ${!valorAtual ? 'text-onix-500' : 'text-onix-400'}`}>—</span>
        <span className={`block text-sm font-serif ${!valorAtual ? 'text-onix-700' : 'text-onix-500'}`}>
          Não, obrigado
        </span>
      </button>
    </div>
  )
}

// ─── Múltipla escolha (checkboxes) ───────────────────────────
function MultiplaEscolha({ pergunta }: { pergunta: Pergunta }) {
  const { configuracao, atualizarOpcao, toggleAplicacaoCapa, marcarRespondida } = useCadernoStore()

  const camposBooleanos = ['extras-elementos', 'extras-afetivos']
  const ehCampoBooleano = camposBooleanos.includes(pergunta.id)
  const ehAplicacoesCapa = pergunta.id === 'aplicacoesCapa'

  function estaAtivo(valor: string): boolean {
    if (ehAplicacoesCapa) {
      return (configuracao.aplicacoesCapa as string[]).includes(valor)
    }
    if (ehCampoBooleano) {
      return Boolean(configuracao[valor as keyof ConfiguracaoCaderno])
    }
    return false
  }

  function toggleOpcao(valor: string) {
    marcarRespondida(pergunta.id)
    if (ehAplicacoesCapa) {
      toggleAplicacaoCapa(valor as ConfiguracaoCaderno['aplicacoesCapa'][number])
      return
    }
    if (ehCampoBooleano) {
      const atual = Boolean(configuracao[valor as keyof ConfiguracaoCaderno])
      atualizarOpcao(valor as keyof ConfiguracaoCaderno, !atual as never)
      return
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {pergunta.opcoes?.map((opcao) => {
        const ativo = estaAtivo(opcao.valor)
        return (
          <button
            key={opcao.valor}
            onClick={() => toggleOpcao(opcao.valor)}
            className={`
              flex items-center gap-3 p-4 border text-left transition-all duration-200 active:scale-[0.99]
              ${ativo
                ? 'border-onix-600 bg-white shadow-luxo'
                : 'border-ivoire-400 hover:border-onix-300 bg-white'
              }
            `}
          >
            {/* Checkbox quadrado — sem bordas arredondadas */}
            <span className={`
              w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all duration-150
              ${ativo ? 'bg-onix-700 border-onix-700' : 'border-onix-300'}
            `}>
              {ativo && <IconeCheck tamanho={10} className="text-white" />}
            </span>

            <span>
              <span className={`block text-sm font-serif ${ativo ? 'text-onix-700' : 'text-onix-500'}`}>
                {opcao.label}
              </span>
              {opcao.descricao && (
                <span className="block text-xs text-onix-500 mt-0.5 leading-snug">{opcao.descricao}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Campo de texto ───────────────────────────────────────────
function CampoTexto({ pergunta }: { pergunta: Pergunta }) {
  const { configuracao, atualizarOpcao, marcarRespondida } = useCadernoStore()
  const valor = String(configuracao[pergunta.campo] ?? '')
  const placeholder = pergunta.placeholder ?? 'Escreva aqui...'
  const maxLength = pergunta.maxLength ?? 200

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={valor}
        onChange={(e) => {
          atualizarOpcao(pergunta.campo as keyof ConfiguracaoCaderno, e.target.value as never)
          if (e.target.value.trim().length > 0) marcarRespondida(pergunta.id)
        }}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={2}
        className="w-full border border-ivoire-400 focus:border-onix-400 px-4 py-3 text-sm text-onix-600
                   placeholder:text-onix-200 focus:outline-none bg-white transition-colors duration-200
                   resize-none font-sans"
      />
      <div className="flex justify-between text-xs text-onix-500">
        <span className="tracking-wide">Será gravado exatamente como você escrever</span>
        <span className="font-mono">{valor.length}/{maxLength}</span>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────
export default function PerguntaUnica({ pergunta, totalPerguntas: _totalPerguntas, direcao, aoAvancarAutomatico }: Props) {
  const { atualizarOpcao, marcarRespondida } = useCadernoStore()

  function aoSelecionar(valor: string) {
    atualizarOpcao(pergunta.campo as keyof ConfiguracaoCaderno, valor as never)
    marcarRespondida(pergunta.id)
    if (pergunta.avancaAutomatico) aoAvancarAutomatico?.()
  }

  function aoSelecionarToggle(valor: boolean) {
    atualizarOpcao(pergunta.campo as keyof ConfiguracaoCaderno, valor as never)
    marcarRespondida(pergunta.id)
    if (pergunta.avancaAutomatico) aoAvancarAutomatico?.()
  }

  return (
    <LazyMotion features={loadFeatures}>
    <AnimatePresence mode="wait" custom={direcao}>
      <motion.div
        key={pergunta.id}
        custom={direcao}
        initial={{ opacity: 0, x: direcao * 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direcao * -32 }}
        transition={{ duration: 0.26, ease: 'easeOut' }}
        className="flex flex-col gap-6"
      >
        {/* Título e descrição */}
        <div>
          <h2 className="text-lg font-serif text-onix-700 leading-snug">
            {pergunta.titulo}
          </h2>
          {pergunta.descricao && (
            <p className="text-xs text-onix-500 mt-1.5 leading-relaxed tracking-wide">
              {pergunta.descricao}
            </p>
          )}
          {/* Linha decorativa ouro */}
          <div className="mt-3 w-8 h-px bg-ouro-400" />
        </div>

        {/* Input correspondente ao tipo */}
        {pergunta.tipo === 'selecao-grade' && (
          <SelecaoGrade pergunta={pergunta} aoSelecionar={aoSelecionar} />
        )}
        {pergunta.tipo === 'selecao-lista' && (
          <SelecaoLista pergunta={pergunta} aoSelecionar={aoSelecionar} />
        )}
        {pergunta.tipo === 'cor' && (
          <SeletorCor pergunta={pergunta} aoSelecionar={aoSelecionar} />
        )}
        {pergunta.tipo === 'toggle' && (
          <Toggle pergunta={pergunta} aoSelecionar={aoSelecionarToggle} />
        )}
        {pergunta.tipo === 'multipla-escolha' && (
          <MultiplaEscolha pergunta={pergunta} />
        )}
        {pergunta.tipo === 'texto' && (
          <CampoTexto pergunta={pergunta} />
        )}
      </motion.div>
    </AnimatePresence>
    </LazyMotion>
  )
}
