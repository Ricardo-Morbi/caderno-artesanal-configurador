// ============================================================
// TIPOS DE TODAS AS OPÇÕES DE PERSONALIZAÇÃO DO CADERNO
// ============================================================

export type TamanhosCaderno = 'A6' | 'A5' | 'A4' | 'personalizado'
export type FormatoCaderno = 'retrato' | 'paisagem' | 'quadrado'
export type EspessuraCaderno = 'fino' | 'medio' | 'grosso'

export type MaterialCapa =
  | 'couro'
  | 'sintetico'
  | 'tecido'
  | 'papel-especial'
  | 'kraft'
  | 'linho'

export type EstampaCapa =
  | 'nenhuma'
  | 'floral'
  | 'minimalista'
  | 'abstrata'
  | 'tematica'

export type GravacaoCapa =
  | 'nenhuma'
  | 'baixo-relevo'
  | 'alto-relevo'
  | 'bordado'

export type TipoTipografia = 'serif' | 'sans-serif' | 'script' | 'monoespaco'

export type PosicaoGravacao =
  | 'centro'
  | 'terco-superior'
  | 'terco-inferior'
  | 'canto-inf-direito'

export type AplicacaoCapa =
  | 'renda'
  | 'pespontos'
  | 'botoes'
  | 'metais'
  | 'recortes'

export type TipoEncadernacao =
  | 'copta'
  | 'francesa-cruzada'
  | 'long-stitch'
  | 'belga'
  | 'wire-o'

export type TipoLombada = 'exposta' | 'protegida' | 'protegida-costura-aparente'
export type TipoAbertura = '180-graus' | 'tradicional'

export type TipoPapelMiolo = 'offset' | 'polen' | 'reciclado'
export type GraturaPapel = '80g' | '90g' | '120g' | '180g'
export type CorFolhas = 'branca' | 'creme' | 'colorida'
export type PadraoPaginas = 'liso' | 'pautado' | 'pontilhado' | 'quadriculado'

export type TipoMarcador = 'fita-cetim' | 'couro' | 'cordao-cetim'
export type LarguraMarcador = '7mm' | '10mm'
export type PosicaoElastico = 'horizontal' | 'vertical'

export type TipoCantos = 'arredondados' | 'retos'
export type TipoCorteEspecial = 'nenhum' | 'deckle-edge'
export type TipoLaminacao = 'nenhuma' | 'fosca' | 'brilho'
export type TipoTextura = 'lisa' | 'granulada'

export type MaterialGuarda =
  | 'branca'
  | 'colorida'
  | 'marmorizada'
  | 'kraft'
  | 'estampada'

export type PadraoGuarda = 'liso' | 'floral' | 'geometrico' | 'aquarela'
export type PadraoGuardaEstampado = 'poas' | 'flores' | 'abstrata'

export type TemaCaderno =
  | 'nenhum'           // legado — preview usa este
  | 'sem-tema-1'       // folhas brancas/lisas
  | 'sem-tema-2'       // pauta/pontilhado/quadriculado
  | 'versatil'         // tema personalizado
  | 'maternidade'
  | 'casamento'
  | 'viagens'
  | 'gratidao'
  | 'estudos'
  | 'planner'

export type TipoCantoneiras = 'nenhuma' | 'papel' | 'metal-simples' | 'metal-trabalhado'
export type TipoBordado = 'cor-unica' | 'colorido'
export type TipoEmbalagem = 'padrao' | 'presente'

export type ProposicaoCaderno =
  | 'escrita-livre'
  | 'diario'
  | 'planner'
  | 'memorias'
  | 'profissional-estudos'

// ============================================================
// ESTADO COMPLETO DO CADERNO CONFIGURADO
// ============================================================

export interface ConfiguracaoCaderno {
  // ── Seção MIOLO ──────────────────────────────────────────────

  // Q1 — Tema
  temaCaderno: TemaCaderno
  temaPersonalizado: string        // condicional: temaCaderno === 'versatil'
  padraoPaginas: PadraoPaginas     // condicional: sem-tema-2 | planner | estudos | versatil

  // Q2 — Toques afetivos
  paginaDedicatoria: boolean
  frasesAoLongo: boolean
  frasePersonalizada: string       // condicional: frasesAoLongo
  datasImportantes: boolean
  datasPersonalizadas: string      // condicional: datasImportantes
  essenciaNoParapel: boolean

