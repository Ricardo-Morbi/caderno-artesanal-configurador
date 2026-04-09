'use client'

import { useEffect, useState } from 'react'
import type { TabelaPrecos } from '@/lib/calcularPreco'
import { TABELA_PADRAO, detalharPreco } from '@/lib/calcularPreco'
import type { ConfiguracaoCaderno } from '@/types/caderno'

// Config de simulação (caderno médio padrão)
const CONFIG_SIMULACAO: ConfiguracaoCaderno = {
  // Miolo
  temaCaderno: 'sem-tema-1', temaPersonalizado: '', padraoPaginas: 'liso',
  paginaDedicatoria: false, frasesAoLongo: false, frasePersonalizada: '',
  datasImportantes: false, datasPersonalizadas: '', essenciaNoParapel: false,
  formato: 'retrato',
  tipoPapel: 'offset', graturaPapel: '90g',
  tamanho: 'A5', subtamanhoPersonalizado: '', espessura: 'medio',
  folhasColoridas: false, corFolhasColoridas: '#F5F0E0',
  materialGuarda: 'branca', padraoGuardaEstampado: 'flores', corGuarda: '#F5F0E0', padraoGuarda: 'liso',
  tipoCorteEspecial: 'nenhum', tipoCantos: 'retos',
  pinturaBordasAtiva: false, corPinturaBordas: '#D4AF37',
  // Capa
  materialCapa: 'couro', corCapa: '#6B4226', corCapaTecido: '',
  querPersonalizacaoCapa: false, nomeGravado: '', gravacaoCapa: 'nenhuma',
  tipoBordado: 'cor-unica', corBordado: '#F5DFA0',
  tipoTipografia: 'serif', posicaoGravacao: 'centro', estampaCapa: 'nenhuma',
  aplicacoesCapa: [], tipoCantoneiras: 'nenhuma',
  tipoLombada: 'exposta',
  tipoEncadernacao: 'copta', corFio: '#E8D5B7', tipoAbertura: '180-graus',
  elasticoAtivo: false, corElastico: '#1A1A1A', posicaoElastico: 'vertical',
  marcadorAtivo: true, tipoMarcador: 'fita-cetim', larguraMarcador: '7mm', corMarcador: '#C4713C',
  quantidadeMarcadores: 1,
  bolsoInterno: false, envelopeAcoplado: false, envelopeContracapa: false, portaCaneta: false, abasOrelhas: false,
  tipoEmbalagem: 'padrao', padraoEmbalagem: 'algodao-cru',
  papelEspecialId: '',
  pespontosAtivo: false,
  // Legado
  impressoesInternas: false, divisoriasInternas: false,
  tipoLaminacao: 'nenhuma', tipoTextura: 'lisa', proposicaoCaderno: 'escrita-livre',
  corFolhas: 'branca',
}

type Aba = 'materiais' | 'maoObra' | 'fixos' | 'simulador'

