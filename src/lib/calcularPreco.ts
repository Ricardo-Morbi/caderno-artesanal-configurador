import type { ConfiguracaoCaderno } from '@/types/caderno'

// ============================================================
// TABELA LOOKUP — CUSTO DO MIOLO (material bruto)
// Preços calculados com base em fornecedores de Abril/2026
// Fonte: FIBRA PAPÉIS
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
// CUSTO DA CAPA — materiais fixos por tamanho
// Papelão cinza 1,9mm: R$30,99/50fls A5 = R$0,62/folha A5
// ============================================================

const BASE_CAPA: Record<TamanhoMiolo, number> = {
  A6: 2, A5: 4, A4: 7, especial: 5,
}

// Árbol (R$19,65/folha ~66×96cm) — calha de madeira relevo
const CAPA_PAPEL_ARBOL: Record<TamanhoMiolo, number> = {
  A6: 1.50, A5: 3.15, A4: 5.75, especial: 4.15,
}

// Star Coat (R$18,12–R$31/folha ~66×96cm, média R$22)
const CAPA_PAPEL_STAR: Record<TamanhoMiolo, number> = {
  A6: 1.60, A5: 3.50, A4: 6.50, especial: 4.65,
}

// Kraft (papelão kraft básico)
const CAPA_KRAFT: Record<TamanhoMiolo, number> = {
  A6: 0.80, A5: 1.60, A4: 2.50, especial: 1.80,
}

// ============================================================
// CUSTOS DE MATERIAL — defaults derivados de fornecedores
// Fonte: Galeria Mats, Escritex, Pitamello, Marwal (Abril/2026)
// ============================================================

// Defaults para quando TabelaPrecos não tem os campos de material
export const MAT_DEFAULTS = {
  couro_painel:        37.90,  // R$/painel 25×36cm — Galeria Mats Classe B
  sintetico_metro:     28.40,  // R$/metro 1,40m larg — Courvin Cipatex (Escritex)
  linho_meio_metro:    45.00,  // R$/½ metro 1,33m larg — Linho Misto (Pitamello)
  gravacao:            25,     // Consumíveis gravação/bordado (base)
  bordado_colorido_extra: 6.45, // Meada DMC adicional para bordado colorido
  pespontos:           8,      // Linha encerada R$20/130m × ~50m de pespontos
  wire_o:              9,      // Ferragem Wire-O
  cantoneira_papel:    2,      // 4 cantos em papel
  cantoneira_metal_simples:   3,    // 4 × R$0,75 — Marwal 100un=R$75
  cantoneira_metal_trabalhado: 6.40, // 4 × R$1,60 — Marwal 100un=R$160
  embalagem_padrao:    8,      // Saquinho algodão cru 160g R$24,99/m
  embalagem_presente:  15,     // Saquinho + caixa personalizada
}

// Calcula custo de couro por tamanho a partir do preço do painel
// A6: 1 painel (2 peças por painel 25×36) | A5/A4: 2 painéis | especial: 1,5 painéis
function calcCapaCouro(painelPreco: number): Record<TamanhoMiolo, number> {
  return {
    A6:      Math.round(painelPreco * 1.0 * 100) / 100,
    A5:      Math.round(painelPreco * 2.0 * 100) / 100,
    A4:      Math.round(painelPreco * 2.0 * 100) / 100,
    especial:Math.round(painelPreco * 1.5 * 100) / 100,
  }
}

// Calcula custo de sintético por tamanho a partir do preço por metro (1,40m larg)
// Fator de perda: 40% | Áreas: A6≈0,055m² A5≈0,094m² A4≈0,169m² especial≈0,110m²
function calcCapaSintetico(metroPreco: number): Record<TamanhoMiolo, number> {
  const m2 = metroPreco / 1.40
  const w = 1.40
  return {
    A6:      Math.max(1, Math.round(0.055 * m2 * w * 100) / 100),
    A5:      Math.max(1, Math.round(0.094 * m2 * w * 100) / 100),
    A4:      Math.max(2, Math.round(0.169 * m2 * w * 100) / 100),
    especial:Math.max(1, Math.round(0.110 * m2 * w * 100) / 100),
  }
}

