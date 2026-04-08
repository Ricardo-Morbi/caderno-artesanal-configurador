import { create } from 'zustand'
import type { ConfiguracaoCaderno } from '@/types/caderno'

const configuracaoPadrao: ConfiguracaoCaderno = {
  // Miolo — Q1
  temaCaderno: 'sem-tema-1',
  temaPersonalizado: '',
  padraoPaginas: 'liso',

  // Miolo — Q2
  paginaDedicatoria: false,
  frasesAoLongo: false,
  frasePersonalizada: '',
  datasImportantes: false,
  datasPersonalizadas: '',
  essenciaNoParapel: false,

  // Miolo — Q3
  formato: 'retrato',

  // Miolo — Q4
  tipoPapel: 'offset',

  // Miolo — Q5
  graturaPapel: '90g',

  // Miolo — Q6
  tamanho: 'A5',
  subtamanhoPersonalizado: '',

  // Miolo — Q7
  espessura: 'medio',

  // Miolo — Q8
  folhasColoridas: false,
  corFolhasColoridas: '#F5F0E0',

  // Miolo — Q9
  materialGuarda: 'branca',
  padraoGuardaEstampado: 'flores',
  corGuarda: '#F5F0E0',
  padraoGuarda: 'liso',

  // Miolo — Q10
  tipoCorteEspecial: 'nenhum',

  // Miolo — Q11
  tipoCantos: 'retos',

  // Miolo — Q12
  pinturaBordasAtiva: false,

  // Miolo — Q13
  corPinturaBordas: '#D4AF37',

  // Capa — Q14
  materialCapa: 'couro',

  // Capa — Q15
  corCapa: '#6B4226',
  corCapaTecido: '',

  // Capa — Q16
  querPersonalizacaoCapa: false,
  nomeGravado: '',
  gravacaoCapa: 'nenhuma',

  // Capa — Q18
  tipoBordado: 'cor-unica',
  corBordado: '#F5DFA0',

  // Legado preview
  tipoTipografia: 'serif',
  posicaoGravacao: 'centro',
  estampaCapa: 'nenhuma',

  // Capa — Q19
  aplicacoesCapa: [],

  // Capa — Q20
  tipoCantoneiras: 'nenhuma',

  // Capa — Q21
  tipoLombada: 'exposta',

  // Capa — Q22
  tipoEncadernacao: 'copta',
  corFio: '#E8D5B7',
  tipoAbertura: '180-graus',

  // Capa — Q23
  elasticoAtivo: false,
  corElastico: '#1A1A1A',
  posicaoElastico: 'vertical',

  // Capa — Q24
  marcadorAtivo: false,
  tipoMarcador: 'fita-cetim',
  corMarcador: '#C4713C',

  // Capa — Q25/26
  larguraMarcador: '7mm',
  quantidadeMarcadores: 1,

  // Capa — Q27
  bolsoInterno: false,
  envelopeAcoplado: false,
  envelopeContracapa: false,
  portaCaneta: false,
  abasOrelhas: false,

  // Papel especial
  papelEspecialId: '',

  // Capa — Q28/29
  tipoEmbalagem: 'padrao',
  padraoEmbalagem: 'algodao-cru',

  // Legado
  impressoesInternas: false,
  divisoriasInternas: false,
  tipoLaminacao: 'nenhuma',
  tipoTextura: 'lisa',
  proposicaoCaderno: 'escrita-livre',
  corFolhas: 'branca',
}

interface CadernoStore {
  configuracao: ConfiguracaoCaderno
  perguntaIndex: number
  perguntasRespondidas: string[]

  irParaPergunta: (index: number) => void
  avancarPergunta: (total: number) => void
  voltarPergunta: () => void

  atualizarOpcao: <K extends keyof ConfiguracaoCaderno>(
    campo: K,
    valor: ConfiguracaoCaderno[K]
  ) => void

  toggleAplicacaoCapa: (aplicacao: ConfiguracaoCaderno['aplicacoesCapa'][number]) => void
  marcarRespondida: (id: string) => void

  resetarConfiguracoes: () => void
}

export const useCadernoStore = create<CadernoStore>((set) => ({
  configuracao: configuracaoPadrao,
  perguntaIndex: 0,
  perguntasRespondidas: [],

  irParaPergunta: (index) => set({ perguntaIndex: index }),

  avancarPergunta: (total) =>
    set((state) => ({
      perguntaIndex: Math.min(state.perguntaIndex + 1, total - 1),
    })),

  voltarPergunta: () =>
    set((state) => ({
      perguntaIndex: Math.max(state.perguntaIndex - 1, 0),
    })),

  atualizarOpcao: (campo, valor) =>
    set((state) => ({
      configuracao: { ...state.configuracao, [campo]: valor },
    })),

  marcarRespondida: (id) =>
    set((state) => ({
      perguntasRespondidas: state.perguntasRespondidas.includes(id)
        ? state.perguntasRespondidas
        : [...state.perguntasRespondidas, id],
    })),

  toggleAplicacaoCapa: (aplicacao) =>
    set((state) => {
      const atual = state.configuracao.aplicacoesCapa
      const jatem = atual.includes(aplicacao)
      return {
        configuracao: {
          ...state.configuracao,
          aplicacoesCapa: jatem
            ? atual.filter((a) => a !== aplicacao)
            : [...atual, aplicacao],
        },
      }
    }),

  resetarConfiguracoes: () =>
    set({ configuracao: configuracaoPadrao, perguntaIndex: 0, perguntasRespondidas: [] }),
}))