function R(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',')}`
}

function Campo({ label, campo, valor, onChange, sufixo = 'R$', step = '0.01' }: {
  label: string
  campo: string
  valor: number
  onChange: (campo: string, v: number) => void
  sufixo?: string
  step?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-ivoire-200 last:border-0">
      <label className="text-xs text-onix-600 font-sans flex-1">{label}</label>
      <div className="flex items-center gap-1.5">
        {sufixo === 'R$' && <span className="text-xs text-onix-400 font-sans">R$</span>}
        <input
          type="number"
          min="0"
          step={step}
          value={valor}
          onChange={e => onChange(campo, parseFloat(e.target.value) || 0)}
          className="w-20 border border-ivoire-400 bg-white px-2 py-1 text-xs text-onix-700 text-right outline-none focus:border-onix-400 font-sans"
        />
        {sufixo !== 'R$' && <span className="text-xs text-onix-400 font-sans">{sufixo}</span>}
      </div>
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-2">{titulo}</p>
      <div className="bg-white border border-ivoire-300 px-4 py-1">
        {children}
      </div>
    </div>
  )
}

export default function PaginaMateriais() {
  const [tabela, setTabela] = useState<TabelaPrecos>(TABELA_PADRAO)
  const [abaAtiva, setAbaAtiva] = useState<Aba>('materiais')
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch('/api/configuracoes-preco')
      .then(r => r.json())
      .then(d => { setTabela(d); setCarregando(false) })
      .catch(() => setCarregando(false))
  }, [])

  function set(campo: string, valor: number) {
    setTabela(prev => ({ ...prev, [campo]: valor }))
  }

  async function salvar() {
    setSalvando(true)
    setMensagem(null)
    try {
      const res = await fetch('/api/configuracoes-preco', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tabela),
      })
      if (res.ok) {
        setMensagem({ tipo: 'ok', texto: 'Salvo com sucesso! O site publico ja usa os novos valores.' })
      } else {
        setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
      }
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro de conexao.' })
    } finally {
      setSalvando(false)
    }
  }

  function restaurarPadrao() {
    if (confirm('Restaurar todos os valores para o padrao?')) {
      setTabela(TABELA_PADRAO)
    }
  }

  const detalhe = detalharPreco(CONFIG_SIMULACAO, tabela)

  if (carregando) {
    return <div className="text-sm text-onix-400 py-20 text-center">Carregando configuracoes...</div>
  }

  const ABAS: { id: Aba; label: string }[] = [
    { id: 'materiais',  label: 'Materiais' },
    { id: 'maoObra',    label: 'Mao de Obra' },
    { id: 'fixos',      label: 'Custos Fixos' },
    { id: 'simulador',  label: 'Simulador' },
  ]

  return (
    <div>
      <div className="mb-5">
        <div className="w-6 h-px bg-ouro-400 mb-3" />
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-onix-700">Materiais e Precificacao</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={restaurarPadrao}
              className="text-xs text-onix-400 hover:text-onix-600 font-sans tracking-widest uppercase transition-colors"
            >
              Restaurar padrao
            </button>
            <button
              onClick={salvar}
              disabled={salvando}
              className="bg-onix-700 hover:bg-onix-800 disabled:opacity-50 text-ivoire-100 px-5 py-2 text-xs tracking-widest uppercase font-sans transition-colors"
            >
              {salvando ? 'Salvando...' : 'Salvar tudo'}
            </button>
          </div>
        </div>
        {mensagem && (
          <p className={`mt-3 text-xs font-sans px-3 py-2 border ${
            mensagem.tipo === 'ok'
              ? 'text-green-700 bg-green-50 border-green-200'
              : 'text-red-700 bg-red-50 border-red-200'
          }`}>
            {mensagem.texto}
          </p>
        )}
      </div>

      {/* Abas */}
      <div className="flex gap-1 mb-6 border-b border-ivoire-300">
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => setAbaAtiva(a.id)}
            className={`px-5 py-2.5 text-xs tracking-widest uppercase font-sans transition-colors -mb-px border-b-2 ${
              abaAtiva === a.id
                ? 'border-onix-700 text-onix-700'
                : 'border-transparent text-onix-400 hover:text-onix-600'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* ── ABA: MATERIAIS ── */}
      {abaAtiva === 'materiais' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Secao titulo="Base (fio, cola, guarda branca, offset 90g)">
              <Campo label="Material base do caderno" campo="materialBase" valor={tabela.materialBase} onChange={set} />
            </Secao>

            <Secao titulo="Adicional por tamanho (mais papel e capa)">
              <Campo label="A6 (padrao, sem adicional)" campo="tamanho_A6" valor={0} onChange={() => {}} />
              <Campo label="A5" campo="tamanho_A5" valor={tabela.tamanho_A5} onChange={set} />
              <Campo label="A4" campo="tamanho_A4" valor={tabela.tamanho_A4} onChange={set} />
              <Campo label="Personalizado" campo="tamanho_personalizado" valor={tabela.tamanho_personalizado} onChange={set} />
            </Secao>

            <Secao titulo="Adicional por espessura (mais folhas de miolo)">
              <Campo label="Fino ~80 fls (padrao)" campo="esp_fino" valor={0} onChange={() => {}} />
              <Campo label="Medio ~160 fls" campo="espessura_medio" valor={tabela.espessura_medio} onChange={set} />
              <Campo label="Grosso ~240 fls" campo="espessura_grosso" valor={tabela.espessura_grosso} onChange={set} />
              <Campo label="Extra-grosso ~320 fls" campo="espessura_extraGrosso" valor={tabela.espessura_extraGrosso} onChange={set} />
            </Secao>

            <Secao titulo="Material da capa (custo do material)">
              <Campo label="Kraft" campo="capa_kraft" valor={tabela.capa_kraft} onChange={set} />
              <Campo label="Papel especial" campo="capa_papelEspecial" valor={tabela.capa_papelEspecial} onChange={set} />
              <Campo label="Tecido" campo="capa_tecido" valor={tabela.capa_tecido} onChange={set} />
              <Campo label="Linho" campo="capa_linho" valor={tabela.capa_linho} onChange={set} />
              <Campo label="Sintetico" campo="capa_sintetico" valor={tabela.capa_sintetico} onChange={set} />
              <Campo label="Couro" campo="capa_couro" valor={tabela.capa_couro} onChange={set} />
            </Secao>

            <Secao titulo="Estampa / impressao na capa">
              <Campo label="Sem estampa (padrao)" campo="est_none" valor={0} onChange={() => {}} />
              <Campo label="Minimalista" campo="estampa_minimalista" valor={tabela.estampa_minimalista} onChange={set} />
              <Campo label="Floral" campo="estampa_floral" valor={tabela.estampa_floral} onChange={set} />
              <Campo label="Abstrata" campo="estampa_abstrata" valor={tabela.estampa_abstrata} onChange={set} />
              <Campo label="Tematica" campo="estampa_tematica" valor={tabela.estampa_tematica} onChange={set} />
            </Secao>

            <Secao titulo="Gravacao da capa (material + consumiveis)">
              <Campo label="Sem gravacao (padrao)" campo="grav_none" valor={0} onChange={() => {}} />
              <Campo label="Baixo relevo" campo="gravacao_baixoRelevo" valor={tabela.gravacao_baixoRelevo} onChange={set} />
              <Campo label="Alto relevo" campo="gravacao_altoRelevo" valor={tabela.gravacao_altoRelevo} onChange={set} />
              <Campo label="Bordado (fio + materiais)" campo="gravacao_bordado" valor={tabela.gravacao_bordado} onChange={set} />
            </Secao>
          </div>

          <div>
            <Secao titulo="Encadernacao (fio, agulha, cola, ferragem)">
              <Campo label="Copta (padrao)" campo="enc_copta" valor={0} onChange={() => {}} />
              <Campo label="Long stitch" campo="enc_longStitch" valor={tabela.enc_longStitch} onChange={set} />
              <Campo label="Francesa cruzada" campo="enc_francesaCruzada" valor={tabela.enc_francesaCruzada} onChange={set} />
              <Campo label="Wire-O" campo="enc_wireO" valor={tabela.enc_wireO} onChange={set} />
            </Secao>

            <Secao titulo="Tipo de papel do miolo">
              <Campo label="Offset (padrao)" campo="pap_off" valor={0} onChange={() => {}} />
              <Campo label="Reciclado" campo="papel_reciclado" valor={tabela.papel_reciclado} onChange={set} />
              <Campo label="Polen" campo="papel_polen" valor={tabela.papel_polen} onChange={set} />
              <Campo label="Vegetal" campo="papel_vegetal" valor={tabela.papel_vegetal} onChange={set} />
            </Secao>

            <Secao titulo="Adicional por gramatura">
              <Campo label="90g (padrao)" campo="gram_90" valor={0} onChange={() => {}} />
              <Campo label="120g" campo="gramatura_120g" valor={tabela.gramatura_120g} onChange={set} />
              <Campo label="180g" campo="gramatura_180g" valor={tabela.gramatura_180g} onChange={set} />
              <Campo label="240g" campo="gramatura_240g" valor={tabela.gramatura_240g} onChange={set} />
            </Secao>

            <Secao titulo="Elementos funcionais (custo de cada item)">
              <Campo label="Elastico" campo="elem_elastico" valor={tabela.elem_elastico} onChange={set} />
              <Campo label="Marcador / fitilho" campo="elem_marcador" valor={tabela.elem_marcador} onChange={set} />
              <Campo label="Bolso interno" campo="elem_bolso" valor={tabela.elem_bolso} onChange={set} />
              <Campo label="Porta-caneta" campo="elem_portaCaneta" valor={tabela.elem_portaCaneta} onChange={set} />
              <Campo label="Envelope acoplado" campo="elem_envelope" valor={tabela.elem_envelope} onChange={set} />
              <Campo label="Abas / orelhas" campo="elem_abas" valor={tabela.elem_abas} onChange={set} />
            </Secao>

            <Secao titulo="Acabamentos (material + consumiveis)">
              <Campo label="Pintura de bordas" campo="acab_pinturaBordas" valor={tabela.acab_pinturaBordas} onChange={set} />
              <Campo label="Deckle edge (corte especial)" campo="acab_deckleEdge" valor={tabela.acab_deckleEdge} onChange={set} />
              <Campo label="Laminacao (fosca ou brilho)" campo="acab_laminacao" valor={tabela.acab_laminacao} onChange={set} />
              <Campo label="Guarda especial (nao-branca)" campo="acab_guardaEspecial" valor={tabela.acab_guardaEspecial} onChange={set} />
            </Secao>
          </div>
        </div>
      )}

      {/* ── ABA: MAO DE OBRA ── */}
      {abaAtiva === 'maoObra' && (
        <div className="max-w-lg">
          <Secao titulo="Valor da hora de trabalho">
            <Campo label="Valor hora da artesa" campo="valorHoraArtesa" valor={tabela.valorHoraArtesa} onChange={set} />
          </Secao>

          <Secao titulo="Tempo base por espessura (horas para fazer o caderno)">
            <Campo label="Fino (~80 folhas)" campo="tempo_fino" valor={tabela.tempo_fino} onChange={set} sufixo="h" step="0.25" />
            <Campo label="Medio (~160 folhas)" campo="tempo_medio" valor={tabela.tempo_medio} onChange={set} sufixo="h" step="0.25" />
            <Campo label="Grosso (~240 folhas)" campo="tempo_grosso" valor={tabela.tempo_grosso} onChange={set} sufixo="h" step="0.25" />
            <Campo label="Extra-grosso (~320 folhas)" campo="tempo_extraGrosso" valor={tabela.tempo_extraGrosso} onChange={set} sufixo="h" step="0.25" />
          </Secao>

          <Secao titulo="Tempo extra por tipo de trabalho (horas adicionais)">
            <Campo label="Gravacao (baixo ou alto relevo)" campo="tempoExtra_gravacao" valor={tabela.tempoExtra_gravacao} onChange={set} sufixo="h" step="0.25" />
            <Campo label="Bordado" campo="tempoExtra_bordado" valor={tabela.tempoExtra_bordado} onChange={set} sufixo="h" step="0.25" />
            <Campo label="Bolso interno ou envelope" campo="tempoExtra_bolso" valor={tabela.tempoExtra_bolso} onChange={set} sufixo="h" step="0.25" />
            <Campo label="Pintura bordas ou deckle" campo="tempoExtra_acabamento" valor={tabela.tempoExtra_acabamento} onChange={set} sufixo="h" step="0.25" />
          </Secao>

          <div className="bg-ivoire-100 border border-ivoire-300 p-4 mt-4">
            <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-3">Como funciona o calculo de mao de obra</p>
            <p className="text-xs text-onix-600 font-sans leading-relaxed">
              <strong>Horas totais</strong> = tempo base do tamanho + adicionais por trabalho<br />
              <strong>Custo mao de obra</strong> = horas totais × valor hora<br /><br />
              Exemplo: caderno medio ({tabela.tempo_medio}h) com bordado (+{tabela.tempoExtra_bordado}h) = {tabela.tempo_medio + tabela.tempoExtra_bordado}h × {R(tabela.valorHoraArtesa)} = {R((tabela.tempo_medio + tabela.tempoExtra_bordado) * tabela.valorHoraArtesa)}
            </p>
          </div>
        </div>
      )}

      {/* ── ABA: CUSTOS FIXOS ── */}
      {abaAtiva === 'fixos' && (
        <div className="max-w-lg">
          <Secao titulo="Custos fixos mensais">
            <Campo label="Total de custos fixos por mes" campo="custoFixoMensal" valor={tabela.custoFixoMensal} onChange={set} />
            <p className="text-[10px] text-onix-400 font-sans py-2">
              Inclua: aluguel, energia, internet, materiais consumidos, etc.
            </p>
          </Secao>

          <Secao titulo="Producao media">
            <Campo label="Cadernos produzidos por mes" campo="producaoMediaMensal" valor={tabela.producaoMediaMensal} onChange={set} sufixo="un" step="1" />
            <p className="text-[10px] text-onix-400 font-sans py-2">
              Custo fixo por caderno: {R(tabela.custoFixoMensal / Math.max(tabela.producaoMediaMensal, 1))}
            </p>
          </Secao>

          <Secao titulo="Margens">
            <Campo label="Margem de lucro" campo="margemLucro" valor={tabela.margemLucro} onChange={set} sufixo="%" step="1" />
            <Campo label="Margem de investimento" campo="margemInvestimento" valor={tabela.margemInvestimento ?? 10} onChange={set} sufixo="%" step="1" />
            <p className="text-[10px] text-onix-400 font-sans py-2">
              Margem de lucro = retorno sobre o trabalho. Margem de investimento = reserva para materiais, equipamentos e crescimento.
            </p>
          </Secao>

          <div className="bg-ivoire-100 border border-ivoire-300 p-4 mt-4">
            <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-3">Formula completa</p>
            <div className="space-y-1 text-xs text-onix-600 font-sans">
              <p>Custo material + Mao de obra + Custo fixo unitario = Custo total</p>
              <p>Preco final = Custo total × (1 + {tabela.margemLucro}%) × (1 + {tabela.margemInvestimento ?? 10}%)</p>
              <p className="text-onix-400">= Custo total × {((1 + tabela.margemLucro / 100) * (1 + (tabela.margemInvestimento ?? 10) / 100)).toFixed(3)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: SIMULADOR ── */}
      {abaAtiva === 'simulador' && (
        <div className="max-w-md">
          <div className="bg-white border border-ivoire-400 divide-y divide-ivoire-200 mb-6">
            <div className="px-5 py-3 bg-onix-800">
              <p className="text-xs tracking-widest uppercase font-sans text-ivoire-300">Simulacao — caderno padrao</p>
              <p className="text-[10px] text-ivoire-400 font-sans mt-0.5">A5 medio couro marcador copta offset 90g</p>
            </div>

            <div className="px-5 py-3">
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-onix-500 font-sans">Custo de material</span>
                <span className="text-xs font-sans text-onix-700">{R(detalhe.custo_material)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-onix-500 font-sans">
                  Mao de obra ({detalhe.horas_trabalho.toFixed(2)}h × {R(tabela.valorHoraArtesa)}/h)
                </span>
                <span className="text-xs font-sans text-onix-700">{R(detalhe.custo_mao_obra)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-xs text-onix-500 font-sans">
                  Custo fixo ({R(tabela.custoFixoMensal)}/{tabela.producaoMediaMensal} un)
                </span>
                <span className="text-xs font-sans text-onix-700">{R(detalhe.custo_fixo)}</span>
              </div>
            </div>

            <div className="px-5 py-3 bg-ivoire-50">
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-onix-500 font-sans">Custo total</span>
                <span className="text-xs font-sans text-onix-600">{R(detalhe.custo_total)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-onix-500 font-sans">Margem ({tabela.margemLucro}%)</span>
                <span className="text-xs font-sans text-onix-600">{R(detalhe.margem_valor)}</span>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-onix-600 font-sans tracking-wide">Preco final ao cliente</span>
                <span className="text-2xl font-serif text-onix-700">{R(detalhe.preco_final)}</span>
              </div>
            </div>
          </div>

          <div className="bg-ouro-50 border border-ouro-200 px-4 py-3">
            <p className="text-xs text-onix-600 font-sans leading-relaxed">
              <strong>Lembre-se:</strong> altere os valores nas outras abas e clique em{' '}
              <strong>Salvar tudo</strong> para que o site publico use os novos precos imediatamente.
            </p>
          </div>
        </div>
      )}

      {/* Botao salvar fixo no bottom */}
      <div className="mt-8 pt-4 border-t border-ivoire-300 flex items-center justify-between">
        <p className="text-xs text-onix-400 font-sans">
          Os valores salvos sao usados em tempo real no site publico.
        </p>
        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-onix-700 hover:bg-onix-800 disabled:opacity-50 text-ivoire-100 px-6 py-2.5 text-xs tracking-widest uppercase font-sans transition-colors"
        >
          {salvando ? 'Salvando...' : 'Salvar tudo'}
        </button>
      </div>
    </div>
  )
}