  // Q3 — Orientação
  formato: FormatoCaderno

  // Q4 — Tipo de papel
  tipoPapel: TipoPapelMiolo

  // Q5 — Gramatura
  graturaPapel: GraturaPapel

  // Q6 — Tamanho
  tamanho: TamanhosCaderno
  subtamanhoPersonalizado: string   // condicional: tamanho === 'personalizado'

  // Q7 — Espessura
  espessura: EspessuraCaderno

  // Q8 — Folhas coloridas
  folhasColoridas: boolean
  corFolhasColoridas: string

  // Q9 — Guarda
  materialGuarda: MaterialGuarda
  padraoGuardaEstampado: PadraoGuardaEstampado
  corGuarda: string
  padraoGuarda: PadraoGuarda

  // Q10 — Corte
  tipoCorteEspecial: TipoCorteEspecial

  // Q11 — Cantos
  tipoCantos: TipoCantos

  // Q12 — Pintura bordas
  pinturaBordasAtiva: boolean

  // Q13 — Cor da pintura (condicional: Q12=sim)
  corPinturaBordas: string

  // ── Seção CAPA ───────────────────────────────────────────────

  // Q14 — Material
  materialCapa: MaterialCapa

  // Q15 — Cor da capa
  corCapa: string
  corCapaTecido: string            // condicional: tecido — campo de texto

  // Q16 — Querer personalização (toggle Sim/Não)
  querPersonalizacaoCapa: boolean

  // Q16b — Nome/gravação (condicional: querPersonalizacaoCapa)
  nomeGravado: string

  // Q17 — Tipo de personalização (condicional: querPersonalizacaoCapa && nomeGravado não vazio)
  gravacaoCapa: GravacaoCapa

  // Q18 — Bordado (condicional: gravacaoCapa === 'bordado')
  tipoBordado: TipoBordado
  corBordado: string

  // Campos legado (usados pelo preview)
  tipoTipografia: TipoTipografia
  posicaoGravacao: PosicaoGravacao
  estampaCapa: EstampaCapa

  // Q19 — Aplicações extras
  aplicacoesCapa: AplicacaoCapa[]

  // Q20 — Cantoneiras
  tipoCantoneiras: TipoCantoneiras

  // Q21 — Lombada
  tipoLombada: TipoLombada

  // Q22 — Costura
  tipoEncadernacao: TipoEncadernacao
  corFio: string
  tipoAbertura: TipoAbertura

  // Q23 — Elástico
  elasticoAtivo: boolean
  corElastico: string
  posicaoElastico: PosicaoElastico

  // Q24 — Marcador
  marcadorAtivo: boolean
  tipoMarcador: TipoMarcador
  corMarcador: string

  // Q25 — Largura do marcador (condicional: Q24=sim)
  larguraMarcador: LarguraMarcador

  // Q26 — Quantidade de marcadores (condicional: Q24=sim)
  quantidadeMarcadores: number

  // Q27 — Outros elementos funcionais
  bolsoInterno: boolean
  envelopeAcoplado: boolean
  envelopeContracapa: boolean
  portaCaneta: boolean
  abasOrelhas: boolean

  // Q28 — Embalagem
  tipoEmbalagem: TipoEmbalagem

  // Q29 — Padrão da embalagem
  padraoEmbalagem: string

  // Campos legado para compatibilidade com PreviewCaderno e admin
  impressoesInternas: boolean
  divisoriasInternas: boolean
  tipoLaminacao: TipoLaminacao
  tipoTextura: TipoTextura
  proposicaoCaderno: ProposicaoCaderno
  corFolhas: CorFolhas
}

// ============================================================
// DEFINIÇÕES DAS SEÇÕES (para sidebar e navegação)
// ============================================================

export interface DefinicaoEtapa {
  numero: number
  titulo: string
  descricao: string
  icone: string
}

export const ETAPAS: DefinicaoEtapa[] = [
  {
    numero: 1,
    titulo: 'Miolo',
    descricao: 'Tema, papel, acabamentos internos',
    icone: '📄',
  },
  {
    numero: 2,
    titulo: 'Capa',
    descricao: 'Material, cor, personalização e encadernação',
    icone: '📕',
  },
]

// ============================================================
// PALETAS DE CORES
// ============================================================

