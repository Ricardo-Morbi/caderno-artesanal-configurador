import type { ConfiguracaoCaderno } from '@/types/caderno'

// ============================================================
// TABELA LOOKUP — CUSTO DO MIOLO (material bruto)
// Preços calculados com base em fornecedores de Abril/2026
// null = combinação não disponível
// ============================================================

type EspessuraMiolo = 'fino' | 'medio' | 'grosso'
type TamanhoMiolo = 'A6' | 'A5' | 'A4' | 'especial'

// Offset: fino=40fls, medio=80fls, grosso=120fls
// 90g: R$60,85/500fls = R$0,1217/folha A4
const MIOLO_OFFSET: Record<string, Record<TamanhoMiolo, Record<EspessuraMiolo, number | null>>> = {
  '90g': {
    A6:      { fino: 1.22, medio: 2.44, grosso: 3.66 },
    A5:      { fino: 2.44, medio: 4.88, grosso: 7.32 },
    A4:      { fino: 4.88, medio: 9.76, grosso: 14.64 },
    especial:{ fino: 5.84, medio: 11.68, grosso: 17.52 },
  },
  // 120g: R$40,58/250fls = R$0,1623/folha A4
  '120g': {
    A6:      { fino: 1.62, medio: 3.25, grosso: null },
    A5:      { fino: 3.25, medio: 6.49, grosso: 9.74 },
    A4:      { fino: 6.49, medio: 12.98, grosso: 19.48 },
    especial:{ fino: 7.79, medio: 15.58, grosso: 23.37 },
  },
  // 180g: R$67,18/250fls = R$0,2687/folha A4
  '180g': {
    A6:      { fino: 2.69, medio: null, grosso: null },
    A5:      { fino: 5.37, medio: 10.75, grosso: null },
    A4:      { fino: 10.75, medio: 21.50, grosso: 32.24 },
    especial:{ fino: 12.90, medio: 25.80, grosso: 38.70 },
  },
}

// Pólen Bold 90g: R$37,07/250fls = R$0,1483/folha A4
const MIOLO_POLEN: Record<TamanhoMiolo, Record<EspessuraMiolo, number>> = {
  A6:      { fino: 1.48, medio: 2.97, grosso: 4.45 },
  A5:      { fino: 2.97, medio: 5.93, grosso: 8.90 },
  A4:      { fino: 5.93, medio: 11.86, grosso: 17.80 },
  especial:{ fino: 7.12, medio: 14.24, grosso: 21.36 },
}

// Reciclado 80g: R$6,81/50fls = R$0,1362/folha A4
const MIOLO_RECICLADO: Record<TamanhoMiolo, Record<EspessuraMiolo, number>> = {
  A6:      { fino: 1.36, medio: 2.72, grosso: 4.09 },
  A5:      { fino: 2.72, medio: 5.45, grosso: 8.17 },
  A4:      { fino: 5.45, medio: 10.90, grosso: 16.34 },
  especial:{ fino: 6.54, medio: 13.07, grosso: 19.61 },
}

// ============================================================
// CUSTO DA CAPA por material e tamanho
// Baseado em preços fornecedores Abril/2026
// ============================================================

// Papelão cinza base (front+back+margem): R$0,62/folha A5
const BASE_CAPA: Record<TamanhoMiolo, number> = {
  A6: 2, A5: 4, A4: 7, especial: 5,
}

// Couro classe B (R$37,90/painel 25×36cm)
const CAPA_COURO: Record<TamanhoMiolo, number> = {
  A6: 19, A5: 43, A4: 78, especial: 56,
}

// Courvin/sintético (R$28,40/m, ~1,4m de largura)
const CAPA_SINTETICO: Record<TamanhoMiolo, number> = {
  A6: 10, A5: 20, A4: 30, especial: 22,
}

// Tecido/tricoline (R$21,49/m, ~1,4m de largura)
const CAPA_TECIDO: Record<TamanhoMiolo, number> = {
  A6: 6, A5: 12, A4: 18, especial: 14,
}

// Árbol (R$19,65/folha ~66×96cm)
const CAPA_PAPEL_ARBOL: Record<TamanhoMiolo, number> = {
  A6: 1.50, A5: 3.15, A4: 5.75, especial: 4.15,
}

