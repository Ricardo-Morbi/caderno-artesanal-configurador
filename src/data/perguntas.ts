import type { ConfiguracaoCaderno } from '@/types/caderno'
import { CORES_CAPA_PADRAO, CORES_FIO_PADRAO, CORES_ELASTICO_PADRAO } from '@/types/caderno'

// ============================================================
// TIPOS
// ============================================================

export type TipoPergunta =
  | 'selecao-grade'     // grid 2x2 de cards
  | 'selecao-lista'     // lista vertical de cards
  | 'cor'               // paleta de círculos coloridos
  | 'toggle'            // sim / não
  | 'multipla-escolha'  // vários checkboxes
  | 'texto'             // campo de texto livre

export interface OpcaoPergunta {
  valor: string
  label: string
  descricao?: string
  hex?: string          // para opções de cor
  altura?: number       // para a espessura visual
}

export interface Pergunta {
  id: string
  grupo: number                                   // 1-7 qual categoria pertence
  titulo: string
  descricao?: string
  tipo: TipoPergunta
  campo: keyof ConfiguracaoCaderno
  opcoes?: OpcaoPergunta[]
  visivel?: (config: ConfiguracaoCaderno) => boolean
  avancaAutomatico?: boolean                      // avança ao selecionar sem precisar clicar em próximo
}

// ============================================================
// LISTA COMPLETA DE PERGUNTAS
// ============================================================

