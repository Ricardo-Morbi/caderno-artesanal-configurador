export type StatusPedido = 'novo' | 'em_producao' | 'pronto' | 'entregue'

export interface Pedido {
  id: string
  criado_em: string
  nome: string
  whatsapp: string
  configuracao: Record<string, unknown>
  total: number
  status: StatusPedido
  notas: string | null
}

export interface Lead {
  id: string
  criado_em: string
  configuracao: Record<string, unknown>
  total: number
  pergunta_index: number
}

export const STATUS_LABELS: Record<StatusPedido, string> = {
  novo: 'Novo',
  em_producao: 'Em produção',
  pronto: 'Pronto',
  entregue: 'Entregue',
}

export const STATUS_COLUNAS: StatusPedido[] = ['novo', 'em_producao', 'pronto', 'entregue']
