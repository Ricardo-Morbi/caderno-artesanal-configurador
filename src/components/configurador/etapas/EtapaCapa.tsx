'use client'

import { useCadernoStore } from '@/store/useCadernoStore'
import { CORES_CAPA_PADRAO } from '@/types/caderno'
import type { MaterialCapa, EstampaCapa, GravacaoCapa, AplicacaoCapa, TipoTipografia } from '@/types/caderno'

const CORES_BORDADO = [
  { nome: 'Dourado', hex: '#F5DFA0' },
  { nome: 'Prata', hex: '#D4D4D4' },
  { nome: 'Branco', hex: '#F8F8F8' },
  { nome: 'Vermelho', hex: '#C0392B' },
  { nome: 'Terracota', hex: '#C4713C' },
  { nome: 'Azul', hex: '#2980B9' },
  { nome: 'Verde', hex: '#27AE60' },
  { nome: 'Rosa', hex: '#E91E8C' },
  { nome: 'Preto', hex: '#1A1A1A' },
]

const opcoesTipografia: { valor: TipoTipografia; label: string; descricao: string; exemplo: string }[] = [
  { valor: 'serif',      label: 'Serifada',    descricao: 'Clássica · Elegante',    exemplo: 'Abc' },
  { valor: 'sans-serif', label: 'Sem serifa',  descricao: 'Moderna · Limpa',        exemplo: 'Abc' },
  { valor: 'script',     label: 'Script',      descricao: 'Cursiva · Artística',    exemplo: 'Abc' },
  { valor: 'monoespaco', label: 'Monoespacada', descricao: 'Técnica · Uniforme',   exemplo: 'Abc' },
]

const opcoesMaterial: { valor: MaterialCapa; label: string; descricao: string }[] = [
  { valor: 'couro', label: 'Couro', descricao: 'Natural, durável' },
  { valor: 'sintetico', label: 'Sintético', descricao: 'Vegano, resistente' },
  { valor: 'tecido', label: 'Tecido', descricao: 'Suave, colorido' },
  { valor: 'papel-especial', label: 'Papel Especial', descricao: 'Elegante, leve' },
  { valor: 'kraft', label: 'Kraft', descricao: 'Rústico, natural' },
  { valor: 'linho', label: 'Linho', descricao: 'Texturizado, chic' },
]

const opcoesEstampa: { valor: EstampaCapa; label: string }[] = [
  { valor: 'nenhuma', label: 'Sem estampa' },
  { valor: 'floral', label: 'Floral' },
  { valor: 'minimalista', label: 'Minimalista' },
  { valor: 'abstrata', label: 'Abstrata' },
  { valor: 'tematica', label: 'Temática' },
]

const opcoesGravacao: { valor: GravacaoCapa; label: string; descricao: string }[] = [
  { valor: 'nenhuma', label: 'Sem gravação', descricao: 'Capa lisa' },
  { valor: 'baixo-relevo', label: 'Baixo relevo', descricao: 'Sutil, elegante' },
  { valor: 'alto-relevo', label: 'Alto relevo', descricao: 'Marcante' },
  { valor: 'bordado', label: 'Bordado', descricao: 'Artesanal' },
]

const opcoesAplicacao: { valor: AplicacaoCapa; label: string; icone: string }[] = [
  { valor: 'renda', label: 'Renda', icone: '🕸️' },
  { valor: 'botoes', label: 'Botões', icone: '🔘' },
  { valor: 'metais', label: 'Metais', icone: '⚡' },
  { valor: 'recortes', label: 'Recortes', icone: '✂️' },
]

