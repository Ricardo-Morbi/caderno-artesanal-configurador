'use client'

import { useCadernoStore } from '@/store/useCadernoStore'
import type { MaterialGuarda, PadraoGuarda } from '@/types/caderno'

const CORES_GUARDA = [
  { nome: 'Trigo',          hex: '#F5DEB3' },
  { nome: 'Sálvia',         hex: '#B5C4B1' },
  { nome: 'Terracota claro', hex: '#D4B8A0' },
  { nome: 'Azul cinza',     hex: '#8B9DC3' },
  { nome: 'Lavanda',        hex: '#C3A8C8' },
  { nome: 'Dourado',        hex: '#D4AF37' },
  { nome: 'Preto',          hex: '#1A1A1A' },
  { nome: 'Creme',          hex: '#F5F0E0' },
]

const opcoesMaterial: { valor: MaterialGuarda; label: string; descricao: string; icone: string }[] = [
  { valor: 'branca',      label: 'Branca',      descricao: 'Clássica · Neutra · Elegante',      icone: '⬜' },
  { valor: 'colorida',    label: 'Colorida',    descricao: 'Cor sólida personalizada',           icone: '🎨' },
  { valor: 'marmorizada', label: 'Marmorizada', descricao: 'Efeito mármore · Sofisticado',       icone: '🪨' },
  { valor: 'kraft',       label: 'Kraft',       descricao: 'Rústica · Natural · Artesanal',      icone: '📦' },
  { valor: 'estampada',   label: 'Estampada',   descricao: 'Com padrão impresso à escolha',      icone: '🌸' },
]

const opcoesEstampa: { valor: PadraoGuarda; label: string; descricao: string }[] = [
  { valor: 'floral',     label: 'Floral',     descricao: 'Flores delicadas e botânicos' },
  { valor: 'geometrico', label: 'Geométrico', descricao: 'Formas e linhas precisas' },
  { valor: 'aquarela',   label: 'Aquarela',   descricao: 'Pinceladas suaves de tinta' },
  { valor: 'liso',       label: 'Liso',       descricao: 'Cor uniforme, sem padrão' },
]

export default function EtapaGuarda() {
  const { configuracao, atualizarOpcao } = useCadernoStore()

  return (
    <div className="flex flex-col gap-6">

      {/* Introdução */}
      <div className="rounded-xl bg-ivoire-200 border border-ivoire-400 p-4">
        <p className="text-xs text-onix-300 leading-relaxed">
          A <strong className="text-onix-500">guarda</strong> é a folha decorativa colada na parte interna da capa — a primeira e a última página do caderno. Ela dá personalidade ao abrir e fechar o caderno.
        </p>
      </div>

      {/* Material */}
      <div>
        <h3 className="text-sm font-medium text-marrom-400 mb-3">Material da guarda</h3>
        <div className="flex flex-col gap-2">
          {opcoesMaterial.map((opcao) => (
            <button
              key={opcao.valor}
              onClick={() => atualizarOpcao('materialGuarda', opcao.valor)}
              className={`cartao-opcao text-left flex items-center gap-3 transition-all duration-200 ${
                configuracao.materialGuarda === opcao.valor ? 'cartao-opcao-selecionado' : ''
              }`}
            >
              <span className="text-xl flex-shrink-0">{opcao.icone}</span>
              <span>
                <span className="block text-sm font-medium text-marrom-500">{opcao.label}</span>
                <span className="block text-xs text-marrom-300 mt-0.5">{opcao.descricao}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cor — só para colorida */}
      {configuracao.materialGuarda === 'colorida' && (
        <div>
          <h3 className="text-sm font-medium text-marrom-400 mb-3">Cor da guarda</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {CORES_GUARDA.map((cor) => (
              <button
                key={cor.hex}
                title={cor.nome}
                onClick={() => atualizarOpcao('corGuarda', cor.hex)}
                className={`seletor-cor border ${configuracao.corGuarda === cor.hex ? 'seletor-cor-selecionado' : ''}`}
                style={{
                  backgroundColor: cor.hex,
                  border: cor.hex === '#F5F0E0' ? '2px solid #E8D5B7' : undefined,
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="cor-guarda-custom" className="text-xs text-marrom-300">Cor personalizada:</label>
            <input
              id="cor-guarda-custom"
              type="color"
              value={configuracao.corGuarda}
              onChange={(e) => atualizarOpcao('corGuarda', e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border border-creme-300"
            />
            <span className="text-xs font-mono text-marrom-300">{configuracao.corGuarda}</span>
          </div>
        </div>
      )}

      {/* Padrão de estampa — só para estampada */}
      {configuracao.materialGuarda === 'estampada' && (
        <div>
          <h3 className="text-sm font-medium text-marrom-400 mb-3">Padrão de estampa</h3>
          <div className="grid grid-cols-2 gap-2">
            {opcoesEstampa.map((opcao) => (
              <button
                key={opcao.valor}
                onClick={() => atualizarOpcao('padraoGuarda', opcao.valor)}
                className={`cartao-opcao text-left transition-all duration-200 ${
                  configuracao.padraoGuarda === opcao.valor ? 'cartao-opcao-selecionado' : ''
                }`}
              >
                <span className="block text-sm font-medium text-marrom-500">{opcao.label}</span>
                <span className="block text-xs text-marrom-300 mt-0.5 leading-tight">{opcao.descricao}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
