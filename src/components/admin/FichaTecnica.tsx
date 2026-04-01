import type { ConfiguracaoCaderno } from '@/types/caderno'

const LABELS: Record<string, Record<string, string>> = {
  tamanho:         { A6:'A6', A5:'A5', A4:'A4', personalizado:'Personalizado' },
  formato:         { retrato:'Retrato', paisagem:'Paisagem', quadrado:'Quadrado' },
  espessura:       { fino:'Fino (~80 fls)', medio:'Médio (~160 fls)', grosso:'Grosso (~240 fls)', 'extra-grosso':'Extra-Grosso (~320 fls)' },
  materialCapa:    { couro:'Couro', sintetico:'Sintético', tecido:'Tecido', 'papel-especial':'Papel especial', kraft:'Kraft', linho:'Linho' },
  estampaCapa:     { nenhuma:'Sem estampa', floral:'Floral', minimalista:'Minimalista', abstrata:'Abstrata', tematica:'Temática' },
  gravacaoCapa:    { nenhuma:'Sem gravação', 'baixo-relevo':'Baixo relevo', 'alto-relevo':'Alto relevo', bordado:'Bordado' },
  posicaoGravacao: { centro:'Centro', 'terco-superior':'Terço superior', 'terco-inferior':'Terço inferior', 'canto-inf-direito':'Canto inf. direito' },
  tipoTipografia:  { serif:'Serif', 'sans-serif':'Sans-serif', script:'Script', monoespaco:'Monospace' },
  tipoEncadernacao:{ copta:'Copta', 'francesa-cruzada':'Francesa cruzada', 'long-stitch':'Long Stitch', 'wire-o':'Wire-O' },
  tipoLombada:     { exposta:'Lombada exposta', protegida:'Lombada protegida' },
  tipoAbertura:    { '180-graus':'180 graus', tradicional:'Tradicional' },
  tipoPapel:       { offset:'Offset', polen:'Pólen', reciclado:'Reciclado', vegetal:'Vegetal' },
  graturaPapel:    { '90g':'90g/m²', '120g':'120g/m²', '180g':'180g/m²', '240g':'240g/m²' },
  corFolhas:       { branca:'Branca', creme:'Creme', colorida:'Colorida' },
  padraoPaginas:   { liso:'Liso', pautado:'Pautado', pontilhado:'Pontilhado', quadriculado:'Quadriculado' },
  tipoMarcador:    { fitilho:'Fitilho', couro:'Couro', cordao:'Cordão' },
  larguraMarcador: { fino:'Fino', medio:'Médio', largo:'Largo' },
  tipoCantos:      { arredondados:'Arredondados', retos:'Retos' },
  tipoCorteEspecial:{ nenhum:'Sem corte especial', 'deckle-edge':'Deckle Edge' },
  tipoLaminacao:   { nenhuma:'Sem laminação', fosca:'Fosca', brilho:'Brilho' },
  tipoTextura:     { lisa:'Lisa', granulada:'Granulada' },
  temaCaderno:     { nenhum:'Sem tema', maternidade:'Maternidade', viagens:'Viagens', gratidao:'Gratidão', estudos:'Estudos' },
  proposicaoCaderno:{ 'escrita-livre':'Escrita livre', diario:'Diário', planner:'Planner', memorias:'Memórias', 'profissional-estudos':'Prof./Estudos' },
  materialGuarda:  { branca:'Branca', colorida:'Colorida', marmorizada:'Marmorizada', kraft:'Kraft', estampada:'Estampada' },
  padraoGuarda:    { liso:'Liso', floral:'Floral', geometrico:'Geométrico', aquarela:'Aquarela' },
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

export default function FichaTecnica({ c }: { c: ConfiguracaoCaderno }) {
  return (
    <div className="divide-y divide-ivoire-300 space-y-0">
      <Secao titulo="Formato" linhas={[
        { titulo: 'Tamanho',   valor: label('tamanho', c.tamanho) },
        { titulo: 'Formato',   valor: label('formato', c.formato) },
        { titulo: 'Espessura', valor: label('espessura', c.espessura) },
      ]} />

      <div className="pt-3">
        <Secao titulo="Capa" linhas={[
          { titulo: 'Material',  valor: label('materialCapa', c.materialCapa) },
          { titulo: 'Cor',       valor: <Cor hex={c.corCapa} /> },
          { titulo: 'Estampa',   valor: c.estampaCapa !== 'nenhuma' ? label('estampaCapa', c.estampaCapa) : null },
          { titulo: 'Gravação',  valor: c.gravacaoCapa !== 'nenhuma' ? label('gravacaoCapa', c.gravacaoCapa) : null },
          { titulo: 'Nome',      valor: c.nomeGravado || null },
          { titulo: 'Posição',   valor: c.gravacaoCapa !== 'nenhuma' ? label('posicaoGravacao', c.posicaoGravacao) : null },
          { titulo: 'Tipografia',valor: c.gravacaoCapa !== 'nenhuma' ? label('tipoTipografia', c.tipoTipografia) : null },
          { titulo: 'Aplicações',valor: c.aplicacoesCapa?.length ? c.aplicacoesCapa.join(', ') : null },
        ]} />
      </div>

      <div className="pt-3">
        <Secao titulo="Encadernação" linhas={[
          { titulo: 'Tipo',       valor: label('tipoEncadernacao', c.tipoEncadernacao) },
          { titulo: 'Lombada',    valor: label('tipoLombada', c.tipoLombada) },
          { titulo: 'Abertura',   valor: label('tipoAbertura', c.tipoAbertura) },
          { titulo: 'Cor do fio', valor: <Cor hex={c.corFio} /> },
        ]} />
      </div>

      <div className="pt-3">
        <Secao titulo="Miolo" linhas={[
          { titulo: 'Papel',     valor: label('tipoPapel', c.tipoPapel) },
          { titulo: 'Gramatura', valor: label('graturaPapel', c.graturaPapel) },
          { titulo: 'Cor',       valor: label('corFolhas', c.corFolhas) },
          { titulo: 'Padrão',    valor: label('padraoPaginas', c.padraoPaginas) },
          { titulo: 'Impressões internas', valor: c.impressoesInternas ? 'Sim' : null },
          { titulo: 'Divisórias', valor: c.divisoriasInternas ? 'Sim' : null },
        ]} />
      </div>

      <div className="pt-3">
        <Secao titulo="Elementos Funcionais" linhas={[
          { titulo: 'Elástico',      valor: c.elasticoAtivo ? <Cor hex={c.corElastico} /> : null },
          { titulo: 'Pos. elástico', valor: c.elasticoAtivo ? c.posicaoElastico : null },
          { titulo: 'Marcador',      valor: c.marcadorAtivo ? label('tipoMarcador', c.tipoMarcador) : null },
          { titulo: 'Cor marcador',  valor: c.marcadorAtivo ? <Cor hex={c.corMarcador} /> : null },
          { titulo: 'Bolso interno', valor: c.bolsoInterno ? 'Sim' : null },
          { titulo: 'Envelope',      valor: c.envelopeAcoplado ? 'Sim' : null },
          { titulo: 'Porta-caneta',  valor: c.portaCaneta ? 'Sim' : null },
          { titulo: 'Abas/orelhas',  valor: c.abasOrelhas ? 'Sim' : null },
        ]} />
      </div>

      <div className="pt-3">
        <Secao titulo="Acabamentos" linhas={[
          { titulo: 'Cantos',      valor: label('tipoCantos', c.tipoCantos) },
          { titulo: 'Borda pintada', valor: c.pinturaBordasAtiva ? <Cor hex={c.corPinturaBordas} /> : null },
          { titulo: 'Corte esp.',  valor: c.tipoCorteEspecial !== 'nenhum' ? label('tipoCorteEspecial', c.tipoCorteEspecial) : null },
          { titulo: 'Laminação',   valor: c.tipoLaminacao !== 'nenhuma' ? label('tipoLaminacao', c.tipoLaminacao) : null },
          { titulo: 'Textura',     valor: label('tipoTextura', c.tipoTextura) },
        ]} />
      </div>

      <div className="pt-3">
        <Secao titulo="Extras Afetivos" linhas={[
          { titulo: 'Dedicatória',  valor: c.paginaDedicatoria ? 'Sim' : null },
          { titulo: 'Frases',       valor: c.frasesAoLongo ? 'Sim' : null },
          { titulo: 'Datas imp.',   valor: c.datasImportantes ? 'Sim' : null },
          { titulo: 'Tema',         valor: c.temaCaderno !== 'nenhum' ? label('temaCaderno', c.temaCaderno) : null },
          { titulo: 'Essência',     valor: c.essenciaNoParapel ? 'Sim' : null },
          { titulo: 'Propósito',    valor: label('proposicaoCaderno', c.proposicaoCaderno) },
        ]} />
      </div>

      <div className="pt-3">
        <Secao titulo="Guarda" linhas={[
          { titulo: 'Material', valor: label('materialGuarda', c.materialGuarda) },
          { titulo: 'Cor',      valor: c.materialGuarda === 'colorida' ? <Cor hex={c.corGuarda} /> : null },
          { titulo: 'Padrão',   valor: c.padraoGuarda !== 'liso' ? label('padraoGuarda', c.padraoGuarda) : null },
        ]} />
      </div>
    </div>
  )
}
