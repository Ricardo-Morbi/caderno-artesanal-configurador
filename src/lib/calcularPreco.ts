import type { ConfiguracaoCaderno } from '@/types/caderno'

// ============================================================
// TABELA LOOKUP — CUSTO DO MIOLO (material bruto)
// null = combinação não disponível
// ============================================================

type EspessuraMiolo = 'fino' | 'medio' | 'grosso'
type TamanhoMiolo = 'A6' | 'A5' | 'A4' | 'especial'

const MIOLO_OFFSET: Record<string, Record<TamanhoMiolo, Record<EspessuraMiolo, number | null>>> = {
  '90g': {
    A6:      { fino: 1.30, medio: 2.50, grosso: 6.00 },
    A5:      { fino: 2.50, medio: 5.80, grosso: 6.70 },
    A4:      { fino: 5.80, medio: 6.00, grosso: 7.10 },
    especial:{ fino: 6.00, medio: 6.70, grosso: 8.50 },
  },
  '120g': {
    A6:      { fino: 1.65, medio: 3.40, grosso: null },
    A5:      { fino: 3.40, medio: 6.80, grosso: 7.70 },
    A4:      { fino: 6.80, medio: 7.00, grosso: 8.10 },
    especial:{ fino: 7.00, medio: 7.70, grosso: 8.80 },
  },
  '180g': {
    A6:      { fino: 2.70, medio: null, grosso: null },
    A5:      { fino: 6.00, medio: 11.20, grosso: null },
    A4:      { fino: 11.20, medio: 11.50, grosso: 12.00 },
    especial:{ fino: 11.50, medio: 12.00, grosso: 15.00 },
  },
}

// Pólen Bold — apenas 90g
const MIOLO_POLEN: Record<TamanhoMiolo, Record<EspessuraMiolo, number>> = {
  A6:      { fino: 1.50, medio: 3.80, grosso: 4.65 },
  A5:      { fino: 3.90, medio: 6.20, grosso: 9.30 },
  A4:      { fino: 6.20, medio: 12.40, grosso: 18.70 },
  especial:{ fino: 6.80, medio: 12.80, grosso: 18.70 },
}

// Reciclado — apenas 80g
const MIOLO_RECICLADO: Record<TamanhoMiolo, Record<EspessuraMiolo, number>> = {
  A6:      { fino: 1.40, medio: 2.80, grosso: 4.40 },
  A5:      { fino: 3.45, medio: 3.95, grosso: 10.35 },
  A4:      { fino: 6.85, medio: 13.70, grosso: 20.55 },
  especial:{ fino: 7.00, medio: 13.70, grosso: 20.55 },
}

// ============================================================
// CUSTO DA CAPA por material e tamanho
// ============================================================

const CAPA_COURO: Record<TamanhoMiolo, number> = {
  A6: 37, A5: 47, A4: 58, especial: 42,
}

const CAPA_SINTETICO: Record<TamanhoMiolo, number> = {
  A6: 25, A5: 35, A4: 40, especial: 30,
}

const CAPA_TECIDO: Record<TamanhoMiolo, number> = {
  A6: 15, A5: 25, A4: 30, especial: 20,
}

// Papel especial: arbol, star (star coat + star plus), vtex, kraft, linho
const CAPA_PAPEL_ARBOL: Record<TamanhoMiolo, number> = {
  A6: 1.50, A5: 3.00, A4: 7.00, especial: 1.50,
}

const CAPA_PAPEL_STAR: Record<TamanhoMiolo, number> = {
  A6: 2.30, A5: 5.00, A4: 11.00, especial: 2.30,
}

const CAPA_PAPEL_VTEX: Record<TamanhoMiolo, number> = {
  A6: 3.10, A5: 7.00, A4: 14.50, especial: 3.10,
}

const CAPA_KRAFT: Record<TamanhoMiolo, number> = {
  A6: 1.00, A5: 2.00, A4: 3.00, especial: 1.00,
}

const CAPA_LINHO: Record<TamanhoMiolo, number> = {
  A6: 2.00, A5: 4.00, A4: 10.00, especial: 2.00,
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
}

// ============================================================
// NOVA FUNÇÃO DE CÁLCULO — tabelas lookup + valores fixos
// ============================================================

export function calcularPreco(c: ConfiguracaoCaderno, _t?: TabelaPrecos): number {
  const tam = tamanhoChave(c.tamanho)
  const esp = c.espessura as EspessuraMiolo

  // ── 1. Miolo ─────────────────────────────────────────────────
  let custo = 0

  // Custo base do miolo
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

  // Toques afetivos — R$15 cada
  if (c.paginaDedicatoria) custo += 15
  if (c.frasesAoLongo) custo += 15
  if (c.datasImportantes) custo += 15
  if (c.essenciaNoParapel) custo += 15

  // Folhas coloridas — R$0,50 por folha (5-10 conforme espessura)
  if (c.folhasColoridas) {
    custo += folhasColoridas(c.espessura) * 0.50
  }

  // Guarda — R$7 se não for branca
  if (c.materialGuarda !== 'branca') custo += 7

  // Corte Deckle Edge — R$5
  if (c.tipoCorteEspecial === 'deckle-edge') custo += 5

  // Cantos arredondados — R$5
  if (c.tipoCantos === 'arredondados') custo += 5

  // Pintura de bordas — R$15
  if (c.pinturaBordasAtiva) custo += 15

  // ── 2. Capa ──────────────────────────────────────────────────

  // Base (papelão cinza)
  custo += 5

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

  // Personalização (qualquer tipo) — R$25
  if (c.querPersonalizacaoCapa && c.nomeGravado.trim().length > 0) {
    custo += 25
  }

  // Aplicações extras — R$18 cada
  custo += c.aplicacoesCapa.length * 18

  // Cantoneiras
  if (c.tipoCantoneiras === 'papel') custo += 5
  else if (c.tipoCantoneiras === 'metal-simples') custo += 9
  else if (c.tipoCantoneiras === 'metal-trabalhado') custo += 12

  // Costura
  if (c.tipoEncadernacao === 'wire-o') custo += 9
  else custo += 6

  // Elástico — R$6
  if (c.elasticoAtivo) custo += 6

  // Marcador — R$8 + R$8 para segundo
  if (c.marcadorAtivo) {
    custo += 8
    if (Number(c.quantidadeMarcadores) >= 2) custo += 8
  }

  // Elementos funcionais — R$7 cada
  if (c.bolsoInterno) custo += 7
  if (c.envelopeAcoplado) custo += 7
  if (c.envelopeContracapa) custo += 7
  if (c.portaCaneta) custo += 7
  if (c.abasOrelhas) custo += 7

  // Embalagem
  if (c.tipoEmbalagem === 'presente') custo += 65
  else custo += 25 // padrão

  return Math.round(custo * 100) / 100
}

// Mantida para compatibilidade com admin
export function detalharPreco(c: ConfiguracaoCaderno, t: TabelaPrecos) {
  const preco = calcularPreco(c, t)
  return {
    custo_material: preco * 0.6,
    horas_trabalho: 1.0,
    custo_mao_obra: preco * 0.2,
    custo_fixo: preco * 0.1,
    custo_total: preco * 0.9,
    margem_valor: preco * 0.1,
    preco_final: preco,
  }
}
