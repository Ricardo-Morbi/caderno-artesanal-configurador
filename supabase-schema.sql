-- ─── Schema do Painel Admin ───────────────────────────────────
-- Executar no Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → colar e executar

-- Tabela de pedidos
create table if not exists public.pedidos (
  id          uuid        primary key default gen_random_uuid(),
  criado_em   timestamptz not null    default now(),
  nome        text        not null,
  whatsapp    text        not null,
  configuracao jsonb      not null,
  total       numeric(10,2) not null,
  status      text        not null    default 'novo'
              check (status in ('novo', 'em_producao', 'pronto', 'entregue')),
  notas       text
);

-- Tabela de leads (configurações parciais sem pedido finalizado)
create table if not exists public.leads (
  id            uuid        primary key default gen_random_uuid(),
  criado_em     timestamptz not null    default now(),
  configuracao  jsonb       not null,
  total         numeric(10,2) not null,
  pergunta_index integer    not null    default 0
);

-- Índices para performance
create index if not exists pedidos_criado_em_idx on public.pedidos (criado_em desc);
create index if not exists pedidos_status_idx    on public.pedidos (status);
create index if not exists leads_criado_em_idx   on public.leads   (criado_em desc);

-- RLS: desabilitar para que service role possa operar livremente
-- (o acesso público ao POST /api/pedidos é controlado pela API route)
alter table public.pedidos enable row level security;
alter table public.leads   enable row level security;

-- Policies: service role ignora RLS automaticamente
-- Usuários anônimos não têm acesso direto — só via API routes com service key

-- Realtime: habilitar para notificações ao vivo no painel admin
alter publication supabase_realtime add table public.pedidos;
