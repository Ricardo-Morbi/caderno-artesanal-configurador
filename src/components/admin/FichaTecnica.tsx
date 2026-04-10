import type { ConfiguracaoCaderno } from '@/types/caderno'
import type { TabelaPrecos } from '@/lib/calcularPreco'
import { itemizarPreco, detalharPreco, TABELA_PADRAO } from '@/lib/calcularPreco'

const LABELS: Record<string, Record<string, string>> = {
  tamanho:          { A6:'A6', A5:'A5', A4:'A4', personalizado:'Personalizado' },
  formato:          { retrato:'Retrato', paisagem:'Paisagem', quadrado:'Quadrado' },
  espessura:        { fino:'Fino (~40 fls)', medio:'Médio (~80 fls)', grosso:'Grosso (~120 fls)' },
  materialCapa:     { couro:'Couro', sintetico:'Sintético', tecido:'Tecido', 'papel-especial':'Papel especial', kraft:'Kraft', linho:'Linho' },
  estampaCapa:      { nenhuma:'Sem estampa', floral:'Floral', minimalista:'Minimalista', abstrata:'Abstrata', tematica:'Temática' },
  gravacaoCapa:     { nenhuma:'Sem gravação', 'baixo-relevo':'Baixo relevo', 'alto-relevo':'Alto relevo', bordado:'Bordado' },
  posicaoGravacao:  { centro:'Centro', 'terco-superior':'Terço superior', 'terco-inferior':'Terço inferior', 'canto-inf-direito':'Canto inf. direito' },
  tipoBordado:      { 'cor-unica':'Cor única', colorido:'Colorido' },
  tipoCantoneiras:  { nenhuma:'Sem cantoneiras', papel:'Papel', 'metal-simples':'Metal simples', 'metal-trabalhado':'Metal trabalhado' },
  tipoEncadernacao: { copta:'Copta', 'francesa-cruzada':'Francesa cruzada', 'long-stitch':'Long Stitch', belga:'Belga', 'wire-o':'Wire-O' },
  tipoLombada:      { exposta:'Exposta', protegida:'Protegida', 'protegida-costura-aparente':'Protegida c/ costura aparente' },
  tipoPapel:        { offset:'Offset', polen:'Pólen Bold', reciclado:'Reciclado' },
  graturaPapel:     { '90g':'90 g/m²', '120g':'120 g/m²', '180g':'180 g/m²' },
  padraoPaginas:    { liso:'Liso', pautado:'Pautado', pontilhado:'Pontilhado', quadriculado:'Quadriculado' },
  larguraMarcador:  { '7mm':'7 mm', '10mm':'10 mm' },
  tipoCantos:       { arredondados:'Arredondados', retos:'Retos' },
  temaCaderno:      {
    'sem-tema-1':'Sem tema (liso)', 'sem-tema-2':'Sem tema (pauta)', versatil:'Versátil',
    maternidade:'Maternidade', casamento:'Casamento', viagens:'Viagens',
    gratidao:'Gratidão', estudos:'Estudos/Trabalho', planner:'Planner',
  },
  tipoEmbalagem:    { padrao:'Padrão (saquinho tecido)', presente:'Para presente (saquinho + caixa)' },
}

function label(campo: string, valor: string): string {
  return LABELS[campo]?.[valor] ?? valor
}

function Cor({ hex }: { hex: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block w-3 h-3 rounded-sm border border-ivoire-400 flex-shrink-0"
        style={{ background: hex }} />
      <span className="font-mono text-[10px] text-onix-400">{hex}</span>
    </span>
  )
}

interface Linha { titulo: string; valor: React.ReactNode }