// Star Coat (R$18,12–R$31/folha ~66×96cm, média R$22)
const CAPA_PAPEL_STAR: Record<TamanhoMiolo, number> = {
  A6: 1.60, A5: 3.50, A4: 6.50, especial: 4.65,
}

// Vtex (R$43,31/folha 66×96cm)
const CAPA_PAPEL_VTEX: Record<TamanhoMiolo, number> = {
  A6: 3.15, A5: 6.95, A4: 12.65, especial: 9.10,
}

// Kraft (material básico, baixo custo)
const CAPA_KRAFT: Record<TamanhoMiolo, number> = {
  A6: 0.80, A5: 1.60, A4: 2.50, especial: 1.80,
}

// Linho (R$45–R$66/½m; média R$56/½m = R$112/m, ~1,4m largura = R$80/m²)
const CAPA_LINHO: Record<TamanhoMiolo, number> = {
  A6: 4, A5: 8, A4: 15, especial: 11,
}

// ============================================================
// UTILITÁRIOS
// ============================================================

function tamanhoChave(tamanho: string): TamanhoMiolo {
  if (tamanho === 'A6') return 'A6'
  if (tamanho === 'A5') return 'A5'
  if (tamanho === 'A4') return 'A4'
  return 'especial'
}

function folhasColoridas(espessura: string): number {
  if (espessura === 'fino') return 5
  if (espessura === 'medio') return 7
  return 10 // grosso
}

// Detecta subtipo do papel especial pela cor escolhida
function subtipoCapaEspecial(corCapa: string): 'arbol' | 'star' | 'vtex' {
  // VTEX: camel #C19A6B, mostarda #E3A020, chocolate #3D1C02
  if (['#c19a6b', '#e3a020', '#3d1c02'].includes(corCapa.toLowerCase())) return 'vtex'
  // Árbol: caramelo #C07848, bege #D4B896
  if (['#c07848', '#d4b896'].includes(corCapa.toLowerCase())) return 'arbol'
  // Star é o restante do papel especial
  return 'star'
}

// ============================================================
// INTERFACES (mantidas para compatibilidade com admin)
// ============================================================

export interface TabelaPrecos {
  materialBase: number
  tamanho_A5: number
  tamanho_A4: number
  tamanho_personalizado: number
  espessura_medio: number
  espessura_grosso: number
  espessura_extraGrosso: number
  capa_couro: number
  capa_sintetico: number
  capa_tecido: number
  capa_papelEspecial: number
  capa_kraft: number
  capa_linho: number
  estampa_floral: number
  estampa_minimalista: number
  estampa_abstrata: number
  estampa_tematica: number
  gravacao_baixoRelevo: number
  gravacao_altoRelevo: number
  gravacao_bordado: number
  enc_francesaCruzada: number
  enc_longStitch: number
  enc_wireO: number
  papel_polen: number
  papel_reciclado: number
  papel_vegetal: number
  gramatura_120g: number
  gramatura_180g: number
  gramatura_240g: number
  elem_elastico: number
  elem_marcador: number
  elem_bolso: number
  elem_portaCaneta: number
  elem_envelope: number
  elem_abas: number
  acab_pinturaBordas: number
  acab_deckleEdge: number
  acab_laminacao: number
  acab_guardaEspecial: number
  valorHoraArtesa: number
  tempo_fino: number
  tempo_medio: number
  tempo_grosso: number
  tempo_extraGrosso: number
  tempoExtra_gravacao: number
  tempoExtra_bordado: number
  tempoExtra_bolso: number
  tempoExtra_acabamento: number
  custoFixoMensal: number
  producaoMediaMensal: number
  margemLucro: number
  margemInvestimento: number
}

