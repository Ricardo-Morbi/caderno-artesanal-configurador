'use client'

import { useEffect, useState } from 'react'
import type { TabelaPrecos } from '@/lib/calcularPreco'
import { TABELA_PADRAO, MAT_DEFAULTS, detalharPreco } from '@/lib/calcularPreco'
import type { ConfiguracaoCaderno } from '@/types/caderno'

// Calculadora: meta de faturamento → valor hora
function CalculadoraValorHora({
  valorAtual,
  onAplicar,
}: {
  valorAtual: number
  onAplicar: (v: number) => void
}) {
  const [meta, setMeta] = useState(3000)
  const [horasSemanais, setHorasSemanais] = useState(28)
  const [semanasMes, setSemanasMes] = useState(4)
  const horasMensais = Math.round(horasSemanais * semanasMes * 10) / 10
  const valorCalculado = horasMensais > 0 ? Math.round((meta / horasMensais) * 100) / 100 : 0

  return (
    <div className="bg-ouro-50 border border-ouro-200 p-4 mb-6">
      <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-3">
        Calcular valor hora pela meta mensal
      </p>
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-onix-600 font-sans">Meta de faturamento mensal</label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-onix-400 font-sans">R$</span>
            <input
              type="number" min="0" step="100" value={meta}
              onChange={e => setMeta(parseFloat(e.target.value) || 0)}
              className="w-24 border border-ivoire-400 bg-white px-2 py-1 text-xs text-onix-700 text-right outline-none focus:border-onix-400 font-sans"
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-onix-600 font-sans">Horas trabalhadas por semana</label>
          <div className="flex items-center gap-1">
            <input
              type="number" min="1" step="1" value={horasSemanais}
              onChange={e => setHorasSemanais(parseFloat(e.target.value) || 1)}
              className="w-24 border border-ivoire-400 bg-white px-2 py-1 text-xs text-onix-700 text-right outline-none focus:border-onix-400 font-sans"
            />
            <span className="text-xs text-onix-400 font-sans">h/sem</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-onix-600 font-sans">Semanas trabalhadas por mes</label>
          <div className="flex items-center gap-1">
            <input
              type="number" min="1" max="5" step="1" value={semanasMes}
              onChange={e => setSemanasMes(parseFloat(e.target.value) || 1)}
              className="w-24 border border-ivoire-400 bg-white px-2 py-1 text-xs text-onix-700 text-right outline-none focus:border-onix-400 font-sans"
            />
            <span className="text-xs text-onix-400 font-sans">sem</span>
          </div>
        </div>
        <p className="text-[10px] text-onix-400 font-sans text-right">
          = {horasMensais}h/mes ({horasSemanais}h × {semanasMes} semanas)
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-onix-500 font-sans">Valor hora sugerido: </span>
          <span className="text-sm font-sans font-medium text-onix-700">
            R$ {valorCalculado.toFixed(2).replace('.', ',')}
          </span>
          {valorAtual !== valorCalculado && (
            <span className="text-[10px] text-onix-400 font-sans ml-2">
              (atual: R$ {valorAtual.toFixed(2).replace('.', ',')})
            </span>
          )}
        </div>
        <button
          onClick={() => onAplicar(valorCalculado)}
          className="bg-onix-700 hover:bg-onix-800 text-ivoire-100 px-4 py-1.5 text-xs tracking-widest uppercase font-sans transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}

// Config de simulação (caderno médio padrão)
const CONFIG_SIMULACAO: ConfiguracaoCaderno = {
  temaCaderno: 'sem-tema-1', temaPersonalizado: '', padraoPaginas: 'liso',
  paginaDedicatoria: false,
  datasImportantes: false, datasPersonalizadas: '', essenciaNoParapel: false,
  formato: 'retrato',
  tipoPapel: 'offset', graturaPapel: '90g',
  tamanho: 'A5', subtamanhoPersonalizado: '', espessura: 'medio',
  folhasColoridas: false, corFolhasColoridas: '#F5F0E0',
  materialGuarda: 'branca', padraoGuardaEstampado: 'flores', corGuarda: '#F5F0E0', padraoGuarda: 'liso',
  tipoCorteEspecial: 'nenhum', tipoCantos: 'retos',
  pinturaBordasAtiva: false, corPinturaBordas: '#D4AF37',
  materialCapa: 'couro', corCapa: '#6B4226',
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
  linhoId: '',
  pespontosAtivo: false,
  impressoesInternas: false, divisoriasInternas: false,
  tipoLaminacao: 'nenhuma', tipoTextura: 'lisa', proposicaoCaderno: 'escrita-livre',
  corFolhas: 'branca',
}

type Aba = 'maoObra' | 'fixos' | 'materiais' | 'simulador'

function R(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',')}`
}

function Campo({ label, campo, valor, onChange, sufixo = 'R$', step = '0.01', descricao }: {
  label: string; campo: string; valor: number
  onChange: (campo: string, v: number) => void
  sufixo?: string; step?: string; descricao?: string
}) {
  return (
    <div className="py-2 border-b border-ivoire-200 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <label className="text-xs text-onix-600 font-sans">{label}</label>
          {descricao && <p className="text-[10px] text-onix-400 font-sans mt-0.5">{descricao}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {sufixo === 'R$' && <span className="text-xs text-onix-400 font-sans">R$</span>}
          <input
            type="number" min="0" step={step} value={valor}
            onChange={e => onChange(campo, parseFloat(e.target.value) || 0)}
            className="w-20 border border-ivoire-400 bg-white px-2 py-1 text-xs text-onix-700 text-right outline-none focus:border-onix-400 font-sans"
          />
          {sufixo !== 'R$' && <span className="text-xs text-onix-400 font-sans">{sufixo}</span>}
        </div>
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

// Tabela de preview de custo por tamanho (read-only)
function TabelaTamanhos({ titulo, valores }: {
  titulo: string
  valores: { A6: number; A5: number; A4: number }
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-ivoire-100 last:border-0">
      <span className="text-[10px] text-onix-500 font-sans">{titulo}</span>
      <div className="flex gap-4">
        {([['A6', valores.A6], ['A5', valores.A5], ['A4', valores.A4]] as [string, number][]).map(([tam, val]) => (
          <div key={tam} className="text-right">
            <div className="text-[9px] text-onix-400 font-sans">{tam}</div>
            <div className="text-xs text-onix-600 font-sans font-medium">{R(val)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Calcula os custos derivados para preview no admin
function calcPreviewMat(tabela: TabelaPrecos) {
  const painelCouro = tabela.mat_couro_painel ?? MAT_DEFAULTS.couro_painel
  const metroSint   = tabela.mat_sintetico_metro ?? MAT_DEFAULTS.sintetico_metro
  const meioLinho   = tabela.mat_linho_meio_metro ?? MAT_DEFAULTS.linho_meio_metro
  const m2Sint = metroSint / 1.40
  const m2Linho = (meioLinho * 2) / 1.33
  const w = 1.40
  const r = (v: number) => Math.round(v * 100) / 100
  return {
    couro:    { A6: r(painelCouro), A5: r(painelCouro * 2), A4: r(painelCouro * 2) },
    sintetico:{ A6: r(0.055 * m2Sint * w), A5: r(0.094 * m2Sint * w), A4: r(0.169 * m2Sint * w) },
    linho:    { A6: r(0.055 * m2Linho * w), A5: r(0.094 * m2Linho * w), A4: r(0.169 * m2Linho * w) },
  }
}

export default function PaginaMateriais() {
  const [tabela, setTabela] = useState<TabelaPrecos>(TABELA_PADRAO)
  const [abaAtiva, setAbaAtiva] = useState<Aba>('maoObra')
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch('/api/configuracoes-preco')
      .then(r => r.json())
      .then(d => {
        // Garante que campos novos de material tenham os defaults se não existirem no banco
        setTabela({ ...TABELA_PADRAO, ...d })
        setCarregando(false)
      })
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
  const preview = calcPreviewMat(tabela)

  if (carregando) {
    return <div className="text-sm text-onix-400 py-20 text-center">Carregando configuracoes...</div>
  }

  const ABAS: { id: Aba; label: string }[] = [
    { id: 'maoObra',   label: 'Mao de Obra' },
    { id: 'fixos',     label: 'Custos Fixos' },
    { id: 'materiais', label: 'Materiais' },
    { id: 'simulador', label: 'Simulador' },
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

      {/* ── ABA: MAO DE OBRA ── */}
      {abaAtiva === 'maoObra' && (
        <div className="max-w-lg">
          <CalculadoraValorHora
            valorAtual={tabela.valorHoraArtesa}
            onAplicar={(v) => set('valorHoraArtesa', v)}
          />

          <Secao titulo="Valor hora (resultado ou ajuste manual)">
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
            <Campo label="Pintura bordas ou pespontos" campo="tempoExtra_acabamento" valor={tabela.tempoExtra_acabamento} onChange={set} sufixo="h" step="0.25" />
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
          <Secao titulo="Custo fixo por caderno">
            <Campo label="Custo fixo por caderno" campo="custoFixoUnitario" valor={tabela.custoFixoUnitario ?? 25} onChange={set} />
            <p className="text-[10px] text-onix-400 font-sans py-2">
              Valor a somar em cada caderno para cobrir aluguel, energia, internet, embalagens e demais custos fixos.
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
              <p>Preco final = Custo total × (1+{tabela.margemLucro}%) × (1+{tabela.margemInvestimento ?? 10}%)</p>
              <p className="text-onix-400">= Custo total × {((1 + tabela.margemLucro / 100) * (1 + (tabela.margemInvestimento ?? 10) / 100)).toFixed(3)}×</p>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: MATERIAIS ── */}
      {abaAtiva === 'materiais' && (
        <div className="max-w-2xl">
          <div className="bg-ouro-50 border border-ouro-200 px-4 py-3 mb-6">
            <p className="text-xs text-onix-600 font-sans leading-relaxed">
              Insira o <strong>preco de compra do fornecedor</strong>. O sistema calcula automaticamente o custo por tamanho de caderno (A6, A5, A4) com base na area de cada capa e fator de perda de corte.
            </p>
          </div>

          {/* Revestimentos da Capa */}
          <Secao titulo="Revestimentos da Capa">
            <Campo
              label="Couro — preco do painel 25×36cm (Galeria Mats)"
              campo="mat_couro_painel"
              valor={tabela.mat_couro_painel ?? MAT_DEFAULTS.couro_painel}
              onChange={set}
              descricao="Painel Classe B (Blaze, Stoned, Wax Relax). 1 painel p/ A6, 2 paineis p/ A5 e A4."
            />
            <div className="bg-ivoire-50 px-3 py-2 mb-2">
              <p className="text-[10px] text-onix-400 font-sans mb-1">Custo de material calculado por tamanho:</p>
              <TabelaTamanhos titulo="Couro" valores={preview.couro} />
            </div>

            <Campo
              label="Sintetico (courino) — preco por metro, 1,40m de largura (Escritex)"
              campo="mat_sintetico_metro"
              valor={tabela.mat_sintetico_metro ?? MAT_DEFAULTS.sintetico_metro}
              onChange={set}
              descricao="Courvin Cipatex ou equivalente. Rendimento ~10 capas A5 por metro."
            />
            <div className="bg-ivoire-50 px-3 py-2 mb-2">
              <TabelaTamanhos titulo="Sintetico" valores={preview.sintetico} />
            </div>

            <Campo
              label="Linho — preco por ½ metro, 1,33m de largura (Pitamello)"
              campo="mat_linho_meio_metro"
              valor={tabela.mat_linho_meio_metro ?? MAT_DEFAULTS.linho_meio_metro}
              onChange={set}
              descricao="Linho misto ou puro. Vendido por ½ metro na maioria dos fornecedores."
            />
            <div className="bg-ivoire-50 px-3 py-2">
              <TabelaTamanhos titulo="Linho" valores={preview.linho} />
            </div>
          </Secao>

          {/* Personalização */}
          <Secao titulo="Personalizacao e Acabamentos">
            <Campo
              label="Gravacao / bordado — consumiveis base"
              campo="mat_gravacao"
              valor={tabela.mat_gravacao ?? MAT_DEFAULTS.gravacao}
              onChange={set}
              descricao="Inclui consumiveis de relevo (baixo/alto) ou linha DMC para bordado cor unica."
            />
            <Campo
              label="Pespontos decorativos — linha encerada"
              campo="mat_pespontos"
              valor={tabela.mat_pespontos ?? MAT_DEFAULTS.pespontos}
              onChange={set}
              descricao="Linha encerada R$20/rolo 130m. Um pesponto consome ~50m de linha."
            />
          </Secao>

          {/* Ferragens */}
          <Secao titulo="Ferragens e Encadernacao">
            <Campo
              label="Wire-O — ferragem anel duplo metalico"
              campo="mat_wire_o"
              valor={tabela.mat_wire_o ?? MAT_DEFAULTS.wire_o}
              onChange={set}
              descricao="Custo por ferragem Wire-O. Varia por tamanho — use valor medio."
            />
            <div className="py-2 border-b border-ivoire-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-onix-600 font-sans">Cantoneiras metal simples (×4)</p>
                  <p className="text-[10px] text-onix-400 font-sans mt-0.5">Marwal — 100 unidades R$75,00 = R$0,75/un × 4</p>
                </div>
                <span className="text-xs text-onix-500 font-sans font-medium">{R(MAT_DEFAULTS.cantoneira_metal_simples)}</span>
              </div>
            </div>
            <div className="py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-onix-600 font-sans">Cantoneiras metal trabalhado (×4)</p>
                  <p className="text-[10px] text-onix-400 font-sans mt-0.5">Marwal — 100 unidades R$160,00 = R$1,60/un × 4</p>
                </div>
                <span className="text-xs text-onix-500 font-sans font-medium">{R(MAT_DEFAULTS.cantoneira_metal_trabalhado)}</span>
              </div>
            </div>
          </Secao>

          {/* Embalagem */}
          <Secao titulo="Embalagem">
            <Campo
              label="Embalagem padrao — saquinho algodao cru"
              campo="mat_embalagem_padrao"
              valor={tabela.mat_embalagem_padrao ?? MAT_DEFAULTS.embalagem_padrao}
              onChange={set}
              descricao="Algodao cru 160g R$24,99/m × 1,60m larg. Saquinho 25×30cm = ~R$7,50 de tecido + costura."
            />
            <Campo
              label="Embalagem presente — saquinho + caixa personalizada"
              campo="mat_embalagem_presente"
              valor={tabela.mat_embalagem_presente ?? MAT_DEFAULTS.embalagem_presente}
              onChange={set}
              descricao="Saquinho de algodao + caixa premium + papel de seda."
            />
          </Secao>

          <div className="bg-ivoire-100 border border-ivoire-300 p-4">
            <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-2">Como os precos sao aplicados</p>
            <p className="text-xs text-onix-600 font-sans leading-relaxed">
              Os valores acima sao <strong>custos de material bruto</strong>. O preco final ao cliente inclui tambem: mao de obra + custos fixos + margens (configurados nas outras abas).<br /><br />
              Atualizar quando receber nova nota fiscal do fornecedor.
            </p>
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
                <span className="text-xs text-onix-500 font-sans">Custo fixo por caderno</span>
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
