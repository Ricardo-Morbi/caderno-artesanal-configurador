// ============================================================
// TIPOS DE TODAS AS OPÇÕES DE PERSONALIZAÇÃO DO CADERNO
// ============================================================

// --- ETAPA 1: Tamanho e Formato ---

export type TamanhosCaderno = 'A6' | 'A5' | 'A4' | 'personalizado'

export type FormatoCaderno = 'retrato' | 'paisagem' | 'quadrado'

export type EspessuraCaderno = 'fino' | 'medio' | 'grosso' | 'extra-grosso'

// --- ETAPA 2: Capa ---

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

export type PosicaoGravacao =
  | 'centro'
  | 'terco-superior'
  | 'terco-inferior'
  | 'canto-inf-direito'

export type AplicacaoCapa =
  | 'renda'
  | 'botoes'
  | 'metais'
  | 'recortes'

// --- ETAPA 3: Encadernação ---

export type TipoEncadernacao =
  | 'copta'
  | 'japonesa'
  | 'long-stitch'
  | 'espiral'

export type TipoLombada = 'exposta' | 'protegida'

export type TipoAbertura = '180-graus' | 'tradicional'

// --- ETAPA 4: Miolo ---

export type TipoPapelMiolo =
  | 'offset'
  | 'polen'
  | 'reciclado'
  | 'vegetal'

export type GraturaPapel = '90g' | '120g' | '180g' | '240g'

export type CorFolhas = 'branca' | 'creme' | 'colorida'

export type PadraoPaginas =
  | 'liso'
  | 'pautado'
  | 'pontilhado'
  | 'quadriculado'

// --- ETAPA 5: Elementos Funcionais ---

export type TipoMarcador = 'fitilho' | 'couro' | 'cordao'

export type PosicaoElastico = 'horizontal' | 'vertical'

// --- ETAPA 6: Acabamentos ---

export type TipoCantos = 'arredondados' | 'retos'

export type TipoCorteEspecial = 'nenhum' | 'deckle-edge'

export type TipoLaminacao = 'nenhuma' | 'fosca' | 'brilho'

export type TipoTextura = 'lisa' | 'granulada' | 'macia'

// --- ETAPA 7: Extras Afetivos ---

export type ProposicaoCaderno =
  | 'escrita-livre'
  | 'diario'
  | 'planner'
  | 'memorias'
  | 'profissional-estudos'

export type TemaCaderno =
  | 'nenhum'
  | 'maternidade'
  | 'viagens'
  | 'gratidao'
  | 'estudos'

// ============================================================
// ESTADO COMPLETO DO CADERNO CONFIGURADO
// ============================================================

export interface ConfiguracaoCaderno {
  // Etapa 1 — Tamanho e Formato
  tamanho: TamanhosCaderno
  formato: FormatoCaderno
  espessura: EspessuraCaderno

  // Etapa 2 — Capa
  materialCapa: MaterialCapa
  corCapa: string           // hex color ex: "#8B4513"
  estampaCapa: EstampaCapa
  gravacaoCapa: GravacaoCapa
  nomeGravado: string       // texto livre para gravação
  posicaoGravacao: PosicaoGravacao
  aplicacoesCapa: AplicacaoCapa[]

  // Etapa 3 — Encadernação
  tipoEncadernacao: TipoEncadernacao
  tipoLombada: TipoLombada
  tipoAbertura: TipoAbertura
  corFio: string            // hex color

  // Etapa 4 — Miolo
  tipoPapel: TipoPapelMiolo
  graturaPapel: GraturaPapel
  corFolhas: CorFolhas
  padraoPaginas: PadraoPaginas
  impressoesInternas: boolean
  divisoriasInternas: boolean

  // Etapa 5 — Elementos Funcionais
  elasticoAtivo: boolean
  corElastico: string       // hex color
  posicaoElastico: PosicaoElastico
  marcadorAtivo: boolean
  tipoMarcador: TipoMarcador
  corMarcador: string       // hex color
  bolsoInterno: boolean
  envelopeAcoplado: boolean
  portaCaneta: boolean
  abasOrelhas: boolean