export default function EtapaCapa() {
  const { configuracao, atualizarOpcao, toggleAplicacaoCapa } = useCadernoStore()

  return (
    <div className="flex flex-col gap-6">
      {/* Material */}
      <div>
        <h3 className="text-sm font-medium text-marrom-400 mb-3">Material da capa</h3>
        <div className="grid grid-cols-2 gap-2">
          {opcoesMaterial.map((opcao) => (
            <button
              key={opcao.valor}
              onClick={() => atualizarOpcao('materialCapa', opcao.valor)}
              className={`cartao-opcao text-left transition-all duration-200 ${
                configuracao.materialCapa === opcao.valor ? 'cartao-opcao-selecionado' : ''
              }`}
            >
              <span className="block text-sm font-medium text-marrom-500">{opcao.label}</span>
              <span className="block text-xs text-marrom-300 mt-0.5">{opcao.descricao}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cor */}
      <div>
        <h3 className="text-sm font-medium text-marrom-400 mb-3">Cor da capa</h3>
        <div className="flex flex-wrap gap-2">
          {CORES_CAPA_PADRAO.map((cor) => (
            <button
              key={cor.hex}
              title={cor.nome}
              onClick={() => atualizarOpcao('corCapa', cor.hex)}
              className={`seletor-cor ${configuracao.corCapa === cor.hex ? 'seletor-cor-selecionado' : ''}`}
              style={{ backgroundColor: cor.hex }}
            />
          ))}
        </div>
        {/* Seletor de cor personalizada */}
        <div className="flex items-center gap-2 mt-3">
          <label className="text-xs text-marrom-300">Cor personalizada:</label>
          <input
            type="color"
            value={configuracao.corCapa}
            onChange={(e) => atualizarOpcao('corCapa', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-creme-300"
          />
          <span className="text-xs font-mono text-marrom-300">{configuracao.corCapa}</span>
        </div>
      </div>

      {/* Estampa */}
      <div>
        <h3 className="text-sm font-medium text-marrom-400 mb-3">Estampa</h3>
        <div className="flex flex-wrap gap-2">
          {opcoesEstampa.map((opcao) => (
            <button
              key={opcao.valor}
              onClick={() => atualizarOpcao('estampaCapa', opcao.valor)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                configuracao.estampaCapa === opcao.valor
                  ? 'border-terracota-400 bg-terracota-100 text-terracota-600'
                  : 'border-creme-300 text-marrom-400 hover:border-creme-400'
              }`}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gravação */}
      <div>
        <h3 className="text-sm font-medium text-marrom-400 mb-3">Gravação / Personalização</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {opcoesGravacao.map((opcao) => (
            <button
              key={opcao.valor}
              onClick={() => atualizarOpcao('gravacaoCapa', opcao.valor)}
              className={`cartao-opcao text-left transition-all duration-200 ${
                configuracao.gravacaoCapa === opcao.valor ? 'cartao-opcao-selecionado' : ''
              }`}
            >
              <span className="block text-sm font-medium text-marrom-500">{opcao.label}</span>
              <span className="block text-xs text-marrom-300 mt-0.5">{opcao.descricao}</span>
            </button>
          ))}
        </div>

        {/* Campo de texto + tipografia + cor do bordado */}
        {configuracao.gravacaoCapa !== 'nenhuma' && (
          <div className="mt-2 flex flex-col gap-4">
            {/* 1. Texto a gravar */}
            <div>
              <label htmlFor="nome-gravado" className="block text-xs text-marrom-400 mb-1">
                O que você quer gravar?
              </label>
              <input
                id="nome-gravado"
                type="text"
                value={configuracao.nomeGravado}
                onChange={(e) => atualizarOpcao('nomeGravado', e.target.value)}
                placeholder="Ex: Ana Carolina · AC · carpe diem"
                maxLength={40}
                className="w-full border border-creme-300 rounded-lg px-3 py-2 text-sm text-marrom-500
                           placeholder:text-marrom-200 focus:outline-none focus:border-terracota-300
                           bg-white transition-colors duration-200"
              />
              <p className="text-xs text-marrom-200 mt-1 text-right">
                {configuracao.nomeGravado.length}/40
              </p>
            </div>

            {/* 2. Tipografia */}
            <div>
              <p className="text-xs text-marrom-400 mb-2">Estilo de tipografia</p>
              <div className="grid grid-cols-2 gap-2">
                {opcoesTipografia.map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => atualizarOpcao('tipoTipografia', opcao.valor)}
                    className={`cartao-opcao text-left transition-all duration-200 ${
                      configuracao.tipoTipografia === opcao.valor ? 'cartao-opcao-selecionado' : ''
                    }`}
                  >
                    <span
                      className="block text-base font-medium text-marrom-500 mb-0.5"
                      style={{
                        fontFamily: opcao.valor === 'serif' ? 'Georgia, serif'
                          : opcao.valor === 'sans-serif' ? 'system-ui, sans-serif'
                          : opcao.valor === 'script' ? 'cursive'
                          : 'monospace',
                      }}
                    >
                      {opcao.exemplo}
                    </span>
                    <span className="block text-xs font-medium text-marrom-500">{opcao.label}</span>
                    <span className="block text-xs text-marrom-300">{opcao.descricao}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Cor do bordado — só quando bordado selecionado */}
            {configuracao.gravacaoCapa === 'bordado' && (
              <div>
                <p className="text-xs text-marrom-400 mb-2">Cor do fio de bordado</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {CORES_BORDADO.map((cor) => (
                    <button
                      key={cor.hex}
                      title={cor.nome}
                      onClick={() => atualizarOpcao('corBordado', cor.hex)}
                      className={`seletor-cor ${configuracao.corBordado === cor.hex ? 'seletor-cor-selecionado' : ''}`}
                      style={{
                        backgroundColor: cor.hex,
                        border: cor.hex === '#F8F8F8' ? '2px solid #E8D5B7' : undefined,
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="cor-bordado-custom" className="text-xs text-marrom-300">Personalizada:</label>
                  <input
                    id="cor-bordado-custom"
                    type="color"
                    value={configuracao.corBordado}
                    onChange={(e) => atualizarOpcao('corBordado', e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border border-creme-300"
                  />
                  <span className="text-xs font-mono text-marrom-300">{configuracao.corBordado}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Aplicações extras */}
      <div>
        <h3 className="text-sm font-medium text-marrom-400 mb-3">Aplicações extras (opcional)</h3>
        <div className="flex gap-2 flex-wrap">
          {opcoesAplicacao.map((opcao) => {
            const estaSelecionado = configuracao.aplicacoesCapa.includes(opcao.valor)
            return (
              <button
                key={opcao.valor}
                onClick={() => toggleAplicacaoCapa(opcao.valor)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  estaSelecionado
                    ? 'border-terracota-400 bg-terracota-100 text-terracota-600'
                    : 'border-creme-300 text-marrom-400 hover:border-creme-400'
                }`}
              >
                <span>{opcao.icone}</span>
                <span>{opcao.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