export const TABELA_PADRAO: TabelaPrecos = {
  materialBase: 8, tamanho_A5: 2, tamanho_A4: 4, tamanho_personalizado: 8,
  espessura_medio: 3, espessura_grosso: 6, espessura_extraGrosso: 10,
  capa_couro: 50, capa_sintetico: 20, capa_tecido: 15, capa_papelEspecial: 10,
  capa_kraft: 7, capa_linho: 18,
  estampa_floral: 8, estampa_minimalista: 5, estampa_abstrata: 10, estampa_tematica: 15,
  gravacao_baixoRelevo: 10, gravacao_altoRelevo: 15, gravacao_bordado: 20,
  enc_francesaCruzada: 8, enc_longStitch: 6, enc_wireO: 12,
  papel_polen: 5, papel_reciclado: 3, papel_vegetal: 8,
  gramatura_120g: 4, gramatura_180g: 9, gramatura_240g: 15,
  elem_elastico: 5, elem_marcador: 7, elem_bolso: 9, elem_portaCaneta: 4,
  elem_envelope: 8, elem_abas: 5,
  acab_pinturaBordas: 5, acab_deckleEdge: 10, acab_laminacao: 6, acab_guardaEspecial: 7,
  valorHoraArtesa: 35, tempo_fino: 0.75, tempo_medio: 1.0, tempo_grosso: 1.5,
  tempo_extraGrosso: 2.0, tempoExtra_gravacao: 0.25, tempoExtra_bordado: 0.75,
  tempoExtra_bolso: 0.2, tempoExtra_acabamento: 0.3,
  custoFixoMensal: 500, producaoMediaMensal: 20, margemLucro: 50,
  margemInvestimento: 10,
}

// ============================================================
// FUNÇÃO DE CÁLCULO — tabelas lookup de custo de material
// ============================================================

export function calcularPreco(c: ConfiguracaoCaderno, _t?: TabelaPrecos): number {
  const tam = tamanhoChave(c.tamanho)
  const esp = c.espessura as EspessuraMiolo

  // ── 1. Miolo ─────────────────────────────────────────────────
  let custo = 0

  // Custo base do miolo (papel)
  if (c.tipoPapel === 'offset') {
    const gram = c.graturaPapel === '80g' ? '90g' : c.graturaPapel // fallback
    const tabGram = MIOLO_OFFSET[gram as string]
    if (tabGram) {
      const val = tabGram[tam]?.[esp]
      custo += val ?? 0
    }
  } else if (c.tipoPapel === 'polen') {
    custo += MIOLO_POLEN[tam][esp]
  } else if (c.tipoPapel === 'reciclado') {
    custo += MIOLO_RECICLADO[tam][esp]
  }

  // Impressão por folha (frente e verso = 2 impressões por folha)
  const nFolhas = c.espessura === 'fino' ? 40 : c.espessura === 'medio' ? 80 : 120
  const temImpressaoColorida = ['maternidade', 'casamento', 'viagens', 'gratidao', 'versatil'].includes(c.temaCaderno)
  const temImpressaoPB = ['sem-tema-2', 'planner', 'estudos'].includes(c.temaCaderno)
  if (temImpressaoColorida) {
    custo += nFolhas * 2 * 0.20
  } else if (temImpressaoPB) {
    custo += nFolhas * 2 * 0.05
  }

  // Toques afetivos — R$15 cada (impressão + papel especial)
  if (c.paginaDedicatoria) custo += 15
  if (c.frasesAoLongo) custo += 15
  if (c.datasImportantes) custo += 15
  if (c.essenciaNoParapel) custo += 15

  // Folhas coloridas — R$0,50 por folha (5-10 conforme espessura)
  if (c.folhasColoridas) {
    custo += folhasColoridas(c.espessura) * 0.50
  }

  // Guarda — R$7 se não for branca (papel de guarda estampado ou colorido)
  if (c.materialGuarda !== 'branca') custo += 7

  // Corte Deckle Edge — R$5 (equipamento + tempo de material)
  if (c.tipoCorteEspecial === 'deckle-edge') custo += 5

  // Cantos arredondados — R$3 (ferramenta de canto)
  if (c.tipoCantos === 'arredondados') custo += 3

  // Pintura de bordas — R$8 (tinta + acabamento)
  if (c.pinturaBordasAtiva) custo += 8

  // ── 2. Capa ──────────────────────────────────────────────────

  // Base: papelão cinza (varia por tamanho), cola PVA, consumíveis básicos
  custo += BASE_CAPA[tam]

  // Material da capa
  if (c.materialCapa === 'couro') {
    custo += CAPA_COURO[tam]
  } else if (c.materialCapa === 'sintetico') {
    custo += CAPA_SINTETICO[tam]
  } else if (c.materialCapa === 'tecido') {
    custo += CAPA_TECIDO[tam]
  } else if (c.materialCapa === 'papel-especial') {
    const sub = subtipoCapaEspecial(c.corCapa)
    if (sub === 'arbol') custo += CAPA_PAPEL_ARBOL[tam]
    else if (sub === 'vtex') custo += CAPA_PAPEL_VTEX[tam]
    else custo += CAPA_PAPEL_STAR[tam]
  } else if (c.materialCapa === 'kraft') {
    custo += CAPA_KRAFT[tam]
  } else if (c.materialCapa === 'linho') {
    custo += CAPA_LINHO[tam]
  }

  // Personalização (qualquer tipo) — R$25 (consumíveis de gravação/bordado)
  if (c.querPersonalizacaoCapa && c.nomeGravado.trim().length > 0) {
    custo += 25
  }

  // Aplicações extras — R$18 cada (material de aplicação)
  custo += c.aplicacoesCapa.length * 18

  // Cantoneiras — preços reais por peça (4 cantos)
  if (c.tipoCantoneiras === 'papel') custo += 2
  else if (c.tipoCantoneiras === 'metal-simples') custo += 3        // 4 × R$0,75
  else if (c.tipoCantoneiras === 'metal-trabalhado') custo += 6.50  // 4 × R$1,60

  // Costura / encadernação
  if (c.tipoEncadernacao === 'wire-o') custo += 9 // wire-o + ferragem
  else custo += 3 // fio de encadernação + agulha (consumível)

  // Elástico — R$0,50 (~60cm de elástico roliço R$0,31/m + fixação)
  if (c.elasticoAtivo) custo += 0.50

  // Marcador — R$0,50 por fitilho (40cm cetim 7mm R$0,149/m)
  if (c.marcadorAtivo) {
    custo += 0.50
    if (Number(c.quantidadeMarcadores) >= 2) custo += 0.50
  }

  // Elementos funcionais — custo de material por item
  if (c.bolsoInterno) custo += 3         // papel + cola
  if (c.envelopeAcoplado) custo += 4     // envelope kraft
  if (c.envelopeContracapa) custo += 4   // envelope kraft
  if (c.portaCaneta) custo += 2          // elástico + fixação
  if (c.abasOrelhas) custo += 3          // papel ou tecido

  // Embalagem
  if (c.tipoEmbalagem === 'presente') custo += 15  // caixa presente + ribbon + tissue
  else custo += 5                                   // caixa kraft padrão

  return Math.round(custo * 100) / 100
}

