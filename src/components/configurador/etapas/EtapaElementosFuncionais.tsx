'use client'

import { useCadernoStore } from '@/store/useCadernoStore'
import { CORES_ELASTICO_PADRAO } from '@/types/caderno'
import type { TipoMarcador, PosicaoElastico, LarguraMarcador } from '@/types/caderno'

const opcoesLarguraMarcador: { valor: LarguraMarcador; label: string; descricao: string }[] = [
  { valor: 'fino',  label: 'Fino',  descricao: '~3 mm' },
  { valor: 'medio', label: 'Médio', descricao: '~5 mm' },
  { valor: 'largo', label: 'Largo', descricao: '~8 mm' },
]

const CORES_MARCADOR = [
  { nome: 'Terracota', hex: '#C4713C' },
  { nome: 'Vermelho', hex: '#C0392B' },
  { nome: 'Dourado', hex: '#D4AF37' },
  { nome: 'Verde', hex: '#27AE60' },
  { nome: 'Azul', hex: '#2980B9' },
  { nome: 'Rosa', hex: '#E91E8C' },
  { nome: 'Preto', hex: '#1A1A1A' },
  { nome: 'Branco', hex: '#F5F5F5' },
]

const opcoesTipoMarcador: { valor: TipoMarcador; label: string; descricao: string }[] = [
  { valor: 'fitilho', label: 'Fitilho', descricao: 'Fita de cetim ou seda' },
  { valor: 'couro', label: 'Couro', descricao: 'Tira de couro artesanal' },
  { valor: 'cordao', label: 'Cordão', descricao: 'Cordão decorativo' },
]

const opcoesPosicaoElastico: { valor: PosicaoElastico; label: string; icone: string }[] = [
  { valor: 'vertical', label: 'Vertical', icone: '|' },
  { valor: 'horizontal', label: 'Horizontal', icone: '—' },
]

