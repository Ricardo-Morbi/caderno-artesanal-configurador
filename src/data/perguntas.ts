import type { ConfiguracaoCaderno } from '@/types/caderno'
import {
  CORES_CAPA_COURO,
  CORES_CAPA_SINTETICO,
  CORES_CAPA_PAPEL_ESPECIAL,
  CORES_FIO_PADRAO,
  CORES_ELASTICO_PADRAO,
} from '@/types/caderno'

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
  grupo: number                                   // 1-2 qual categoria pertence
  titulo: string
  descricao?: string
  tipo: TipoPergunta
  campo: keyof ConfiguracaoCaderno
  opcoes?: OpcaoPergunta[]
  visivel?: (config: ConfiguracaoCaderno) => boolean
  avancaAutomatico?: boolean                      // avança ao selecionar sem precisar clicar em próximo
  placeholder?: string                            // placeholder personalizado para campos texto
  maxLength?: number                              // limite de caracteres para campos texto
}

// ============================================================
// LISTA COMPLETA DE PERGUNTAS
// ============================================================

export const TODAS_PERGUNTAS: Pergunta[] = [

  // ─── GRUPO 1: MIOLO ───────────────────────────────────────

  {
    id: 'temaCaderno',
    grupo: 1,
    titulo: 'Você quer um tema especial para seu caderno/livro?',
    descricao: 'Customizamos elementos internos para o tema escolhido',
    tipo: 'selecao-lista',
    campo: 'temaCaderno',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'sem-tema-1',  label: 'Sem tema — Folhas lisas',                  descricao: 'Sem impressão alguma · Folhas em branco' },
      { valor: 'sem-tema-2',  label: 'Sem tema — Com pauta/pontilhado/quadriculado', descricao: 'Impressão P&B · Escolha o padrão a seguir' },
      { valor: 'versatil',    label: 'Caderno Versátil',                          descricao: 'Tema personalizado a sua escolha · Especifique a seguir' },
      { valor: 'maternidade', label: 'Maternidade',                               descricao: 'Para mamães e bebês · Impressão padrão DMO' },
      { valor: 'casamento',   label: 'Casamento',                                 descricao: 'Diário da noiva · Impressão padrão DMO' },
      { valor: 'viagens',     label: 'Viagens',                                   descricao: 'Para registrar aventuras · Impressão padrão DMO' },
      { valor: 'gratidao',    label: 'Gratidão',                                  descricao: 'Diário de gratidão · Impressão padrão DMO' },
      { valor: 'estudos',     label: 'Estudos / Trabalho',                        descricao: 'Otimizado para aprender e trabalhar' },
      { valor: 'planner',     label: 'Planner',                                   descricao: 'Organização pessoal e profissional' },
    ],
  },

  {
    id: 'temaPersonalizado',
    grupo: 1,
    titulo: 'Qual tema você deseja?',
    descricao: 'Escreva aqui qual tema deseja',
    tipo: 'texto',
    campo: 'temaPersonalizado',
    placeholder: 'Ex: girassóis, pássaros, oceano, cosmos...',
    maxLength: 80,
    visivel: (c) => c.temaCaderno === 'versatil',
  },

  {
    id: 'padraoPaginas',
    grupo: 1,
    titulo: 'Qual o padrão de impressão do miolo?',
    descricao: 'Escolha o padrão das páginas internas',
    tipo: 'selecao-grade',
    campo: 'padraoPaginas',
    avancaAutomatico: true,
    visivel: (c) => ['sem-tema-2', 'estudos', 'versatil'].includes(c.temaCaderno),
    opcoes: [
      { valor: 'pautado',      label: 'Pautado',      descricao: 'Linhas horizontais — escrita organizada' },
      { valor: 'pontilhado',   label: 'Pontilhado',   descricao: 'Grid discreto — versátil e moderno' },
      { valor: 'quadriculado', label: 'Quadriculado', descricao: 'Grade completa — projetos e técnico' },
    ],
  },

  {
    id: 'extras-afetivos',
    grupo: 1,
    titulo: 'Deseja que seu caderno/livro traga toques afetivos?',
    descricao: 'Elementos especiais que tornam o caderno único — R$15,00 cada',
    tipo: 'multipla-escolha',
    campo: 'paginaDedicatoria',
    opcoes: [
      { valor: 'paginaDedicatoria', label: 'Página de dedicatória', descricao: 'Espaço para mensagem especial no início' },
      { valor: 'frasesAoLongo',     label: 'Frases ao longo',       descricao: 'Citações inspiradoras na frente de cada página' },
      { valor: 'datasImportantes',  label: 'Datas marcadas',        descricao: 'Aniversários e eventos especiais' },
      { valor: 'essenciaNoParapel', label: 'Essência no papel',     descricao: 'Aroma sutil e especial nas páginas' },
    ],
  },

  {
    id: 'frasePersonalizada',
    grupo: 1,
    titulo: 'Qual frase ou citação você deseja?',
    descricao: 'Escreva aqui qual frase ou citação deseja ao longo das páginas',
    tipo: 'texto',
    campo: 'frasePersonalizada',
    placeholder: 'Ex: A vida é bela · Viver plena e livremente · Carpe diem...',
    maxLength: 120,
    visivel: (c) => c.frasesAoLongo,
  },

  {
    id: 'datasPersonalizadas',
    grupo: 1,
    titulo: 'Quais datas deseja acrescentar?',
    descricao: 'Escreva as datas de aniversários e eventos especiais',
    tipo: 'texto',
    campo: 'datasPersonalizadas',
    placeholder: 'Ex: 15/03 – Aniversário da mãe · 22/07 – Casamento · 10/12 – Formatura...',
    maxLength: 200,
    visivel: (c) => c.datasImportantes,
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
      { valor: 'retrato',  label: 'Retrato',  descricao: 'Vertical — o mais comum' },
      { valor: 'paisagem', label: 'Paisagem', descricao: 'Horizontal — ideal para sketches' },
      { valor: 'quadrado', label: 'Quadrado', descricao: 'Igual na largura e na altura' },
    ],
  },

  {
    id: 'tipoPapel',
    grupo: 1,
    titulo: 'Qual o tipo de papel?',
    descricao: 'O papel interno do caderno',
    tipo: 'selecao-grade',
    campo: 'tipoPapel',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'offset',    label: 'Offset',      descricao: 'Branco · O mais comum · Versátil' },
      { valor: 'polen',     label: 'Pólen Bold',  descricao: 'Creme · Confortável para escrita e leitura longa' },
      { valor: 'reciclado', label: 'Reciclado',   descricao: 'Ecológico · Texturizado · Sustentável' },
    ],
  },

  {
    id: 'graturaPapel',
    grupo: 1,
    titulo: 'Qual a gramatura do papel?',
    descricao: 'Peso e espessura de cada folha',
    tipo: 'selecao-grade',
    campo: 'graturaPapel',
    avancaAutomatico: true,
    visivel: (c) => c.tipoPapel === 'offset',
    opcoes: [
      { valor: '90g',  label: '90 g',  descricao: 'Leve e econômico' },
      { valor: '120g', label: '120 g', descricao: 'Equilibrado — o mais popular' },
      { valor: '180g', label: '180 g', descricao: 'Resistente à caneta e marcador' },
    ],
  },

  {
    id: 'tamanho',
    grupo: 1,
    titulo: 'Qual o tamanho do seu caderno/livro?',
    descricao: 'Define o espaço que você terá para escrever',
    tipo: 'selecao-grade',
    campo: 'tamanho',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'A6',          label: 'A6',        descricao: 'De bolso · 10,5 × 14,8 cm' },
      { valor: 'A5',          label: 'A5',        descricao: 'Popular · 14,8 × 21 cm' },
      { valor: 'A4',          label: 'A4',        descricao: 'Folha cheia · 21 × 29,7 cm' },
      { valor: 'personalizado',label: 'Sob medida', descricao: 'Tamanho personalizado · Combinamos juntos' },
    ],
  },

  {
    id: 'subtamanhoPersonalizado',
    grupo: 1,
    titulo: 'Qual o formato sob medida?',
    descricao: 'Escolha a proporção do seu caderno personalizado',
    tipo: 'selecao-grade',
    campo: 'subtamanhoPersonalizado',
    avancaAutomatico: true,
    visivel: (c) => c.tamanho === 'personalizado',
    opcoes: [
      { valor: 'quadrado-15x15', label: 'Quadrado', descricao: '15 × 15 cm — proporção perfeita' },
      { valor: 'longer-10x25',   label: 'Longer',   descricao: '10 × 25 cm — estreito e alto' },
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
      { valor: 'fino',   label: 'Fino',   descricao: '~40 folhas · Leve, discreto',        altura: 14 },
      { valor: 'medio',  label: 'Médio',  descricao: '~80 folhas · O mais equilibrado',    altura: 22 },
      { valor: 'grosso', label: 'Grosso', descricao: '~120 folhas · Dura mais tempo',      altura: 32 },
    ],
  },

  {
    id: 'folhasColoridas',
    grupo: 1,
    titulo: 'Deseja folhas coloridas intercaladas?',
    descricao: 'De 5 a 10 folhas coloridas — R$0,50 por folha',
    tipo: 'toggle',
    campo: 'folhasColoridas',
    avancaAutomatico: true,
  },

  {
    id: 'corFolhasColoridas',
    grupo: 1,
    titulo: 'Qual a cor das folhas intercaladas?',
    descricao: 'Serão acrescentadas de 5 a 10 folhas conforme a espessura escolhida',
    tipo: 'selecao-grade',
    campo: 'corFolhasColoridas',
    avancaAutomatico: true,
    visivel: (c) => c.folhasColoridas,
    opcoes: [
      { valor: '#F5F0E0', label: 'Creme',       hex: '#F5F0E0' },
      { valor: '#1A1A1A', label: 'Preto',        hex: '#1A1A1A' },
      { valor: '#6B4226', label: 'Marrom',        hex: '#6B4226' },
      { valor: '#1B3A5C', label: 'Azul Marinho',  hex: '#1B3A5C' },
      { valor: '#87CEEB', label: 'Azul Claro',    hex: '#87CEEB' },
      { valor: '#C0392B', label: 'Vermelho',      hex: '#C0392B' },
      { valor: '#FF1493', label: 'Rosa Pink',     hex: '#FF1493' },
      { valor: '#FFB6C1', label: 'Rosa Claro',    hex: '#FFB6C1' },
      { valor: '#FFD700', label: 'Amarelo',       hex: '#FFD700' },
      { valor: '#FF8C00', label: 'Laranja',       hex: '#FF8C00' },
    ],
  },

  {
    id: 'materialGuarda',
    grupo: 1,
    titulo: 'Qual o material da guarda?',
    descricao: 'A folha decorativa no início e fim do caderno — R$7,00',
    tipo: 'selecao-grade',
    campo: 'materialGuarda',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'branca',      label: 'Branca',      descricao: 'Clássica · Neutra · Elegante' },
      { valor: 'colorida',    label: 'Colorida',    descricao: 'Cor sólida personalizada' },
      { valor: 'marmorizada', label: 'Marmorizada', descricao: 'Efeito mármore · Sofisticado' },
      { valor: 'kraft',       label: 'Kraft',       descricao: 'Rústica · Natural · Artesanal' },
      { valor: 'estampada',   label: 'Estampada',   descricao: 'Com padrão estampado' },
    ],
  },

  {
    id: 'corGuarda',
    grupo: 1,
    titulo: 'Qual a cor da guarda?',
    descricao: 'Escolha a cor sólida das folhas de guarda',
    tipo: 'cor',
    campo: 'corGuarda',
    visivel: (c) => c.materialGuarda === 'colorida',
    opcoes: [
      { valor: '#FAF0E6', label: 'Off-White',    hex: '#FAF0E6' },
      { valor: '#F5F0E0', label: 'Creme',        hex: '#F5F0E0' },
      { valor: '#FFB6C1', label: 'Rosa claro',   hex: '#FFB6C1' },
      { valor: '#FF69B4', label: 'Rosa pink',    hex: '#FF69B4' },
      { valor: '#E6E6FA', label: 'Lavanda',      hex: '#E6E6FA' },
      { valor: '#87CEEB', label: 'Azul claro',   hex: '#87CEEB' },
      { valor: '#1B3A5C', label: 'Azul marinho', hex: '#1B3A5C' },
      { valor: '#98FB98', label: 'Verde claro',  hex: '#98FB98' },
      { valor: '#FFD700', label: 'Amarelo',      hex: '#FFD700' },
      { valor: '#1A1A1A', label: 'Preto',        hex: '#1A1A1A' },
    ],
  },

  {
    id: 'padraoGuardaEstampado',
    grupo: 1,
    titulo: 'Qual o padrão da estampa da guarda?',
    descricao: 'As cores combinadas com a capa ficarão a critério da DMO Papelaria',
    tipo: 'selecao-grade',
    campo: 'padraoGuardaEstampado',
    avancaAutomatico: true,
    visivel: (c) => c.materialGuarda === 'estampada',
    opcoes: [
      { valor: 'poas',     label: 'Poás (bolinhas)', descricao: 'Bolinhas delicadas' },
      { valor: 'flores',   label: 'Flores',          descricao: 'Floral delicado' },
      { valor: 'abstrata', label: 'Abstrata',        descricao: 'Arte livre e expressiva' },
    ],
  },

  {
    id: 'tipoCorteEspecial',
    grupo: 1,
    titulo: 'Quer corte especial nas páginas?',
    descricao: 'Tipo de acabamento das bordas do papel',
    tipo: 'selecao-grade',
    campo: 'tipoCorteEspecial',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'nenhum',      label: 'Corte reto',  descricao: 'Bordas uniformes e precisas' },
      { valor: 'deckle-edge', label: 'Deckle Edge', descricao: 'Bordas irregulares artesanais — especial · +R$5,00' },
    ],
  },

  {
    id: 'tipoCantos',
    grupo: 1,
    titulo: 'Como ficam os cantos?',
    tipo: 'selecao-grade',
    campo: 'tipoCantos',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'arredondados', label: 'Arredondados', descricao: 'Cantos curvos e suaves · +R$5,00' },
      { valor: 'retos',        label: 'Retos',        descricao: 'Cantos em 90° — clássico' },
    ],
  },

  {
    id: 'pinturaBordasAtiva',
    grupo: 1,
    titulo: 'Quer pintura nas bordas (cortes) das páginas?',
    descricao: 'Cor nos cortes laterais das folhas — efeito incrível ao abrir',
    tipo: 'toggle',
    campo: 'pinturaBordasAtiva',
    avancaAutomatico: true,
  },

  {
    id: 'corPinturaBordas',
    grupo: 1,
    titulo: 'Qual a cor da pintura?',
    tipo: 'selecao-grade',
    campo: 'corPinturaBordas',
    avancaAutomatico: true,
    visivel: (c) => c.pinturaBordasAtiva,
    opcoes: [
      { valor: '#C0C0C0', label: 'Prata',   hex: '#C0C0C0' },
      { valor: '#D4AF37', label: 'Dourada', hex: '#D4AF37' },
    ],
  },

  // ─── GRUPO 2: CAPA ────────────────────────────────────────

  {
    id: 'materialCapa',
    grupo: 2,
    titulo: 'Qual o material do revestimento da capa?',
    descricao: 'Como será o toque e a aparência do seu caderno/livro',
    tipo: 'selecao-lista',
    campo: 'materialCapa',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'couro',          label: 'Couro',          descricao: 'Natural · Durável · Envelhece bem' },
      { valor: 'sintetico',      label: 'Sintético',      descricao: 'Vegano · Resistente · Moderno' },
      { valor: 'tecido',         label: 'Tecido',         descricao: 'Suave · Colorido · Delicado' },
      { valor: 'papel-especial', label: 'Papel especial', descricao: 'Elegante · Leve · Texturizado' },
      { valor: 'kraft',          label: 'Kraft',          descricao: 'Rústico · Natural · Artesanal' },
      { valor: 'linho',          label: 'Linho',          descricao: 'Chic · Texturizado · Refinado' },
    ],
  },

  // Cor da capa — couro
  {
    id: 'corCapa-couro',
    grupo: 2,
    titulo: 'Qual a cor da capa?',
    descricao: 'Escolha a cor do revestimento em couro',
    tipo: 'cor',
    campo: 'corCapa',
    visivel: (c) => c.materialCapa === 'couro',
    opcoes: CORES_CAPA_COURO.map((c) => ({ valor: c.hex, label: c.nome, hex: c.hex })),
  },

  // Cor da capa — sintético
  {
    id: 'corCapa-sintetico',
    grupo: 2,
    titulo: 'Qual a cor da capa?',
    descricao: 'Escolha a cor do revestimento sintético',
    tipo: 'cor',
    campo: 'corCapa',
    visivel: (c) => c.materialCapa === 'sintetico',
    opcoes: CORES_CAPA_SINTETICO.map((c) => ({ valor: c.hex, label: c.nome, hex: c.hex })),
  },

  // Cor da capa — papel especial
  {
    id: 'corCapa-papel',
    grupo: 2,
    titulo: 'Qual a cor da capa?',
    descricao: 'Escolha a opção de papel especial',
    tipo: 'cor',
    campo: 'corCapa',
    visivel: (c) => c.materialCapa === 'papel-especial',
    opcoes: CORES_CAPA_PAPEL_ESPECIAL.map((c) => ({ valor: c.hex, label: c.nome, hex: c.hex })),
  },

  // Cor da capa — tecido: campo de texto para cor principal
  {
    id: 'corCapaTecido',
    grupo: 2,
    titulo: 'Qual a cor principal do revestimento em tecido?',
    descricao: 'Escreva a seguir qual a cor principal do tecido do seu caderno/livro',
    tipo: 'texto',
    campo: 'corCapaTecido',
    placeholder: 'Ex: azul marinho, rosa chá, estampado floral...',
    maxLength: 60,
    visivel: (c) => c.materialCapa === 'tecido',
  },

  // Padrão do tecido
  {
    id: 'padrao-tecido',
    grupo: 2,
    titulo: 'Qual o padrão do tecido?',
    tipo: 'selecao-grade',
    campo: 'estampaCapa',
    avancaAutomatico: true,
    visivel: (c) => c.materialCapa === 'tecido',
    opcoes: [
      { valor: 'nenhuma',     label: 'Liso (cor única)',           descricao: 'Sem estampa' },
      { valor: 'floral',      label: 'Flores',                     descricao: 'Estampa floral' },
      { valor: 'minimalista', label: 'Grid (mini xadrez)',          descricao: 'Grade discreta' },
      { valor: 'abstrata',    label: 'Geométrico/Borboletas',       descricao: 'Padrão geométrico' },
      { valor: 'tematica',    label: 'Poás (bolinhas)',             descricao: 'Bolinhas delicadas' },
    ],
  },

  {
    id: 'querPersonalizacaoCapa',
    grupo: 2,
    titulo: 'Deseja personalizar a capa com nome, iniciais ou frase?',
    descricao: 'Gravação, bordado ou baixo/alto relevo — +R$25,00',
    tipo: 'toggle',
    campo: 'querPersonalizacaoCapa',
    avancaAutomatico: true,
  },

  {
    id: 'nomeGravado',
    grupo: 2,
    titulo: 'O que você quer gravado?',
    descricao: 'Nome, iniciais, data ou frase curta (máx. 40 caracteres)',
    tipo: 'texto',
    campo: 'nomeGravado',
    placeholder: 'Ex: Ana Carolina · AC · carpe diem · 2024',
    maxLength: 40,
    visivel: (c) => c.querPersonalizacaoCapa,
  },

  {
    id: 'gravacaoCapa',
    grupo: 2,
    titulo: 'Como você quer essa personalização?',
    tipo: 'selecao-lista',
    campo: 'gravacaoCapa',
    avancaAutomatico: true,
    visivel: (c) => c.querPersonalizacaoCapa && c.nomeGravado.trim().length > 0,
    opcoes: [
      { valor: 'baixo-relevo', label: 'Baixo relevo', descricao: 'Sutil e elegante — afundado na capa · +R$25,00' },
      { valor: 'alto-relevo',  label: 'Alto relevo',  descricao: 'Marcante — elevado na capa · +R$25,00' },
      { valor: 'bordado',      label: 'Bordado',      descricao: 'Feito à mão com fio — o mais artesanal · +R$25,00' },
    ],
  },

  {
    id: 'posicaoGravacao',
    grupo: 2,
    titulo: 'Onde deseja o texto na capa?',
    descricao: 'Posicionamento da personalização na capa',
    tipo: 'selecao-grade',
    campo: 'posicaoGravacao',
    avancaAutomatico: true,
    visivel: (c) => c.querPersonalizacaoCapa && c.nomeGravado.trim().length > 0,
    opcoes: [
      { valor: 'centro',            label: 'Centro',           descricao: 'No meio da capa — o mais clássico' },
      { valor: 'terco-superior',    label: 'Terço superior',   descricao: 'Na parte de cima' },
      { valor: 'terco-inferior',    label: 'Terço inferior',   descricao: 'Na parte de baixo' },
      { valor: 'canto-inf-direito', label: 'Canto inferior',   descricao: 'Discreto, no canto dir. embaixo' },
    ],
  },

  {
    id: 'tipoBordado',
    grupo: 2,
    titulo: 'Como você prefere que seja o bordado?',
    descricao: 'A combinação das cores do bordado com a capa será feita pela DMO Papelaria',
    tipo: 'selecao-grade',
    campo: 'tipoBordado',
    avancaAutomatico: true,
    visivel: (c) => c.querPersonalizacaoCapa && c.gravacaoCapa === 'bordado',
    opcoes: [
      { valor: 'cor-unica', label: 'Cor única',  descricao: 'Um fio, resultado elegante e clássico' },
      { valor: 'colorido',  label: 'Colorido',   descricao: 'Duas ou mais cores combinando com a capa' },
    ],
  },

  {
    id: 'aplicacoesCapa',
    grupo: 2,
    titulo: 'Quer aplicações extras na capa?',
    descricao: 'Elementos decorativos adicionais — R$18,00 cada',
    tipo: 'multipla-escolha',
    campo: 'aplicacoesCapa',
    opcoes: [
      { valor: 'renda',     label: 'Renda',      descricao: 'Detalhe em renda delicada ao redor da capa — aspecto vintage' },
      { valor: 'pespontos', label: 'Pespontos',  descricao: 'Costura delicada com linha ao redor da capa e contra capa' },
      { valor: 'botoes',    label: 'Botões',     descricao: 'Botões decorativos' },
    ],
  },

  {
    id: 'tipoCantoneiras',
    grupo: 2,
    titulo: 'Deseja cantoneiras na capa?',
    tipo: 'selecao-lista',
    campo: 'tipoCantoneiras',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'nenhuma',          label: 'Sem cantoneiras',      descricao: 'Capa sem adicional' },
      { valor: 'papel',            label: 'Em papel',             descricao: '+R$5,00' },
      { valor: 'metal-simples',    label: 'Em metal simples',     descricao: '+R$9,00' },
      { valor: 'metal-trabalhado', label: 'Em metal trabalhado',  descricao: '+R$12,00' },
    ],
  },

  {
    id: 'tipoLombada',
    grupo: 2,
    titulo: 'Como deseja a lombada?',
    descricao: 'A lateral onde as páginas são costuradas',
    tipo: 'selecao-lista',
    campo: 'tipoLombada',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'exposta',                     label: 'Exposta',                           descricao: 'Costura visível — visual artesanal autêntico' },
      { valor: 'protegida',                   label: 'Protegida',                         descricao: 'Capa cobre a costura — mais clean' },
      { valor: 'protegida-costura-aparente',  label: 'Protegida com costura aparente',    descricao: 'Artesanal e exclusivo' },
    ],
  },

  {
    id: 'tipoEncadernacao',
    grupo: 2,
    titulo: 'Qual tipo de costura?',
    descricao: 'Define como as páginas são presas — +R$6,00 (Wire-O: +R$9,00)',
    tipo: 'selecao-lista',
    campo: 'tipoEncadernacao',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'copta',            label: 'Copta',            descricao: 'Abertura 180° · Costura Aparente — muito resistente e durável' },
      { valor: 'long-stitch',      label: 'Long Stitch',      descricao: 'Abertura 180° · Costura longa aparente — visual artístico' },
      { valor: 'francesa-cruzada', label: 'Francesa Cruzada', descricao: 'Abertura 180° · Padrão de losangos — delicada e elegante' },
      { valor: 'belga',            label: 'Belga',            descricao: 'Abertura 360° — ideal para uso intenso' },
      { valor: 'wire-o',           label: 'Wire-O',           descricao: 'Anéis metálicos duplos — abre 360°, ideal para planners' },
    ],
  },

  {
    id: 'corFio',
    grupo: 2,
    titulo: 'Qual a cor do fio de costura?',
    tipo: 'cor',
    campo: 'corFio',
    visivel: (c) => ['copta', 'long-stitch', 'francesa-cruzada', 'belga'].includes(c.tipoEncadernacao),
    opcoes: CORES_FIO_PADRAO.map((c) => ({ valor: c.hex, label: c.nome, hex: c.hex })),
  },

  {
    id: 'elasticoAtivo',
    grupo: 2,
    titulo: 'Quer elástico de fechamento?',
    descricao: 'Mantém o caderno fechado e protegido — +R$6,00',
    tipo: 'toggle',
    campo: 'elasticoAtivo',
    avancaAutomatico: true,
  },

  {
    id: 'corElastico',
    grupo: 2,
    titulo: 'Qual a cor do elástico?',
    tipo: 'cor',
    campo: 'corElastico',
    visivel: (c) => c.elasticoAtivo,
    opcoes: CORES_ELASTICO_PADRAO.map((c) => ({ valor: c.hex, label: c.nome, hex: c.hex })),
  },

  {
    id: 'marcadorAtivo',
    grupo: 2,
    titulo: 'Quer marcador de páginas?',
    descricao: 'Fita de cetim, couro ou cordão saindo do caderno — +R$8,00',
    tipo: 'toggle',
    campo: 'marcadorAtivo',
    avancaAutomatico: true,
  },

  {
    id: 'tipoMarcador',
    grupo: 2,
    titulo: 'Qual o tipo de marcador?',
    tipo: 'selecao-grade',
    campo: 'tipoMarcador',
    avancaAutomatico: true,
    visivel: (c) => c.marcadorAtivo,
    opcoes: [
      { valor: 'fita-cetim',   label: 'Fita de cetim',   descricao: 'Suave e elegante' },
      { valor: 'couro',        label: 'Couro',           descricao: 'Acrescenta espessura ao caderno' },
      { valor: 'cordao-cetim', label: 'Cordão de cetim', descricao: 'Trançado e encantador' },
    ],
  },

  {
    id: 'larguraMarcador',
    grupo: 2,
    titulo: 'Qual largura terá o marcador?',
    tipo: 'selecao-grade',
    campo: 'larguraMarcador',
    avancaAutomatico: true,
    visivel: (c) => c.marcadorAtivo,
    opcoes: [
      { valor: '7mm',  label: '7 mm',  descricao: 'Discreto e elegante' },
      { valor: '10mm', label: '10 mm', descricao: 'Mais visível e marcante' },
    ],
  },

  {
    id: 'quantidadeMarcadores',
    grupo: 2,
    titulo: 'Quantos marcadores deseja?',
    tipo: 'selecao-grade',
    campo: 'quantidadeMarcadores',
    avancaAutomatico: true,
    visivel: (c) => c.marcadorAtivo,
    opcoes: [
      { valor: '1', label: 'Apenas um',      descricao: 'Um marcador' },
      { valor: '2', label: 'Dois marcadores', descricao: 'Segundo marcador · +R$8,00' },
    ],
  },

  {
    id: 'extras-elementos',
    grupo: 2,
    titulo: 'Outros elementos funcionais?',
    descricao: 'Itens extras para seu caderno/livro — R$7,00 cada',
    tipo: 'multipla-escolha',
    campo: 'bolsoInterno',
    opcoes: [
      { valor: 'bolsoInterno',       label: 'Bolso interno',            descricao: 'Fixado nas contra capas, para guardar papeis e cartões' },
      { valor: 'envelopeAcoplado',   label: 'Envelope acoplado',        descricao: 'Fixado logo depois da capa ou no centro' },
      { valor: 'envelopeContracapa', label: 'Envelope na contra capa',  descricao: 'Com aba de fechamento' },
      { valor: 'portaCaneta',        label: 'Porta-caneta',             descricao: 'Suporte para guardar a caneta' },
      { valor: 'abasOrelhas',        label: 'Abas / orelhas',           descricao: 'Dobra protetora nas bordas (incompatível com cantoneiras)' },
    ],
  },

  {
    id: 'tipoEmbalagem',
    grupo: 2,
    titulo: 'Deseja embalagem para presente?',
    tipo: 'selecao-grade',
    campo: 'tipoEmbalagem',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'padrao',   label: 'Embalagem padrão',        descricao: 'Saquinho em tecido de algodão · +R$25,00' },
      { valor: 'presente', label: 'Embalagem para presente', descricao: 'Saquinho + caixa personalizada · +R$65,00' },
    ],
  },

  {
    id: 'padraoEmbalagem',
    grupo: 2,
    titulo: 'Qual padrão para a embalagem?',
    descricao: 'O saquinho e a caixa serão feitos com a mesma estampa escolhida',
    tipo: 'selecao-lista',
    campo: 'padraoEmbalagem',
    avancaAutomatico: true,
    opcoes: [
      { valor: 'poas',            label: 'Poás (bolinhas)' },
      { valor: 'floral-delicado', label: 'Floral delicado' },
      { valor: 'floral-marcante', label: 'Floral marcante' },
      { valor: 'listrado',        label: 'Listrado' },
      { valor: 'xadrez',          label: 'Xadrez' },
      { valor: 'folhagens',       label: 'Folhagens' },
      { valor: 'animal-print',    label: 'Animal Print' },
      { valor: 'abstrato',        label: 'Abstrato' },
      { valor: 'algodao-cru',     label: 'Algodão cru' },
    ],
  },
]

// ─── Utilitários ─────────────────────────────────────────────

export function getPerguntasVisiveis(config: ConfiguracaoCaderno): Pergunta[] {
  return TODAS_PERGUNTAS.filter((p) => !p.visivel || p.visivel(config))
}

export const GRUPOS = [
  { numero: 1, titulo: 'Miolo', iconeKey: 'papel' },
  { numero: 2, titulo: 'Capa',  iconeKey: 'capa'  },
]