export const TODAS_PERGUNTAS: Pergunta[] = [

  // ─── GRUPO 1: Tamanho e Formato ───────────────────────────

  {
    id: 'tamanho',
    grupo: 1,
    titulo: 'Qual o tamanho do caderno?',
    descricao: 'Define o espaço que você terá para escrever',
    tipo: 'selecao-grade',
    campo: 'tamanho',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'A6', label: 'A6', descricao: 'De bolso · 10,5 × 14,8 cm' },
      { valor: 'A5', label: 'A5', descricao: 'Popular · 14,8 × 21 cm' },
      { valor: 'A4', label: 'A4', descricao: 'Folha cheia · 21 × 29,7 cm' },
      { valor: 'personalizado', label: 'Sob medida', descricao: 'Combinamos juntos' },
    ],
  },

  {
    id: 'formato',
    grupo: 1,
    titulo: 'Qual a orientação?',
    descricao: 'Como o caderno vai ficar na sua mão',
    tipo: 'selecao-grade',
    campo: 'formato',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'retrato',   label: 'Retrato',   descricao: 'Vertical — o mais comum' },
      { valor: 'paisagem',  label: 'Paisagem',  descricao: 'Horizontal — ideal para sketches' },
      { valor: 'quadrado',  label: 'Quadrado',  descricao: 'Igual largura e altura' },
    ],
  },

  {
    id: 'espessura',
    grupo: 1,
    titulo: 'Qual a espessura?',
    descricao: 'Quantidade de folhas no caderno',
    tipo: 'selecao-lista',
    campo: 'espessura',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'fino',         label: 'Fino',         descricao: '~40 folhas · Leve, discreto',           altura: 14 },
      { valor: 'medio',        label: 'Médio',         descricao: '~80 folhas · O mais equilibrado',       altura: 22 },
      { valor: 'grosso',       label: 'Grosso',        descricao: '~120 folhas · Dura mais tempo',         altura: 32 },
      { valor: 'extra-grosso', label: 'Extra grosso',  descricao: '~160 folhas · Para quem escreve muito', altura: 44 },
    ],
  },

  // ─── GRUPO 2: Capa ────────────────────────────────────────

  {
    id: 'materialCapa',
    grupo: 2,
    titulo: 'Qual o material da capa?',
    descricao: 'O toque e a aparência do caderno',
    tipo: 'selecao-grade',
    campo: 'materialCapa',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'couro',         label: 'Couro',          descricao: 'Natural · Durável · Envelhece bem' },
      { valor: 'sintetico',     label: 'Sintético',      descricao: 'Vegano · Resistente · Moderno' },
      { valor: 'tecido',        label: 'Tecido',         descricao: 'Suave · Colorido · Delicado' },
      { valor: 'papel-especial',label: 'Papel especial', descricao: 'Elegante · Leve · Texturizado' },
      { valor: 'kraft',         label: 'Kraft',          descricao: 'Rústico · Natural · Artesanal' },
      { valor: 'linho',         label: 'Linho',          descricao: 'Chic · Texturizado · Refinado' },
    ],
  },

  {
    id: 'corCapa',
    grupo: 2,
    titulo: 'Qual a cor da capa?',
    descricao: 'Escolha ou personalize a cor exata',
    tipo: 'cor',
    campo: 'corCapa',
    opcoes: CORES_CAPA_PADRAO.map((c) => ({ valor: c.hex, label: c.nome, hex: c.hex })),
  },

  {
    id: 'estampaCapa',
    grupo: 2,
    titulo: 'Quer alguma estampa?',
    descricao: 'Padrão visual sobre a cor da capa',
    tipo: 'selecao-lista',
    campo: 'estampaCapa',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'nenhuma',      label: 'Sem estampa',   descricao: 'Capa lisa e limpa' },
      { valor: 'floral',       label: 'Floral',         descricao: 'Flores e folhagens delicadas' },
      { valor: 'minimalista',  label: 'Minimalista',    descricao: 'Linhas e formas geométricas' },
      { valor: 'abstrata',     label: 'Abstrata',       descricao: 'Arte livre e expressiva' },
      { valor: 'tematica',     label: 'Temática',       descricao: 'Combinamos um tema especial' },
    ],
  },

  {
    id: 'gravacaoCapa',
    grupo: 2,
    titulo: 'Quer personalização gravada?',
    descricao: 'Nome, iniciais ou frase na capa',
    tipo: 'selecao-lista',
    campo: 'gravacaoCapa',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'nenhuma',      label: 'Sem gravação',  descricao: 'Capa sem texto' },
      { valor: 'baixo-relevo', label: 'Baixo relevo',  descricao: 'Sutil e elegante — afundado na capa' },
      { valor: 'alto-relevo',  label: 'Alto relevo',   descricao: 'Marcante — elevado na capa' },
      { valor: 'bordado',      label: 'Bordado',        descricao: 'Feito à mão com fio — o mais artesanal' },
    ],
  },

  {
    id: 'nomeGravado',
    grupo: 2,
    titulo: 'O que você quer gravar?',
    descricao: 'Nome, iniciais, data ou frase (máx. 40 caracteres)',
    tipo: 'texto',
    campo: 'nomeGravado',
    visivel: (c) => c.gravacaoCapa !== 'nenhuma',
  },

  {
    id: 'aplicacoesCapa',
    grupo: 2,
    titulo: 'Quer aplicações extras na capa?',
    descricao: 'Elementos decorativos adicionais (opcional)',
    tipo: 'multipla-escolha',
    campo: 'aplicacoesCapa',
    opcoes: [
      { valor: 'renda',    label: 'Renda',    descricao: 'Detalhe em renda delicada' },
      { valor: 'botoes',   label: 'Botões',   descricao: 'Botões decorativos' },
      { valor: 'metais',   label: 'Metais',   descricao: 'Cantoneiras ou apliques metálicos' },
      { valor: 'recortes', label: 'Recortes', descricao: 'Vazados na capa' },
    ],
  },

  // ─── GRUPO 3: Encadernação ────────────────────────────────

  {
    id: 'tipoEncadernacao',
    grupo: 3,
    titulo: 'Qual tipo de costura?',
    descricao: 'Define como as páginas são presas',
    tipo: 'selecao-lista',
    campo: 'tipoEncadernacao',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'copta',       label: 'Copta',       descricao: 'Costura tradicional — muito resistente e durável' },
      { valor: 'japonesa',    label: 'Japonesa',    descricao: 'Costura pela lateral — delicada e elegante' },
      { valor: 'long-stitch', label: 'Long Stitch', descricao: 'Costura longa aparente — visual artístico' },
      { valor: 'espiral',     label: 'Espiral',     descricao: 'Abre 360° — ideal para planners e esboços' },
    ],
  },

  {
    id: 'tipoLombada',
    grupo: 3,
    titulo: 'Como quer a lombada?',
    descricao: 'A lateral onde as páginas são costuradas',
    tipo: 'selecao-grade',
    campo: 'tipoLombada',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'exposta',    label: 'Exposta',    descricao: 'Costura visível — visual artesanal autêntico' },
      { valor: 'protegida',  label: 'Protegida',  descricao: 'Capa cobre a costura — mais clean' },
    ],
  },

  {
    id: 'tipoAbertura',
    grupo: 3,
    titulo: 'Como o caderno vai abrir?',
    descricao: 'Tipo de abertura das páginas',
    tipo: 'selecao-grade',
    campo: 'tipoAbertura',
    avancaAutomatico: true,
    opcoes: [
      { valor: '180-graus',   label: 'Abertura 180°', descricao: 'Abre completamente plano — escrever fica fácil' },
      { valor: 'tradicional', label: 'Tradicional',   descricao: 'Abertura padrão — mais compacto' },
    ],
  },

  {
    id: 'corFio',
    grupo: 3,
    titulo: 'Qual a cor do fio?',
    descricao: 'Cor da linha de costura visível na lombada',
    tipo: 'cor',
    campo: 'corFio',
    opcoes: CORES_FIO_PADRAO.map((c) => ({ valor: c.hex, label: c.nome, hex: c.hex })),
  },

  // ─── GRUPO 4: Miolo ───────────────────────────────────────

  {
    id: 'tipoPapel',
    grupo: 4,
    titulo: 'Qual o tipo de papel?',
    descricao: 'O papel interno do caderno',
    tipo: 'selecao-grade',
    campo: 'tipoPapel',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'offset',    label: 'Offset',    descricao: 'Branco · O mais comum · Versátil' },
      { valor: 'polen',     label: 'Pólen',     descricao: 'Creme · Confortável para leitura longa' },
      { valor: 'reciclado', label: 'Reciclado', descricao: 'Ecológico · Texturizado · Sustentável' },
      { valor: 'vegetal',   label: 'Vegetal',   descricao: 'Translúcido · Especial · Único' },
    ],
  },

  {
    id: 'graturaPapel',
    grupo: 4,
    titulo: 'Qual a gramatura do papel?',
    descricao: 'Peso e espessura de cada folha',
    tipo: 'selecao-grade',
    campo: 'graturaPapel',
    avancaAutomatico: true,
    opcoes: [
      { valor: '90g',  label: '90 g',  descricao: 'Leve e econômico' },
      { valor: '120g', label: '120 g', descricao: 'Equilibrado — o mais popular' },
      { valor: '180g', label: '180 g', descricao: 'Resistente à caneta e marcador' },
      { valor: '240g', label: '240 g', descricao: 'Premium — ideal para aquarela' },
    ],
  },

  {
    id: 'corFolhas',
    grupo: 4,
    titulo: 'Qual a cor das folhas?',
    descricao: 'Tom do papel interno',
    tipo: 'selecao-grade',
    campo: 'corFolhas',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'branca',   label: 'Branca',   descricao: 'Clássica · Contraste forte',            hex: '#FAFAF8' },
      { valor: 'creme',    label: 'Creme',    descricao: 'Aconchegante · Cansa menos os olhos',   hex: '#F5F0E0' },
      { valor: 'colorida', label: 'Colorida', descricao: 'Cor especial · Combinamos juntos',       hex: '#E8F0D8' },
    ],
  },

  {
    id: 'padraoPaginas',
    grupo: 4,
    titulo: 'Qual o padrão das páginas?',
    descricao: 'Layout impresso nas folhas',
    tipo: 'selecao-grade',
    campo: 'padraoPaginas',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'liso',          label: 'Liso',          descricao: 'Em branco — para desenho e escrita livre' },
      { valor: 'pautado',       label: 'Pautado',       descricao: 'Linhas horizontais — escrita organizada' },
      { valor: 'pontilhado',    label: 'Pontilhado',    descricao: 'Grid discreto — versátil e moderno' },
      { valor: 'quadriculado',  label: 'Quadriculado',  descricao: 'Grade completa — projetos e técnico' },
    ],
  },

  // ─── GRUPO 5: Elementos Funcionais ───────────────────────

  {
    id: 'elasticoAtivo',
    grupo: 5,
    titulo: 'Quer elástico de fechamento?',
    descricao: 'Mantém o caderno fechado e protegido',
    tipo: 'toggle',
    campo: 'elasticoAtivo',
    avancaAutomatico: true,
  },

  {
    id: 'posicaoElastico',
    grupo: 5,
    titulo: 'Como o elástico vai ficar?',
    descricao: 'Posição do elástico na capa',
    tipo: 'selecao-grade',
    campo: 'posicaoElastico',
    avancaAutomatico: true,
    visivel: (c) => c.elasticoAtivo,
    opcoes: [
      { valor: 'vertical',   label: 'Vertical',   descricao: 'Elástico na lateral — mais comum' },
      { valor: 'horizontal', label: 'Horizontal', descricao: 'Elástico na parte de baixo' },
    ],
  },

  {
    id: 'corElastico',
    grupo: 5,
    titulo: 'Qual a cor do elástico?',
    tipo: 'cor',
    campo: 'corElastico',
    visivel: (c) => c.elasticoAtivo,
    opcoes: CORES_ELASTICO_PADRAO.map((c) => ({ valor: c.hex, label: c.nome, hex: c.hex })),
  },

  {
    id: 'marcadorAtivo',
    grupo: 5,
    titulo: 'Quer marcador de páginas?',
    descricao: 'Fitilho, couro ou cordão saindo do caderno',
    tipo: 'toggle',
    campo: 'marcadorAtivo',
    avancaAutomatico: true,
  },

  {
    id: 'tipoMarcador',
    grupo: 5,
    titulo: 'Qual tipo de marcador?',
    tipo: 'selecao-grade',
    campo: 'tipoMarcador',
    avancaAutomatico: true,
    visivel: (c) => c.marcadorAtivo,
    opcoes: [
      { valor: 'fitilho', label: 'Fitilho', descricao: 'Fita de cetim ou seda' },
      { valor: 'couro',   label: 'Couro',   descricao: 'Tira de couro artesanal' },
      { valor: 'cordao',  label: 'Cordão',  descricao: 'Cordão decorativo trançado' },
    ],
  },

  {
    id: 'corMarcador',
    grupo: 5,
    titulo: 'Qual a cor do marcador?',
    tipo: 'cor',
    campo: 'corMarcador',
    visivel: (c) => c.marcadorAtivo,
    opcoes: [
      { valor: '#C4713C', label: 'Terracota',  hex: '#C4713C' },
      { valor: '#C0392B', label: 'Vermelho',   hex: '#C0392B' },
      { valor: '#D4AF37', label: 'Dourado',    hex: '#D4AF37' },
      { valor: '#27AE60', label: 'Verde',      hex: '#27AE60' },
      { valor: '#2980B9', label: 'Azul',       hex: '#2980B9' },
      { valor: '#E91E8C', label: 'Rosa',       hex: '#E91E8C' },
      { valor: '#1A1A1A', label: 'Preto',      hex: '#1A1A1A' },
      { valor: '#F5F5F5', label: 'Branco',     hex: '#F5F5F5' },
    ],
  },

  {
    id: 'extras-elementos',
    grupo: 5,
    titulo: 'Outros elementos funcionais?',
    descricao: 'Itens extras no caderno (opcional)',
    tipo: 'multipla-escolha',
    campo: 'bolsoInterno', // campo fictício — tratado especialmente no componente
    opcoes: [
      { valor: 'bolsoInterno',      label: 'Bolso interno',      descricao: 'Para guardar papeis e cartões' },
      { valor: 'envelopeAcoplado',  label: 'Envelope acoplado',  descricao: 'Envelope na contracapa' },
      { valor: 'portaCaneta',       label: 'Porta-caneta',       descricao: 'Tira para guardar a caneta' },
      { valor: 'abasOrelhas',       label: 'Abas / orelhas',     descricao: 'Dobra protetora nas bordas' },
    ],
  },

  // ─── GRUPO 6: Acabamentos ─────────────────────────────────

  {
    id: 'tipoCantos',
    grupo: 6,
    titulo: 'Como ficam os cantos?',
    tipo: 'selecao-grade',
    campo: 'tipoCantos',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'arredondados', label: 'Arredondados', descricao: 'Cantos curvos e suaves' },
      { valor: 'retos',        label: 'Retos',         descricao: 'Cantos em 90° — clássico' },
    ],
  },

  {
    id: 'pinturaBordasAtiva',
    grupo: 6,
    titulo: 'Quer pintura nas bordas das páginas?',
    descricao: 'Cor nos cortes laterais das folhas — efeito incrível ao abrir',
    tipo: 'toggle',
    campo: 'pinturaBordasAtiva',
    avancaAutomatico: true,
  },

  {
    id: 'corPinturaBordas',
    grupo: 6,
    titulo: 'Qual a cor da pintura?',
    tipo: 'cor',
    campo: 'corPinturaBordas',
    visivel: (c) => c.pinturaBordasAtiva,
    opcoes: [
      { valor: '#D4AF37', label: 'Dourado',   hex: '#D4AF37' },
      { valor: '#B8B8B8', label: 'Prata',     hex: '#B8B8B8' },
      { valor: '#C4713C', label: 'Terracota', hex: '#C4713C' },
      { valor: '#C0392B', label: 'Vermelho',  hex: '#C0392B' },
      { valor: '#2980B9', label: 'Azul',      hex: '#2980B9' },
      { valor: '#27AE60', label: 'Verde',     hex: '#27AE60' },
      { valor: '#1A1A1A', label: 'Preto',     hex: '#1A1A1A' },
      { valor: '#E91E8C', label: 'Rosa',      hex: '#E91E8C' },
    ],
  },

  {
    id: 'tipoCorteEspecial',
    grupo: 6,
    titulo: 'Quer corte especial nas páginas?',
    descricao: 'Tipo de acabamento das bordas do papel',
    tipo: 'selecao-grade',
    campo: 'tipoCorteEspecial',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'nenhum',      label: 'Corte reto',   descricao: 'Bordas uniformes e precisas' },
      { valor: 'deckle-edge', label: 'Deckle Edge',  descricao: 'Bordas irregulares artesanais — especial' },
    ],
  },

  {
    id: 'tipoLaminacao',
    grupo: 6,
    titulo: 'Qual a laminação da capa?',
    tipo: 'selecao-lista',
    campo: 'tipoLaminacao',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'nenhuma', label: 'Sem laminação',    descricao: 'Toque natural do material' },
      { valor: 'fosca',   label: 'Laminação fosca',  descricao: 'Aveludado · Elegante · Premium' },
      { valor: 'brilho',  label: 'Laminação brilho', descricao: 'Vibrante · Moderno · Impactante' },
    ],
  },

  {
    id: 'tipoTextura',
    grupo: 6,
    titulo: 'Qual a textura ao toque?',
    tipo: 'selecao-lista',
    campo: 'tipoTextura',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'lisa',      label: 'Lisa',      descricao: 'Superfície suave e uniforme' },
      { valor: 'granulada', label: 'Granulada', descricao: 'Textura sutil sob os dedos' },
      { valor: 'macia',     label: 'Macia',     descricao: 'Soft touch · Luxuoso · Aveludado' },
    ],
  },

  // ─── GRUPO 7: Extras Afetivos ─────────────────────────────

  {
    id: 'proposicaoCaderno',
    grupo: 7,
    titulo: 'Qual o propósito do caderno?',
    descricao: 'Para que ele vai servir no dia a dia',
    tipo: 'selecao-lista',
    campo: 'proposicaoCaderno',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'escrita-livre',        label: 'Escrita livre',          descricao: 'Para escrever o que vier à mente' },
      { valor: 'diario',               label: 'Diário pessoal',         descricao: 'Registros do dia a dia' },
      { valor: 'planner',              label: 'Planner',                descricao: 'Organização e produtividade' },
      { valor: 'memorias',             label: 'Livro de memórias',      descricao: 'Fotos, colagens e lembranças' },
      { valor: 'profissional-estudos', label: 'Profissional / Estudos', descricao: 'Trabalho e aprendizado' },
    ],
  },

  {
    id: 'temaCaderno',
    grupo: 7,
    titulo: 'Quer um tema especial?',
    descricao: 'Customizamos elementos internos para o tema escolhido',
    tipo: 'selecao-grade',
    campo: 'temaCaderno',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'nenhum',      label: 'Sem tema',    descricao: 'Caderno versátil' },
      { valor: 'maternidade', label: 'Maternidade', descricao: 'Para mamães e bebês' },
      { valor: 'viagens',     label: 'Viagens',     descricao: 'Para registrar aventuras' },
      { valor: 'gratidao',    label: 'Gratidão',    descricao: 'Diário de gratidão' },
      { valor: 'estudos',     label: 'Estudos',     descricao: 'Otimizado para aprender' },
    ],
  },

  {
    id: 'extras-afetivos',
    grupo: 7,
    titulo: 'Quer toques afetivos?',
    descricao: 'Elementos especiais que tornam o caderno único',
    tipo: 'multipla-escolha',
    campo: 'paginaDedicatoria', // campo fictício — tratado especialmente no componente
    opcoes: [
      { valor: 'paginaDedicatoria',  label: 'Página de dedicatória', descricao: 'Espaço para mensagem especial no início' },
      { valor: 'frasesAoLongo',      label: 'Frases ao longo',       descricao: 'Citações inspiradoras pelas páginas' },
      { valor: 'datasImportantes',   label: 'Datas marcadas',        descricao: 'Aniversários e eventos especiais' },
      { valor: 'essenciaNoParapel',  label: 'Essência no papel',     descricao: 'Aroma sutil e especial nas páginas' },
    ],
  },
]

// ─── Utilitários ─────────────────────────────────────────────

export function getPerguntasVisiveis(config: ConfiguracaoCaderno): Pergunta[] {
  return TODAS_PERGUNTAS.filter((p) => !p.visivel || p.visivel(config))
}

export const GRUPOS = [
  { numero: 1, titulo: 'Tamanho',      iconeKey: 'tamanho' },
  { numero: 2, titulo: 'Capa',         iconeKey: 'capa' },
  { numero: 3, titulo: 'Encadernação', iconeKey: 'costura' },
  { numero: 4, titulo: 'Miolo',        iconeKey: 'papel' },
  { numero: 5, titulo: 'Funcionais',   iconeKey: 'elastico' },
  { numero: 6, titulo: 'Acabamentos',  iconeKey: 'cantos' },
  { numero: 7, titulo: 'Extras',       iconeKey: 'coracao' },
]