export const CORES_CAPA_COURO = [
  { nome: 'Preto',     hex: '#1A1A1A' },
  { nome: 'Café',      hex: '#6F4E37' },
  { nome: 'Chocolate', hex: '#3D1C02' },
  { nome: 'Castanho',  hex: '#8B4513' },
  { nome: 'Telha',     hex: '#C47A4A' },
  { nome: 'Baunilha',  hex: '#F3E5AB' },
  { nome: 'Cinza',     hex: '#808080' },
  { nome: 'Marinho',   hex: '#1B3A5C' },
  { nome: 'Vermelho',  hex: '#C0392B' },
  { nome: 'Rosa',      hex: '#E91E8C' },
  { nome: 'Laranja',   hex: '#E67E22' },
  { nome: 'Amarelo',   hex: '#F1C40F' },
  { nome: 'Turquesa',  hex: '#1ABC9C' },
]

export const CORES_CAPA_SINTETICO = [
  { nome: 'Preto',       hex: '#1A1A1A' },
  { nome: 'Bege',        hex: '#D4B896' },
  { nome: 'Off-White',   hex: '#FAF0E6' },
  { nome: 'Cinza',       hex: '#808080' },
  { nome: 'Azul Marinho',hex: '#1B3A5C' },
  { nome: 'Vermelho',    hex: '#C0392B' },
  { nome: 'Verde',       hex: '#27AE60' },
  { nome: 'Rosa',        hex: '#E91E8C' },
  { nome: 'Terracota',   hex: '#C4713C' },
]

export const CORES_CAPA_PAPEL_ESPECIAL = [
  { nome: 'Árbol Caramelo',                     hex: '#C07848', subtipo: 'arbol' },
  { nome: 'Árbol Bege',                         hex: '#D4B896', subtipo: 'arbol' },
  { nome: 'Star Coat Vinho Escovado Metalizado', hex: '#6B1A2E', subtipo: 'star' },
  { nome: 'Star Coat Vinho Escovado Fosco',     hex: '#8B2244', subtipo: 'star' },
  { nome: 'Star Coat Vinho Cromato',            hex: '#7B1C3A', subtipo: 'star' },
  { nome: 'Star Coat Vermelho Cromato',         hex: '#C0392B', subtipo: 'star' },
  { nome: 'Star Coat Verde Metalizado',         hex: '#2E8B57', subtipo: 'star' },
  { nome: 'Star Coat Preto Lama',               hex: '#2C2C2C', subtipo: 'star' },
  { nome: 'Star Coat Preto Jade',               hex: '#1A1A2E', subtipo: 'star' },
  { nome: 'Star Plus Prata Escovado',           hex: '#C0C0C0', subtipo: 'star' },
  { nome: 'Star Plus Esmeralda Escovado',       hex: '#50C878', subtipo: 'star' },
  { nome: 'VTEX Camel',                         hex: '#C19A6B', subtipo: 'vtex' },
  { nome: 'VTEX Mostarda',                      hex: '#E3A020', subtipo: 'vtex' },
  { nome: 'VTEX Chocolate',                     hex: '#3D1C02', subtipo: 'vtex' },
]

export const CORES_FIO_PADRAO = [
  { nome: 'Natural',   hex: '#E8D5B7' },
  { nome: 'Branco',    hex: '#FFFFFF' },
  { nome: 'Preto',     hex: '#1A1A1A' },
  { nome: 'Vermelho',  hex: '#C0392B' },
  { nome: 'Azul',      hex: '#2980B9' },
  { nome: 'Dourado',   hex: '#D4AF37' },
  { nome: 'Verde',     hex: '#27AE60' },
  { nome: 'Terracota', hex: '#C4713C' },
]

export const CORES_ELASTICO_PADRAO = [
  { nome: 'Preto',     hex: '#1A1A1A' },
  { nome: 'Marrom',    hex: '#6B4226' },
  { nome: 'Caramelo',  hex: '#C07848' },
  { nome: 'Vermelho',  hex: '#C0392B' },
  { nome: 'Verde',     hex: '#27AE60' },
  { nome: 'Azul',      hex: '#2980B9' },
  { nome: 'Rosa',      hex: '#E91E8C' },
  { nome: 'Dourado',   hex: '#D4AF37' },
]

export const CORES_CAPA_PADRAO = CORES_CAPA_COURO