// ============================================================
// DETALHAMENTO DE PREÇO — agrega material + mão de obra + margens
// ============================================================

export function detalharPreco(c: ConfiguracaoCaderno, t: TabelaPrecos) {
  const custo_material = calcularPreco(c)

  // Horas de trabalho baseadas na espessura
  const tempoBase = (
    c.espessura === 'fino'  ? t.tempo_fino  :
    c.espessura === 'medio' ? t.tempo_medio :
    c.espessura === 'grosso'? t.tempo_grosso :
    t.tempo_extraGrosso
  )

  let tempoExtra = 0
  const temGravacao = c.gravacaoCapa && ['baixo-relevo', 'alto-relevo'].includes(c.gravacaoCapa)
  const temBordado  = c.gravacaoCapa === 'bordado'
  const temBolso    = c.bolsoInterno || c.envelopeAcoplado || c.envelopeContracapa
  const temAcab     = c.pinturaBordasAtiva || c.tipoCorteEspecial === 'deckle-edge'

  if (temGravacao) tempoExtra += t.tempoExtra_gravacao
  if (temBordado)  tempoExtra += t.tempoExtra_bordado
  if (temBolso)    tempoExtra += t.tempoExtra_bolso
  if (temAcab)     tempoExtra += t.tempoExtra_acabamento

  const horas_trabalho = Math.round((tempoBase + tempoExtra) * 100) / 100
  const custo_mao_obra = Math.round(horas_trabalho * t.valorHoraArtesa * 100) / 100
  const custo_fixo     = Math.round((t.custoFixoMensal / Math.max(t.producaoMediaMensal, 1)) * 100) / 100
  const custo_total    = Math.round((custo_material + custo_mao_obra + custo_fixo) * 100) / 100

  const margemInv      = t.margemInvestimento ?? 10
  const multiplicador  = (1 + t.margemLucro / 100) * (1 + margemInv / 100)
  const preco_final    = Math.round(custo_total * multiplicador * 100) / 100
  const margem_valor   = Math.round((preco_final - custo_total) * 100) / 100

  return {
    custo_material,
    horas_trabalho,
    custo_mao_obra,
    custo_fixo,
    custo_total,
    margem_valor,
    preco_final,
  }
}
