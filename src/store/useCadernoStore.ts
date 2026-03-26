import { create } from 'zustand'
import type { ConfiguracaoCaderno } from '@/types/caderno'

// ============================================================
// VALORES PADRÃO (caderno base ao entrar no site)
// ============================================================

const configuracaoPadrao: ConfiguracaoCaderno = {
  // Etapa 1
  tamanho: 'A5',
  formato: 'retrato',
  espessura: 'medio',

  // Etapa 2
  materialCapa: 'couro',
  corCapa: '#6B4226',
  estampaCapa: 'nenhuma',
  gravacaoCapa: 'nenhuma',
  nomeGravado: '',
  posicaoGravacao: 'centro',
  aplicacoesCapa: [],

  // Etapa 3
  tipoEncadernacao: 'copta',
  tipoLombada: 'exposta',
  tipoAbertura: '180-graus',
  corFio: '#E8D5B7',

  // Etapa 4
  tipoPapel: 'offset',
  graturaPapel: '90g',
  corFolhas: 'branca',
  padraoPaginas: 'pautado',
  impressoesInternas: false,
  divisoriasInternas: false,

  // Etapa 5
  elasticoAtivo: true,
  corElastico: '#1A1A1A',
  posicaoElastico: 'vertical',
  marcadorAtivo: true,
  tipoMarcador: 'fitilho',
  corMarcador: '#C4713C',
  bolsoInterno: false,
  envelopeAcoplado: false,
  portaCaneta: false,
  abasOrelhas: false,

  // Etapa 6
  tipoCantos: 'arredondados',
  pinturaBordasAtiva: false,
  corPinturaBordas: '#C4713C',
  tipoCorteEspecial: 'nenhum',
  tipoLaminacao: 'nenhuma',
  tipoTextura: 'lisa',

  // Etapa 7
  paginaDedicatoria: false,
  frasesAoLongo: false,
  datasImportantes: false,
  temaCaderno: 'nenhum',
  essenciaNoParapel: false,
  proposicaoCaderno: 'escrita-livre',
}

// ============================================================
// INTERFACE DO STORE
// ============================================================

interface CadernoStore {
  // Estado atual
  configuracao: ConfiguracaoCaderno
  perguntaIndex: number   // índice dentro da lista filtrada de perguntas

  // Ações de navegação por pergunta
  irParaPergunta: (index: number) => void
  avancarPergunta: (total: number) => void
  voltarPergunta: () => void

  // Ação genérica para atualizar qualquer campo
  atualizarOpcao: <K extends keyof ConfiguracaoCaderno>(
    campo: K,
    valor: ConfiguracaoCaderno[K]
  ) => void

  // Ações específicas para arrays (aplicações da capa)
  toggleAplicacaoCapa: (aplicacao: ConfiguracaoCaderno['aplicacoesCapa'][number]) => void

  // Reset para começar do zero
  resetarConfiguracoes: () => void
}

// ============================================================
// STORE ZUSTAND
// ============================================================

export const useCadernoStore = create<CadernoStore>((set) => ({
  configuracao: configuracaoPadrao,
  perguntaIndex: 0,

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
      configuracao: {
        ...state.configuracao,
        [campo]: valor,
      },
    })),

  toggleAplicacaoCapa: (aplicacao) =>
    set((state) => {
      const aplicacoesAtuais = state.configuracao.aplicacoesCapa
      const jaTemAplicacao = aplicacoesAtuais.includes(aplicacao)

      return {
        configuracao: {
          ...state.configuracao,
          aplicacoesCapa: jaTemAplicacao
            ? aplicacoesAtuais.filter((a) => a !== aplicacao)
            : [...aplicacoesAtuais, aplicacao],
        },
      }
    }),

  resetarConfiguracoes: () =>
    set({ configuracao: configuracaoPadrao, perguntaIndex: 0 }),
}))