export default function EtapaElementosFuncionais() {
  const { configuracao, atualizarOpcao } = useCadernoStore()

  return (
    <div className="flex flex-col gap-6">
      {/* Elástico de fechamento */}
      <div className="rounded-xl border border-creme-300 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-marrom-500">Elástico de fechamento</h3>
            <p className="text-xs text-marrom-300 mt-0.5">Mantém o caderno fechado</p>
          </div>
          <button
            onClick={() => atualizarOpcao('elasticoAtivo', !configuracao.elasticoAtivo)}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
              configuracao.elasticoAtivo ? 'bg-terracota-400' : 'bg-creme-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                configuracao.elasticoAtivo ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {configuracao.elasticoAtivo && (
          <div className="space-y-3 pt-2 border-t border-creme-200">
            {/* Posição do elástico */}
            <div>
              <p className="text-xs text-marrom-400 mb-2">Posição</p>
              <div className="flex gap-2">
                {opcoesPosicaoElastico.map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => atualizarOpcao('posicaoElastico', opcao.valor)}
                    className={`flex-1 cartao-opcao text-center py-2 transition-all duration-200 ${
                      configuracao.posicaoElastico === opcao.valor ? 'cartao-opcao-selecionado' : ''
                    }`}
                  >
                    <span className="block font-bold text-marrom-400 mb-1">{opcao.icone}</span>
                    <span className="block text-xs text-marrom-400">{opcao.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cor do elástico */}
            <div>
              <p className="text-xs text-marrom-400 mb-2">Cor do elástico</p>
              <div className="flex flex-wrap gap-2">
                {CORES_ELASTICO_PADRAO.map((cor) => (
                  <button
                    key={cor.hex}
                    title={cor.nome}
                    onClick={() => atualizarOpcao('corElastico', cor.hex)}
                    className={`seletor-cor ${configuracao.corElastico === cor.hex ? 'seletor-cor-selecionado' : ''}`}
                    style={{ backgroundColor: cor.hex }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Marcador de páginas */}
      <div className="rounded-xl border border-creme-300 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-marrom-500">Marcador de páginas</h3>
            <p className="text-xs text-marrom-300 mt-0.5">Fitilho, couro ou cordão</p>
          </div>
          <button
            onClick={() => atualizarOpcao('marcadorAtivo', !configuracao.marcadorAtivo)}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
              configuracao.marcadorAtivo ? 'bg-terracota-400' : 'bg-creme-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                configuracao.marcadorAtivo ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {configuracao.marcadorAtivo && (
          <div className="space-y-3 pt-2 border-t border-creme-200">
            {/* Tipo de marcador */}
            <div>
              <p className="text-xs text-marrom-400 mb-2">Tipo</p>
              <div className="flex gap-2">
                {opcoesTipoMarcador.map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => atualizarOpcao('tipoMarcador', opcao.valor)}
                    className={`flex-1 cartao-opcao text-center py-2 transition-all duration-200 ${
                      configuracao.tipoMarcador === opcao.valor ? 'cartao-opcao-selecionado' : ''
                    }`}
                  >
                    <span className="block text-xs font-medium text-marrom-500">{opcao.label}</span>
                    <span className="block text-xs text-marrom-300">{opcao.descricao}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Largura do marcador */}
            <div>
              <p className="text-xs text-marrom-400 mb-2">Largura</p>
              <div className="flex gap-2">
                {opcoesLarguraMarcador.map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => atualizarOpcao('larguraMarcador', opcao.valor)}
                    className={`flex-1 cartao-opcao text-center py-2 transition-all duration-200 ${
                      configuracao.larguraMarcador === opcao.valor ? 'cartao-opcao-selecionado' : ''
                    }`}
                  >
                    <span className="block text-xs font-medium text-marrom-500">{opcao.label}</span>
                    <span className="block text-xs text-marrom-300">{opcao.descricao}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cor do marcador */}
            <div>
              <p className="text-xs text-marrom-400 mb-2">Cor</p>
              <div className="flex flex-wrap gap-2">
                {CORES_MARCADOR.map((cor) => (
                  <button
                    key={cor.hex}
                    title={cor.nome}
                    onClick={() => atualizarOpcao('corMarcador', cor.hex)}
                    className={`seletor-cor ${configuracao.corMarcador === cor.hex ? 'seletor-cor-selecionado' : ''}`}
                    style={{
                      backgroundColor: cor.hex,
                      border: cor.hex === '#F5F5F5' ? '2px solid #E8D5B7' : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Extras */}
      <div>
        <h3 className="text-sm font-medium text-marrom-400 mb-3">Outros elementos</h3>
        <div className="flex flex-col gap-2">
          {[
            {
              campo: 'bolsoInterno' as const,
              label: 'Bolso interno',
              descricao: 'Guarde papeis, cartões e fotos',
              icone: '🗂️',
            },
            {
              campo: 'envelopeAcoplado' as const,
              label: 'Envelope acoplado',
              descricao: 'Envelope colado na contracapa',
              icone: '✉️',
            },
            {
              campo: 'portaCaneta' as const,
              label: 'Porta-caneta',
              descricao: 'Tira lateral para guardar a caneta',
              icone: '✒️',
            },
            {
              campo: 'abasOrelhas' as const,
              label: 'Abas / orelhas',
              descricao: 'Dobra protetora nas bordas',
              icone: '📎',
            },
          ].map((item) => (
            <label key={item.campo} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-creme-100 transition-colors">
              <input
                type="checkbox"
                checked={configuracao[item.campo]}
                onChange={(e) => atualizarOpcao(item.campo, e.target.checked)}
                className="w-4 h-4 accent-terracota-400 flex-shrink-0"
              />
              <span className="text-xl flex-shrink-0">{item.icone}</span>
              <span>
                <span className="block text-sm text-marrom-500">{item.label}</span>
                <span className="block text-xs text-marrom-300">{item.descricao}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