// Calcula custo de linho por tamanho a partir do preço por ½ metro (1,33m larg)
function calcCapaLinho(meioMetroPreco: number): Record<TamanhoMiolo, number> {
  const m2 = (meioMetroPreco * 2) / 1.33
  const w = 1.40
  return {
    A6:      Math.max(1, Math.round(0.055 * m2 * w * 100) / 100),
    A5:      Math.max(2, Math.round(0.094 * m2 * w * 100) / 100),
    A4:      Math.max(4, Math.round(0.169 * m2 * w * 100) / 100),
    especial:Math.max(2, Math.round(0.110 * m2 * w * 100) / 100),
  }
}

// ============================================================
// INTERFACES
// ============================================================

export interface TabelaPrecos {
  // Mão de obra
  valorHoraArtesa: number
  tempo_fino: number
  tempo_medio: number
  tempo_grosso: number
  tempo_extraGrosso: number
  tempoExtra_gravacao: number
  tempoExtra_bordado: number
  tempoExtra_bolso: number
  tempoExtra_acabamento: number
  // Custos fixos e margens
  custoFixoUnitario: number
  margemLucro: number
  margemInvestimento: number
  // Custos de material (editáveis no admin — derivam preços por tamanho)
  mat_couro_painel: number        // R$/painel 25×36cm (Galeria Mats)
  mat_sintetico_metro: number     // R$/metro 1,40m larg (Courvin Cipatex)
  mat_linho_meio_metro: number    // R$/½ metro 1,33m larg (Pitamello)
  mat_gravacao: number            // custo consumíveis de gravação/bordado base
  mat_pespontos: number           // custo material pespontos
  mat_wire_o: number              // custo ferragem Wire-O
  mat_embalagem_padrao: number    // embalagem saquinho padrão
  mat_embalagem_presente: number  // embalagem presente (saquinho + caixa)
}

