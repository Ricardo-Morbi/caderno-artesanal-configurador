'use client'

import { useCadernoStore } from '@/store/useCadernoStore'
import type { TipoCantos, TipoCorteEspecial, TipoLaminacao, TipoTextura } from '@/types/caderno'

const CORES_BORDA = [
  { nome: 'Dourado', hex: '#D4AF37' },
  { nome: 'Prata', hex: '#B8B8B8' },
  { nome: 'Terracota', hex: '#C4713C' },
  { nome: 'Vermelho', hex: '#C0392B' },
  { nome: 'Azul', hex: '#2980B9' },
  { nome: 'Verde', hex: '#27AE60' },
  { nome: 'Preto', hex: '#1A1A1A' },
  { nome: 'Rosa', hex: '#E91E8C' },
]

const opcoesLaminacao: { valor: TipoLaminacao; label: string; descricao: string }[] = [
  { valor: 'nenhuma', label: 'Sem laminação', descricao: 'Toque natural' },
  { valor: 'fosca', label: 'Laminação fosca', descricao: 'Aveludado, premium' },
  { valor: 'brilho', label: 'Laminação brilho', descricao: 'Vibrante, moderno' },
]

const opcoesTextura: { valor: TipoTextura; label: string; descricao: string }[] = [
  { valor: 'lisa',      label: 'Lisa',      descricao: 'Superfície suave uniforme' },
  { valor: 'granulada', label: 'Granulada', descricao: 'Textura sutil ao toque' },
]

export default function EtapaAcabamentos() {
  const { configuracao, atualizarOpcao } = useCadernoStore()

  return (
    <div className="flex flex-col gap-6">
      {/* Cantos */}
      <div>
        <h3 className="text-sm font-medium text-marrom-400 mb-3">Cantos</h3>
        <div className="flex gap-2">
          {([
            { valor: 'arredondados', label: 'Arredondados', icone: '⬭' },
            { valor: 'retos', label: 'Retos', icone: '⬜' },
          ] as { valor: TipoCantos; label: string; icone: string }[]).map((opcao) => (
            <button
              key={opcao.valor}
              onClick={() => atualizarOpcao('tipoCantos', opcao.valor)}
              className={`flex-1 cartao-opcao text-center transition-all duration-200 ${
                configuracao.tipoCantos === opcao.valor ? 'cartao-opcao-selecionado' : ''
              }`}
            >
              <span className="block text-2xl mb-1">{opcao.icone}</span>
              <span className="block text-sm font-medium text-marrom-400">{opcao.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pintura nas bordas das páginas */}
      <div className="rounded-xl border border-creme-300 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-marrom-500">Pintura nas bordas</h3>
            <p className="text-xs text-marrom-300 mt-0.5">Cor nos cortes laterais das páginas</p>
          </div>
          <button
            onClick={() => atualizarOpcao('pinturaBordasAtiva', !configuracao.pinturaBordasAtiva)}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
              configuracao.pinturaBordasAtiva ? 'bg-terracota-400' : 'bg-creme-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                configuracao.pinturaBordasAtiva ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {configuracao.pinturaBordasAtiva && (
          <div className="pt-2 border-t border-creme-200">
            <p className="text-xs text-marrom-400 mb-2">Cor da pintura</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {CORES_BORDA.map((cor) => (
                <button
                  key={cor.hex}
                  title={cor.nome}
                  onClick={() => atualizarOpcao('corPinturaBordas', cor.hex)}
                  className={`seletor-cor ${configuracao.corPinturaBordas === cor.hex ? 'seletor-cor-selecionado' : ''}`}
                  style={{ backgroundColor: cor.hex }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-marrom-300">Personalizada:</label>
              <input
                type="color"
                value={configuracao.corPinturaBordas}
                onChange={(e) => atualizarOpcao('corPinturaBordas', e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-creme-300"
              />
            </div>
          </div>
        )}
      </div>

      {/* Corte especial */}
      <div>
        <h3 className="text-sm font-medium text-marrom-400 mb-3">Corte especial</h3>
        <div className="flex flex-col gap-2">
          {([
            { valor: 'nenhum', label: 'Corte reto', descricao: 'Bordas uniformes e precisas' },
            { valor: 'deckle-edge', label: 'Deckle Edge', descricao: 'Bordas irregulares artesanais — rústico e especial' },
          ] as { valor: TipoCorteEspecial; label: string; descricao: string }[]).map((opcao) => (
            <button
              key={opcao.valor}
              onClick={() => atualizarOpcao('tipoCorteEspecial', opcao.valor)}
              className={`cartao-opcao text-left transition-all duration-200 ${
                configuracao.tipoCorteEspecial === opcao.valor ? 'cartao-opcao-selecionado' : ''
              }`}
            >
              <span className="block text-sm font-medium text-marrom-500">{opcao.label}</span>
              <span className="block text-xs text-marrom-300 mt-0.5">{opcao.descricao}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Laminação — só para capa em papel especial */}
      {configuracao.materialCapa === 'papel-especial' && (
        <div>
          <h3 className="text-sm font-medium text-marrom-400 mb-1">Laminação da capa</h3>
          <p className="text-xs text-marrom-200 mb-3">Disponível para capa em papel especial</p>
          <div className="flex flex-col gap-2">
            {opcoesLaminacao.map((opcao) => (
              <button
                key={opcao.valor}
                onClick={() => atualizarOpcao('tipoLaminacao', opcao.valor)}
                className={`cartao-opcao text-left transition-all duration-200 ${
                  configuracao.tipoLaminacao === opcao.valor ? 'cartao-opcao-selecionado' : ''
                }`}
              >
                <span className="block text-sm font-medium text-marrom-500">{opcao.label}</span>
                <span className="block text-xs text-marrom-300 mt-0.5">{opcao.descricao}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Textura ao toque */}
      <div>
        <h3 className="text-sm font-medium text-marrom-400 mb-3">Textura ao toque</h3>
        <div className="flex gap-2">
          {opcoesTextura.map((opcao) => (
            <button
              key={opcao.valor}
              onClick={() => atualizarOpcao('tipoTextura', opcao.valor)}
              className={`flex-1 cartao-opcao text-center transition-all duration-200 ${
                configuracao.tipoTextura === opcao.valor ? 'cartao-opcao-selecionado' : ''
              }`}
            >
              <span className="block text-xs font-medium text-marrom-500">{opcao.label}</span>
              <span className="block text-xs text-marrom-300 mt-0.5 leading-tight">{opcao.descricao}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
