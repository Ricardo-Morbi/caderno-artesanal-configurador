import type { ConfiguracaoCaderno } from '@/types/caderno'

interface Props {
  configuracao: ConfiguracaoCaderno
  tamanho?: number
}

const PROPORCAO: Record<string, { l: number; a: number }> = {
  retrato:  { l: 1,   a: 1.4 },
  paisagem: { l: 1.4, a: 1   },
  quadrado: { l: 1,   a: 1   },
}

const ESPESSURA: Record<string, number> = {
  fino: 12, medio: 20, grosso: 30, 'extra-grosso': 42,
}

function luminancia(hex: string): number {
  if (!hex?.startsWith('#') || hex.length < 7) return 0.5
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

export default function PreviewCadernoMini({ configuracao: c, tamanho = 120 }: Props) {
  const prop = PROPORCAO[c.formato] ?? PROPORCAO.retrato
  const esp  = ESPESSURA[c.espessura] ?? 20
  const raioCanto = c.tipoCantos === 'retos' ? 0 : 4

  // ViewBox
  const margem = 10
  const largCapa = 80 * prop.l
  const altCapa  = 80 * prop.a
  const vbL = margem * 2 + esp + largCapa
  const vbA = margem * 2 + altCapa

  const xCapa = margem + esp
  const yCapa = margem
  const cx = xCapa + largCapa / 2
  const cy = yCapa + altCapa / 2

  const corCapa = c.corCapa || '#6B4226'
  const escuro = luminancia(corCapa) < 0.45

  // Cor da lombada (mais escura)
  const lomR = Math.max(0, parseInt(corCapa.slice(1,3),16) - 30)
  const lomG = Math.max(0, parseInt(corCapa.slice(3,5),16) - 30)
  const lomB = Math.max(0, parseInt(corCapa.slice(5,7),16) - 30)
  const corLombada = `rgb(${lomR},${lomG},${lomB})`

  const corTexto = escuro ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)'

  return (
    <svg
      viewBox={`0 0 ${vbL} ${vbA}`}
      width={tamanho}
      height={tamanho * (vbA / vbL)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad-capa" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="white" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.08"/>
        </linearGradient>
        <linearGradient id="grad-lom" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="black" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.05"/>
        </linearGradient>
        <filter id="sombra-mini">
          <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.25"/>
        </filter>
      </defs>

      {/* Sombra */}
      <rect
        x={xCapa + 3} y={yCapa + 3}
        width={largCapa} height={altCapa}
        rx={raioCanto} fill="rgba(0,0,0,0.15)"
      />

      {/* Lombada */}
      <rect
        x={margem} y={yCapa}
        width={esp} height={altCapa}
        rx={raioCanto}
        fill={corLombada}
      />
      <rect
        x={margem} y={yCapa}
        width={esp} height={altCapa}
        rx={raioCanto}
        fill="url(#grad-lom)"
      />

      {/* Capa */}
      <rect
        x={xCapa} y={yCapa}
        width={largCapa} height={altCapa}
        rx={raioCanto}
        fill={corCapa}
      />
      <rect
        x={xCapa} y={yCapa}
        width={largCapa} height={altCapa}
        rx={raioCanto}
        fill="url(#grad-capa)"
      />

      {/* Textura material */}
      {c.materialCapa === 'kraft' && (
        <rect x={xCapa} y={yCapa} width={largCapa} height={altCapa} rx={raioCanto}
          fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"
          strokeDasharray="2 3"/>
      )}
      {c.materialCapa === 'tecido' && (
        <g opacity="0.15">
          {Array.from({length: 6}, (_,i) => (
            <line key={i} x1={xCapa} y1={yCapa + i * (altCapa/5)} x2={xCapa+largCapa} y2={yCapa + i * (altCapa/5)}
              stroke="black" strokeWidth="0.4"/>
          ))}
        </g>
      )}

      {/* Aplicações: metais */}
      {c.aplicacoesCapa?.includes('metais') && (
        <g stroke="#D4AF37" strokeWidth="0.8" fill="none" opacity="0.9">
          <path d={`M ${xCapa+2} ${yCapa+8} L ${xCapa+2} ${yCapa+2} L ${xCapa+9} ${yCapa+2}`}/>
          <path d={`M ${xCapa+largCapa-9} ${yCapa+2} L ${xCapa+largCapa-2} ${yCapa+2} L ${xCapa+largCapa-2} ${yCapa+8}`}/>
          <path d={`M ${xCapa+2} ${yCapa+altCapa-8} L ${xCapa+2} ${yCapa+altCapa-2} L ${xCapa+9} ${yCapa+altCapa-2}`}/>
          <path d={`M ${xCapa+largCapa-9} ${yCapa+altCapa-2} L ${xCapa+largCapa-2} ${yCapa+altCapa-2} L ${xCapa+largCapa-2} ${yCapa+altCapa-8}`}/>
        </g>
      )}

      {/* Renda */}
      {c.aplicacoesCapa?.includes('renda') && (
        <rect x={xCapa+2} y={yCapa+2} width={largCapa-4} height={altCapa-4}
          rx={raioCanto} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="1.5 2"/>
      )}

      {/* Gravação */}
      {c.nomeGravado && c.gravacaoCapa !== 'nenhuma' && (
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={Math.min(largCapa / 8, 8)}
          fontFamily="Georgia, serif"
          letterSpacing="0.1em"
          fill={c.gravacaoCapa === 'bordado' ? (c.corBordado || '#F5DFA0') : corTexto}
          opacity="0.9"
        >
          {c.nomeGravado.slice(0, 16)}
        </text>
      )}

      {/* Elástico */}
      {c.elasticoAtivo && (
        c.posicaoElastico === 'vertical'
          ? <line x1={cx} y1={yCapa - 1} x2={cx} y2={yCapa + altCapa + 1}
              stroke={c.corElastico || '#1A1A1A'} strokeWidth="1.5" opacity="0.85"/>
          : <line x1={xCapa - 1} y1={cy} x2={xCapa + largCapa + 1} y2={cy}
              stroke={c.corElastico || '#1A1A1A'} strokeWidth="1.5" opacity="0.85"/>
      )}

      {/* Marcador / fitilho */}
      {c.marcadorAtivo && (
        <line
          x1={cx + largCapa * 0.2} y1={yCapa}
          x2={cx + largCapa * 0.2} y2={yCapa + altCapa + 6}
          stroke={c.corMarcador || '#C4713C'}
          strokeWidth="1.5" opacity="0.9"
        />
      )}

      {/* Borda pintada */}
      {c.pinturaBordasAtiva && (
        <rect x={xCapa} y={yCapa} width={largCapa} height={altCapa} rx={raioCanto}
          fill="none" stroke={c.corPinturaBordas || '#C4713C'} strokeWidth="2" opacity="0.7"/>
      )}

      {/* Costura na lombada */}
      {(c.tipoEncadernacao === 'copta' || c.tipoEncadernacao === 'francesa-cruzada') && (
        Array.from({ length: Math.floor(altCapa / 10) }, (_, i) => (
          <line key={i}
            x1={margem + esp / 2 - 2} y1={yCapa + 8 + i * 10}
            x2={margem + esp / 2 + 2} y2={yCapa + 8 + i * 10}
            stroke={c.corFio || '#E8D5B7'} strokeWidth="0.8" opacity="0.7"
          />
        ))
      )}
    </svg>
  )
}