export const TABELA_PADRAO: TabelaPrecos = {
  valorHoraArtesa: 35,
  tempo_fino: 0.75,
  tempo_medio: 1,
  tempo_grosso: 1.5,
  tempo_extraGrosso: 2,
  tempoExtra_gravacao: 0.25,
  tempoExtra_bordado: 0.75,
  tempoExtra_bolso: 0.2,
  tempoExtra_acabamento: 0.3,
  custoFixoUnitario: 25,
  margemLucro: 50,
  margemInvestimento: 10,
  // Custos de material (fornecedores Abril/2026)
  mat_couro_painel:        MAT_DEFAULTS.couro_painel,
  mat_sintetico_metro:     MAT_DEFAULTS.sintetico_metro,
  mat_linho_meio_metro:    MAT_DEFAULTS.linho_meio_metro,
  mat_gravacao:            MAT_DEFAULTS.gravacao,
  mat_pespontos:           MAT_DEFAULTS.pespontos,
  mat_wire_o:              MAT_DEFAULTS.wire_o,
  mat_embalagem_padrao:    MAT_DEFAULTS.embalagem_padrao,
  mat_embalagem_presente:  MAT_DEFAULTS.embalagem_presente,
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

function qtdFolhasColoridas(espessura: string): number {
  if (espessura === 'fino') return 5
  if (espessura === 'medio') return 7
  return 10
}

// Detecta subtipo do papel especial pelo papelEspecialId
// Papel-5 (Verde Esmeralda) e Papel-6 (Prata) → Star Coat (metalizado/vinílico)
// Demais (relevo madeira) → Árbol
function subtipoCapaEspecial(papelEspecialId: string): 'arbol' | 'star' {
  if (['Papel-5', 'Papel-6'].includes(papelEspecialId)) return 'star'
  return 'arbol'
}

// Extrai todos os custos de material da tabela (com fallback nos defaults)
function getCustosMat(t?: TabelaPrecos) {
  const couroPanel  = t?.mat_couro_painel        ?? MAT_DEFAULTS.couro_painel
  const sintMet     = t?.mat_sintetico_metro      ?? MAT_DEFAULTS.sintetico_metro
  const linhMeio    = t?.mat_linho_meio_metro     ?? MAT_DEFAULTS.linho_meio_metro
  return {
    couro:    calcCapaCouro(couroPanel),
    sintetico:calcCapaSintetico(sintMet),
    linho:    calcCapaLinho(linhMeio),
    gravacao:          t?.mat_gravacao            ?? MAT_DEFAULTS.gravacao,
    bordadoColoridoExtra: MAT_DEFAULTS.bordado_colorido_extra,
    pespontos:         t?.mat_pespontos           ?? MAT_DEFAULTS.pespontos,
    wire_o:            t?.mat_wire_o              ?? MAT_DEFAULTS.wire_o,
    cantoneira_papel:             MAT_DEFAULTS.cantoneira_papel,
    cantoneira_metal_simples:     MAT_DEFAULTS.cantoneira_metal_simples,
    cantoneira_metal_trabalhado:  MAT_DEFAULTS.cantoneira_metal_trabalhado,
    embalagem_padrao:  t?.mat_embalagem_padrao    ?? MAT_DEFAULTS.embalagem_padrao,
    embalagem_presente:t?.mat_embalagem_presente  ?? MAT_DEFAULTS.embalagem_presente,
  }
}

// ============================================================
// calcularPreco — custo total de material
// Baseado EXCLUSIVAMENTE em campos presentes nas perguntas
// ============================================================

export function calcularPreco(c: ConfiguracaoCaderno, t?: TabelaPrecos): number {
  const tam = tamanhoChave(c.tamanho)
  const esp = c.espessura as EspessuraMiolo
  const mat = getCustosMat(t)

  let custo = 0

  // ── 1. Miolo ─────────────────────────────────────────────────

  // Papel do miolo
  if (c.tipoPapel === 'offset') {
    const gram = c.graturaPapel === '80g' ? '90g' : c.graturaPapel
    const tabGram = MIOLO_OFFSET[gram as string]
    if (tabGram) custo += tabGram[tam]?.[esp] ?? 0
  } else if (c.tipoPapel === 'polen') {
    custo += MIOLO_POLEN[tam][esp]
  } else if (c.tipoPapel === 'reciclado') {
    custo += MIOLO_RECICLADO[tam][esp]
  }

  // Impressão por folha (frente e verso = 2 impressões por folha)
  const nFolhas = c.espessura === 'fino' ? 40 : c.espessura === 'medio' ? 80 : 120
  const temImpressaoColorida = ['maternidade', 'casamento', 'viagens', 'gratidao', 'versatil'].includes(c.temaCaderno)
  const temImpressaoPB = ['sem-tema-2', 'planner', 'estudos'].includes(c.temaCaderno)
  if (temImpressaoColorida) custo += nFolhas * 2 * 0.20
  else if (temImpressaoPB)  custo += nFolhas * 2 * 0.05

  // Toques afetivos (pergunta extras-afetivos)
  if (c.paginaDedicatoria) custo += 15
  if (c.essenciaNoParapel) custo += 15

  // Folhas coloridas intercaladas
  if (c.folhasColoridas) custo += qtdFolhasColoridas(c.espessura) * 0.50

  // Cantos arredondados (pintura de bordas)
  if (c.tipoCantos === 'arredondados') custo += 3

  // Pintura de bordas das páginas
  if (c.pinturaBordasAtiva) custo += 8

  // ── 2. Capa ──────────────────────────────────────────────────

  // Base: papelão cinza (varia por tamanho) + cola + consumíveis
  custo += BASE_CAPA[tam]

  // Material da capa
  if (c.materialCapa === 'couro') {
    custo += mat.couro[tam]
  } else if (c.materialCapa === 'sintetico') {
    custo += mat.sintetico[tam]
  } else if (c.materialCapa === 'papel-especial') {
    const sub = subtipoCapaEspecial(c.papelEspecialId ?? '')
    custo += sub === 'arbol' ? CAPA_PAPEL_ARBOL[tam] : CAPA_PAPEL_STAR[tam]
  } else if (c.materialCapa === 'kraft') {
    custo += CAPA_KRAFT[tam]
  } else if (c.materialCapa === 'linho') {
    custo += mat.linho[tam]
  }

  // Lombada protegida — material extra para cobrir costura
  if (c.tipoLombada === 'protegida')                  custo += 3
  else if (c.tipoLombada === 'protegida-costura-aparente') custo += 4

  // Pespontos decorativos
  if (c.pespontosAtivo) custo += mat.pespontos

  // Personalização (gravação / bordado)
  if (c.querPersonalizacaoCapa && c.nomeGravado.trim().length > 0) {
    custo += mat.gravacao
    // Bordado colorido usa fio adicional (meada DMC extra)
    if (c.gravacaoCapa === 'bordado' && c.tipoBordado === 'colorido') {
      custo += mat.bordadoColoridoExtra
    }
  }

  // Cantoneiras (4 cantos)
  if (c.tipoCantoneiras === 'papel')             custo += mat.cantoneira_papel
  else if (c.tipoCantoneiras === 'metal-simples')    custo += mat.cantoneira_metal_simples
  else if (c.tipoCantoneiras === 'metal-trabalhado') custo += mat.cantoneira_metal_trabalhado

  // Encadernação / costura
  if (c.tipoEncadernacao === 'wire-o') custo += mat.wire_o
  else custo += 3  // linha encerada + agulha (~R$0,31/m × 2m + desgaste)

  // Elástico de fechamento (~60cm elástico roliço 2mm: R$0,18)
  if (c.elasticoAtivo) custo += 0.50

  // Marcador de páginas (fita cetim 40cm)
  if (c.marcadorAtivo) {
    custo += 0.50
    if (Number(c.quantidadeMarcadores) >= 2) custo += 0.50
  }

  // Elementos funcionais (pergunta extras-elementos)
  if (c.bolsoInterno)       custo += 3   // papel + cola
  if (c.envelopeContracapa) custo += 4   // envelope kraft
  if (c.abasOrelhas)        custo += 3   // papel ou tecido

  // Embalagem
  if (c.tipoEmbalagem === 'presente') custo += mat.embalagem_presente
  else                                custo += mat.embalagem_padrao

  return Math.round(custo * 100) / 100
}

// ============================================================
// itemizarPreco — breakdown por componente (ficha técnica)
// ============================================================

export interface ItemPreco { titulo: string; custo: number }

export function itemizarPreco(c: ConfiguracaoCaderno, t?: TabelaPrecos): ItemPreco[] {
  const tam = tamanhoChave(c.tamanho)
  const esp = c.espessura as EspessuraMiolo
  const mat = getCustosMat(t)
  const itens: ItemPreco[] = []

  // Miolo — papel
  let custoMiolo = 0
  if (c.tipoPapel === 'offset') {
    const gram = c.graturaPapel === '80g' ? '90g' : c.graturaPapel
    const tabGram = MIOLO_OFFSET[gram as string]
    if (tabGram) custoMiolo = tabGram[tam]?.[esp] ?? 0
  } else if (c.tipoPapel === 'polen') {
    custoMiolo = MIOLO_POLEN[tam][esp]
  } else if (c.tipoPapel === 'reciclado') {
    custoMiolo = MIOLO_RECICLADO[tam][esp]
  }
  itens.push({ titulo: `Papel miolo (${c.tipoPapel} ${c.graturaPapel})`, custo: custoMiolo })

  // Impressão
  const nFolhas = c.espessura === 'fino' ? 40 : c.espessura === 'medio' ? 80 : 120
  const temImpressaoColorida = ['maternidade', 'casamento', 'viagens', 'gratidao', 'versatil'].includes(c.temaCaderno)
  const temImpressaoPB = ['sem-tema-2', 'planner', 'estudos'].includes(c.temaCaderno)
  if (temImpressaoColorida) itens.push({ titulo: 'Impressão colorida (miolo temático)', custo: nFolhas * 2 * 0.20 })
  else if (temImpressaoPB)  itens.push({ titulo: 'Impressão P&B (pautas/pontilhado)', custo: nFolhas * 2 * 0.05 })

  // Toques afetivos
  if (c.paginaDedicatoria) itens.push({ titulo: 'Página de dedicatória', custo: 15 })
  if (c.essenciaNoParapel) itens.push({ titulo: 'Essência no papel', custo: 15 })

  // Folhas coloridas
  if (c.folhasColoridas) itens.push({ titulo: 'Folhas coloridas intercaladas', custo: qtdFolhasColoridas(c.espessura) * 0.50 })

  // Acabamentos das páginas
  if (c.tipoCantos === 'arredondados') itens.push({ titulo: 'Cantos arredondados', custo: 3 })
  if (c.pinturaBordasAtiva) itens.push({ titulo: 'Pintura de bordas', custo: 8 })

  // Capa — base
  itens.push({ titulo: 'Base papelão cinza (capa)', custo: BASE_CAPA[tam] })

  // Capa — material
  let custoCapaMat = 0
  if (c.materialCapa === 'couro')          custoCapaMat = mat.couro[tam]
  else if (c.materialCapa === 'sintetico') custoCapaMat = mat.sintetico[tam]
  else if (c.materialCapa === 'papel-especial') {
    const sub = subtipoCapaEspecial(c.papelEspecialId ?? '')
    custoCapaMat = sub === 'arbol' ? CAPA_PAPEL_ARBOL[tam] : CAPA_PAPEL_STAR[tam]
  } else if (c.materialCapa === 'kraft')   custoCapaMat = CAPA_KRAFT[tam]
  else if (c.materialCapa === 'linho')     custoCapaMat = mat.linho[tam]
  itens.push({ titulo: `Material capa (${c.materialCapa})`, custo: custoCapaMat })

  // Lombada
  if (c.tipoLombada === 'protegida')                   itens.push({ titulo: 'Lombada protegida (material extra)', custo: 3 })
  else if (c.tipoLombada === 'protegida-costura-aparente') itens.push({ titulo: 'Lombada protegida c/ costura aparente', custo: 4 })

  // Pespontos
  if (c.pespontosAtivo) itens.push({ titulo: 'Pespontos decorativos', custo: mat.pespontos })

  // Personalização
  if (c.querPersonalizacaoCapa && c.nomeGravado.trim().length > 0) {
    itens.push({ titulo: `Personalização "${c.nomeGravado}" (${c.gravacaoCapa})`, custo: mat.gravacao })
    if (c.gravacaoCapa === 'bordado' && c.tipoBordado === 'colorido') {
      itens.push({ titulo: 'Bordado colorido (fio extra DMC)', custo: mat.bordadoColoridoExtra })
    }
  }

  // Cantoneiras
  if (c.tipoCantoneiras === 'papel')             itens.push({ titulo: 'Cantoneiras de papel', custo: mat.cantoneira_papel })
  else if (c.tipoCantoneiras === 'metal-simples')    itens.push({ titulo: 'Cantoneiras metal simples (×4)', custo: mat.cantoneira_metal_simples })
  else if (c.tipoCantoneiras === 'metal-trabalhado') itens.push({ titulo: 'Cantoneiras metal trabalhado (×4)', custo: mat.cantoneira_metal_trabalhado })

  // Encadernação
  itens.push({ titulo: `Encadernação (${c.tipoEncadernacao})`, custo: c.tipoEncadernacao === 'wire-o' ? mat.wire_o : 3 })

  // Elástico
  if (c.elasticoAtivo) itens.push({ titulo: 'Elástico de fechamento', custo: 0.50 })

  // Marcador
  if (c.marcadorAtivo) {
    const qtd = Number(c.quantidadeMarcadores) >= 2 ? 2 : 1
    itens.push({ titulo: `Marcador fitilho cetim (×${qtd})`, custo: qtd * 0.50 })
  }

  // Elementos funcionais
  if (c.bolsoInterno)       itens.push({ titulo: 'Bolso interno', custo: 3 })
  if (c.envelopeContracapa) itens.push({ titulo: 'Envelope na contracapa', custo: 4 })
  if (c.abasOrelhas)        itens.push({ titulo: 'Abas / orelhas', custo: 3 })

  // Embalagem
  const custEmb = c.tipoEmbalagem === 'presente' ? mat.embalagem_presente : mat.embalagem_padrao
  itens.push({ titulo: `Embalagem (${c.tipoEmbalagem === 'presente' ? 'presente' : 'padrão'})`, custo: custEmb })

  return itens.filter(i => i.custo > 0)
}

// ============================================================
// detalharPreco — material + mão de obra + custos fixos + margens
// ============================================================

export function detalharPreco(c: ConfiguracaoCaderno, t: TabelaPrecos) {
  const custo_material = calcularPreco(c, t)

  const tempoBase = (
    c.espessura === 'fino'   ? t.tempo_fino   :
    c.espessura === 'medio'  ? t.tempo_medio  :
    c.espessura === 'grosso' ? t.tempo_grosso :
    t.tempo_extraGrosso
  )

  let tempoExtra = 0
  const temGravacao = c.gravacaoCapa && ['baixo-relevo', 'alto-relevo'].includes(c.gravacaoCapa)
  const temBordado  = c.gravacaoCapa === 'bordado'
  const temBolso    = c.bolsoInterno || c.envelopeContracapa
  const temAcab     = c.pinturaBordasAtiva || c.pespontosAtivo

  if (temGravacao) tempoExtra += t.tempoExtra_gravacao
  if (temBordado)  tempoExtra += t.tempoExtra_bordado
  if (temBolso)    tempoExtra += t.tempoExtra_bolso
  if (temAcab)     tempoExtra += t.tempoExtra_acabamento

  const horas_trabalho = Math.round((tempoBase + tempoExtra) * 100) / 100
  const custo_mao_obra = Math.round(horas_trabalho * t.valorHoraArtesa * 100) / 100
  const custo_fixo     = Math.round((t.custoFixoUnitario ?? 25) * 100) / 100
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