function Secao({ titulo, linhas }: { titulo: string; linhas: Linha[] }) {
  const visiveis = linhas.filter(l => l.valor !== null && l.valor !== undefined && l.valor !== '')
  if (visiveis.length === 0) return null
  return (
    <div>
      <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-1.5 mt-3 first:mt-0">
        {titulo}
      </p>
      <div className="space-y-1">
        {visiveis.map((l, i) => (
          <div key={i} className="flex justify-between items-center gap-2">
            <span className="text-xs text-onix-500 font-sans">{l.titulo}</span>
            <span className="text-xs text-onix-700 font-sans text-right">{l.valor}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function R(v: number) {
  return `R$ ${v.toFixed(2).replace('.', ',')}`
}

export default function FichaTecnica({ c, t }: { c: ConfiguracaoCaderno; t?: TabelaPrecos }) {
  const tabela = t ?? TABELA_PADRAO
  const itens = itemizarPreco(c)
  const detalhe = detalharPreco(c, tabela)
  return (
    <div className="divide-y divide-ivoire-300 space-y-0">

      {/* ── Formato & Proporções ── */}
      <Secao titulo="Formato" linhas={[
        { titulo: 'Tamanho',    valor: label('tamanho', c.tamanho) },
        { titulo: 'Sob medida', valor: c.tamanho === 'personalizado' ? (c.subtamanhoPersonalizado || null) : null },
        { titulo: 'Orientação', valor: label('formato', c.formato) },
        { titulo: 'Espessura',  valor: label('espessura', c.espessura) },
      ]} />

      {/* ── Capa ── */}
      <div className="pt-3">
        <Secao titulo="Capa" linhas={[
          { titulo: 'Material',        valor: label('materialCapa', c.materialCapa) },
          { titulo: 'Papel especial',  valor: c.materialCapa === 'papel-especial' ? (c.papelEspecialId || null) : null },
          { titulo: 'Cor',             valor: c.corCapa ? <Cor hex={c.corCapa} /> : null },
          { titulo: 'Cor tecido',      valor: c.materialCapa === 'tecido' ? (c.corCapaTecido || null) : null },
          { titulo: 'Estampa',         valor: c.estampaCapa && c.estampaCapa !== 'nenhuma' ? label('estampaCapa', c.estampaCapa) : null },
          { titulo: 'Pespontos',       valor: c.pespontosAtivo ? 'Sim' : null },
          { titulo: 'Cantoneiras',     valor: c.tipoCantoneiras !== 'nenhuma' ? label('tipoCantoneiras', c.tipoCantoneiras) : null },
        ]} />
      </div>

      {/* ── Personalização da Capa ── */}
      <div className="pt-3">
        <Secao titulo="Personalização" linhas={[
          { titulo: 'Quer personalizar', valor: c.querPersonalizacaoCapa ? 'Sim' : 'Não' },
          { titulo: 'Texto gravado',     valor: c.nomeGravado || null },
          { titulo: 'Tipo de gravação',  valor: c.gravacaoCapa && c.gravacaoCapa !== 'nenhuma' ? label('gravacaoCapa', c.gravacaoCapa) : null },
          { titulo: 'Posição',           valor: c.gravacaoCapa && c.gravacaoCapa !== 'nenhuma' ? label('posicaoGravacao', c.posicaoGravacao) : null },
          { titulo: 'Bordado',           valor: c.gravacaoCapa === 'bordado' ? label('tipoBordado', c.tipoBordado) : null },
          { titulo: 'Cor do bordado',    valor: c.gravacaoCapa === 'bordado' && c.corBordado ? <Cor hex={c.corBordado} /> : null },
        ]} />
      </div>

      {/* ── Encadernação ── */}
      <div className="pt-3">
        <Secao titulo="Encadernação" linhas={[
          { titulo: 'Lombada',    valor: label('tipoLombada', c.tipoLombada) },
          { titulo: 'Costura',    valor: c.tipoLombada !== 'protegida' ? label('tipoEncadernacao', c.tipoEncadernacao) : null },
          { titulo: 'Cor do fio', valor: c.tipoLombada !== 'protegida' && c.corFio ? <Cor hex={c.corFio} /> : null },
        ]} />
      </div>

      {/* ── Acessórios ── */}
      <div className="pt-3">
        <Secao titulo="Acessórios" linhas={[
          { titulo: 'Elástico',         valor: c.elasticoAtivo ? 'Sim' : 'Não' },
          { titulo: 'Cor do elástico',  valor: c.elasticoAtivo && c.corElastico ? <Cor hex={c.corElastico} /> : null },
          { titulo: 'Marcador',         valor: c.marcadorAtivo ? 'Sim' : 'Não' },
          { titulo: 'Largura marcador', valor: c.marcadorAtivo ? label('larguraMarcador', c.larguraMarcador) : null },
          { titulo: 'Qtd. marcadores',  valor: c.marcadorAtivo ? String(c.quantidadeMarcadores) : null },
          { titulo: 'Cor do marcador',  valor: c.marcadorAtivo && c.corMarcador ? <Cor hex={c.corMarcador} /> : null },
          { titulo: 'Bolso interno',    valor: c.bolsoInterno ? 'Sim' : null },
          { titulo: 'Envelope contracapa', valor: c.envelopeContracapa ? 'Sim' : null },
          { titulo: 'Abas / orelhas',   valor: c.abasOrelhas ? 'Sim' : null },
        ]} />
      </div>

      {/* ── Miolo ── */}
      <div className="pt-3">
        <Secao titulo="Miolo" linhas={[
          { titulo: 'Pintura bordas',   valor: c.pinturaBordasAtiva ? 'Sim' : 'Não' },
          { titulo: 'Cor da pintura',   valor: c.pinturaBordasAtiva && c.corPinturaBordas ? <Cor hex={c.corPinturaBordas} /> : null },
          { titulo: 'Tema',             valor: c.temaCaderno ? label('temaCaderno', c.temaCaderno) : null },
          { titulo: 'Tema personalizado', valor: c.temaCaderno === 'versatil' ? (c.temaPersonalizado || null) : null },
          { titulo: 'Padrão páginas',   valor: label('padraoPaginas', c.padraoPaginas) },
          { titulo: 'Papel',            valor: label('tipoPapel', c.tipoPapel) },
          { titulo: 'Gramatura',        valor: label('graturaPapel', c.graturaPapel) },
          { titulo: 'Cantos',           valor: label('tipoCantos', c.tipoCantos) },
          { titulo: 'Folhas coloridas', valor: c.folhasColoridas ? 'Sim' : 'Não' },
          { titulo: 'Cor folhas',       valor: c.folhasColoridas && c.corFolhasColoridas ? <Cor hex={c.corFolhasColoridas} /> : null },
        ]} />
      </div>

      {/* ── Toques Afetivos ── */}
      <div className="pt-3">
        <Secao titulo="Toques Afetivos" linhas={[
          { titulo: 'Página de dedicatória', valor: c.paginaDedicatoria ? 'Sim' : null },
          { titulo: 'Essência no papel',     valor: c.essenciaNoParapel ? 'Sim' : null },
        ]} />
      </div>

      {/* ── Embalagem ── */}
      <div className="pt-3">
        <Secao titulo="Embalagem" linhas={[
          { titulo: 'Tipo', valor: label('tipoEmbalagem', c.tipoEmbalagem) },
        ]} />
      </div>

      {/* ── Precificação ── */}
      <div className="pt-3">
        <p className="text-[10px] tracking-widest uppercase font-sans text-onix-400 mb-1.5 mt-3">
          Precificação
        </p>

        {/* Itens de material */}
        <div className="space-y-0.5 mb-2">
          {itens.map((item, i) => (
            <div key={i} className="flex justify-between items-center gap-2">
              <span className="text-xs text-onix-500 font-sans">{item.titulo}</span>
              <span className="text-xs text-onix-600 font-sans tabular-nums">{R(item.custo)}</span>
            </div>
          ))}
        </div>

        {/* Subtotal material */}
        <div className="border-t border-ivoire-300 pt-1.5 mt-1.5 space-y-1">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs text-onix-500 font-sans">Custo material</span>
            <span className="text-xs font-medium text-onix-700 font-sans tabular-nums">{R(detalhe.custo_material)}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs text-onix-500 font-sans">
              Mão de obra ({detalhe.horas_trabalho}h × {R(tabela.valorHoraArtesa)}/h)
            </span>
            <span className="text-xs text-onix-600 font-sans tabular-nums">{R(detalhe.custo_mao_obra)}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs text-onix-500 font-sans">Custo fixo</span>
            <span className="text-xs text-onix-600 font-sans tabular-nums">{R(detalhe.custo_fixo)}</span>
          </div>
        </div>

        {/* Total + margem + preço final */}
        <div className="border-t border-ivoire-400 pt-1.5 mt-1.5 space-y-1">
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs text-onix-600 font-sans font-medium">Custo total</span>
            <span className="text-xs font-medium text-onix-700 font-sans tabular-nums">{R(detalhe.custo_total)}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs text-onix-400 font-sans">
              Margem ({tabela.margemLucro}% + {tabela.margemInvestimento}%)
            </span>
            <span className="text-xs text-green-700 font-sans tabular-nums">+{R(detalhe.margem_valor)}</span>
          </div>
        </div>

        <div className="border-t-2 border-onix-700 pt-2 mt-1.5 flex justify-between items-center gap-2">
          <span className="text-xs font-medium text-onix-700 font-sans tracking-wide">Preço ao cliente</span>
          <span className="text-base font-serif text-onix-700">{R(detalhe.preco_final)}</span>
        </div>
      </div>

    </div>
  )
}