  // Etapa 6 — Acabamentos
  tipoCantos: TipoCantos
  pinturaBordasAtiva: boolean
  corPinturaBordas: string  // hex color
  tipoCorteEspecial: TipoCorteEspecial
  tipoLaminacao: TipoLaminacao
  tipoTextura: TipoTextura

  // Etapa 7 — Extras Afetivos
  paginaDedicatoria: boolean
  frasesAoLongo: boolean
  datasImportantes: boolean
  temaCaderno: TemaCaderno
  essenciaNoParapel: boolean
  proposicaoCaderno: ProposicaoCaderno
}

// ============================================================
// DEFINIÇÕES DAS ETAPAS (para a sidebar e navegação)
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
    titulo: 'Tamanho e Formato',
    descricao: 'Tamanho, orientação e espessura do caderno',
    icone: '📐',
  },
  {
    numero: 2,
    titulo: 'Capa',
    descricao: 'Material, cor, estampa e personalização',
    icone: '📕',
  },
  {
    numero: 3,
    titulo: 'Encadernação',
    descricao: 'Costura, lombada e tipo de abertura',
    icone: '🪡',
  },
  {
    numero: 4,
    titulo: 'Miolo',
    descricao: 'Papel, gramatura e padrão das páginas',
    icone: '📄',
  },
  {
    numero: 5,
    titulo: 'Elementos Funcionais',
    descricao: 'Elástico, marcador, bolso e porta-caneta',
    icone: '🔖',
  },
  {
    numero: 6,
    titulo: 'Acabamentos',
    descricao: 'Cantos, bordas, laminação e textura',
    icone: '✨',
  },
  {
    numero: 7,
    titulo: 'Extras Afetivos',
    descricao: 'Dedicatória, frases, tema e propósito',
    icone: '💛',
  },
]

// ============================================================
// OPÇÕES DISPONÍVEIS PARA CADA CAMPO (para renderizar os cards)
// ============================================================

export const CORES_CAPA_PADRAO = [
  { nome: 'Marrom Couro', hex: '#6B4226' },
  { nome: 'Caramelo', hex: '#C07848' },
  { nome: 'Preto', hex: '#1A1A1A' },
  { nome: 'Bordô', hex: '#722F37' },
  { nome: 'Verde Musgo', hex: '#4A6B42' },
  { nome: 'Azul Marinho', hex: '#1B3A5C' },
  { nome: 'Terracota', hex: '#C4713C' },
  { nome: 'Creme', hex: '#E8D5B7' },
  { nome: 'Rosa Antigo', hex: '#C4A0A0' },
  { nome: 'Cinza Pedra', hex: '#6B7280' },
  { nome: 'Amarelo Ocre', hex: '#C8982A' },
  { nome: 'Branco Perola', hex: '#F5F0E8' },
]

export const CORES_FIO_PADRAO = [
  { nome: 'Natural', hex: '#E8D5B7' },
  { nome: 'Branco', hex: '#FFFFFF' },
  { nome: 'Preto', hex: '#1A1A1A' },
  { nome: 'Vermelho', hex: '#C0392B' },
  { nome: 'Azul', hex: '#2980B9' },
  { nome: 'Dourado', hex: '#D4AF37' },
  { nome: 'Verde', hex: '#27AE60' },
  { nome: 'Terracota', hex: '#C4713C' },
]

export const CORES_ELASTICO_PADRAO = [
  { nome: 'Preto', hex: '#1A1A1A' },
  { nome: 'Marrom', hex: '#6B4226' },
  { nome: 'Caramelo', hex: '#C07848' },
  { nome: 'Vermelho', hex: '#C0392B' },
  { nome: 'Verde', hex: '#27AE60' },
  { nome: 'Azul', hex: '#2980B9' },
  { nome: 'Rosa', hex: '#E91E8C' },
  { nome: 'Dourado', hex: '#D4AF37' },
]
