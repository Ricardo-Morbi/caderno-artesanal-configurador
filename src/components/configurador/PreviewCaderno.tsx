'use client'

import { useState, useRef, useEffect } from 'react'
import { LazyMotion, m as motion, AnimatePresence } from 'framer-motion'

const loadFeatures = () => import('@/lib/motion-features').then(r => r.default)
import { useCadernoStore } from '@/store/useCadernoStore'
import { getPerguntasVisiveis } from '@/data/perguntas'

// Mapa: qual página focar por pergunta do miolo
const PAGINA_FOCO: Record<string, 'guarda' | 'miolo' | 'ambas'> = {
  temaCaderno:             'miolo',
  temaPersonalizado:       'miolo',
  padraoPaginas:           'miolo',
  'extras-afetivos':       'guarda',
  frasePersonalizada:      'miolo',
  datasPersonalizadas:     'miolo',
  formato:                 'ambas',
  tipoPapel:               'miolo',
  graturaPapel:            'miolo',
  tamanho:                 'ambas',
  subtamanhoPersonalizado: 'ambas',
  espessura:               'ambas',
  folhasColoridas:         'miolo',
  corFolhasColoridas:      'miolo',
  materialGuarda:          'guarda',
  corGuarda:               'guarda',
  padraoGuardaEstampado:   'guarda',
  tipoCorteEspecial:       'miolo',
  tipoCantos:              'ambas',
  pinturaBordasAtiva:      'miolo',
  corPinturaBordas:        'miolo',
}

type Modo = 'fechado' | 'aberto'

const PROPORCAO_POR_FORMATO: Record<string, { fL: number; fA: number }> = {
  retrato:  { fL: 1,   fA: 1.4 },
  paisagem: { fL: 1.4, fA: 1   },
  quadrado: { fL: 1,   fA: 1   },
}
const PROPORCAO_PERSONALIZADO: Record<string, { fL: number; fA: number }> = {
  'quadrado-15x15': { fL: 1.0, fA: 1.0 },
  'longer-10x25':   { fL: 0.4, fA: 1.0 },
}

// Espessura do livro em CSS px (para o box 3D)
const ESPESSURA_CSS: Record<string, number> = {
  fino: 16, medio: 28, grosso: 42, 'extra-grosso': 58,
}

// Espessura em coordenadas SVG (para VistaAberto)
const ESPESSURA_SVG: Record<string, number> = {
  fino: 14, medio: 22, grosso: 32, 'extra-grosso': 44,
}

// ─── Helpers ──────────────────────────────────────────────────

function luminancia(hex: string): number {
  if (!hex.startsWith('#') || hex.length < 7) return 0.5
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function calcularCY(posicao: string, cy: number, altura: number): number {
  switch (posicao) {
    case 'terco-superior':    return cy - altura * 0.28
    case 'terco-inferior':    return cy + altura * 0.28
    case 'canto-inf-direito': return cy + altura * 0.38
    default:                  return cy
  }
}

// ─── GravacaoCapa ─────────────────────────────────────────────
function GravacaoCapa({ texto, tipo, posicao, cx, cy, largura, altura, corCapa, corBordado, tipoTipografia }: {
  texto: string; tipo: string; posicao: string
  cx: number; cy: number; largura: number; altura: number; corCapa: string
  corBordado?: string; tipoTipografia?: string
}) {
  if (!texto || tipo === 'nenhuma') return null
  const lum = corCapa.startsWith('#') ? luminancia(corCapa) : 0.5
  const ehEscuro = lum < 0.45
  const textCY = calcularCY(posicao, cy, altura)
  const textCX = posicao === 'canto-inf-direito' ? cx + largura * 0.28 : cx
  const anchor  = posicao === 'canto-inf-direito' ? 'end' : 'middle'
  const palavras = texto.split(' ')
  const linhas: string[] = []
  let linhaAtual = ''
  for (const p of palavras) {
    if ((linhaAtual + ' ' + p).trim().length > 18) { linhas.push(linhaAtual.trim()); linhaAtual = p }
    else linhaAtual = (linhaAtual + ' ' + p).trim()
  }
  if (linhaAtual) linhas.push(linhaAtual.trim())
  const fontSize = posicao === 'canto-inf-direito' ? Math.min(largura / 14, 7) : Math.min(largura / 10, 10)
  const lineHeight = fontSize * 1.6
  const yInicio = textCY - (linhas.length * lineHeight) / 2 + lineHeight / 2

  const fontFamily = tipoTipografia === 'sans-serif' ? 'system-ui, sans-serif'
    : tipoTipografia === 'script'     ? 'cursive'
    : tipoTipografia === 'monoespaco' ? 'monospace'
    : 'Georgia, serif'

  if (tipo === 'baixo-relevo') {
    const corTexto = ehEscuro ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.22)'
    const corSombra = ehEscuro ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.75)'
    return (
      <g>
        <defs>
          <filter id="br-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0.6" dy="0.8" stdDeviation="0.4" floodColor={corSombra} floodOpacity="1"/>
          </filter>
        </defs>
        {linhas.map((l, i) => (
          <text key={i} x={textCX} y={yInicio + i * lineHeight}
            textAnchor={anchor} dominantBaseline="middle"
            fontSize={fontSize} fontFamily={fontFamily} letterSpacing="0.12em"
            fill={corTexto} filter="url(#br-filter)">{l}</text>
        ))}
      </g>
    )
  }

  if (tipo === 'baixo-relevo-foil') {
    // Hot stamping dourado — gradiente metálico simulado com camadas
    const foilId = `foil-${Math.abs(textCX | 0)}`
    return (
      <g>
        <defs>
          <linearGradient id={foilId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#FFF0A0" stopOpacity="1" />
            <stop offset="30%"  stopColor="#D4AF37" stopOpacity="1" />
            <stop offset="55%"  stopColor="#F5DFA0" stopOpacity="1" />
            <stop offset="80%"  stopColor="#A0860A" stopOpacity="1" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* Sombra embassada */}
        {linhas.map((l, i) => <text key={`s${i}`} x={textCX+0.6} y={yInicio+i*lineHeight+0.8}
          textAnchor={anchor} dominantBaseline="middle" fontSize={fontSize}
          fontFamily={fontFamily} letterSpacing="0.12em" fill="rgba(80,50,0,0.5)">{l}</text>)}
        {/* Texto com gradiente dourado */}
        {linhas.map((l, i) => <text key={i} x={textCX} y={yInicio+i*lineHeight}
          textAnchor={anchor} dominantBaseline="middle" fontSize={fontSize}
          fontFamily={fontFamily} letterSpacing="0.12em" fill={`url(#${foilId})`}>{l}</text>)}
        {/* Reflexo branco fino no topo */}
        {linhas.map((l, i) => <text key={`r${i}`} x={textCX} y={yInicio+i*lineHeight-0.3}
          textAnchor={anchor} dominantBaseline="middle" fontSize={fontSize * 0.35}
          fontFamily={fontFamily} letterSpacing="0.12em"
          fill="rgba(255,255,255,0.55)">{l}</text>)}
      </g>
    )
  }

  if (tipo === 'bordado') {
    const corFioPrincipal = corBordado || (ehEscuro ? '#F5DFA0' : '#7B2D2D')
    const corFioSombra    = 'rgba(0,0,0,0.4)'
    const corFioHL        = 'rgba(255,255,255,0.35)'
    const largTexto = Math.min(texto.length * fontSize * 0.6, largura * 0.7)
    return (
      <g>
        {linhas.map((l, i) => {
          const y = yInicio + i * lineHeight
          const xE = textCX - largTexto/2; const xD = textCX + largTexto/2
          return (
            <g key={i}>
              {i === 0 && <line x1={xE} y1={y-fontSize*1.1} x2={xD} y2={y-fontSize*1.1}
                stroke={corFioPrincipal} strokeWidth="0.5" strokeDasharray="1.5 1.2" opacity="0.5" strokeLinecap="round"/>}
              <text x={textCX+0.7} y={y+1} textAnchor={anchor} dominantBaseline="middle"
                fontSize={fontSize} fontFamily={fontFamily} letterSpacing="0.1em"
                fill="none" stroke={corFioSombra} strokeWidth={2.8} strokeLinecap="round">{l}</text>
              <text x={textCX} y={y} textAnchor={anchor} dominantBaseline="middle"
                fontSize={fontSize} fontFamily={fontFamily} letterSpacing="0.1em"
                fill="none" stroke={corFioPrincipal} strokeWidth={2} strokeLinecap="round">{l}</text>
              <text x={textCX} y={y} textAnchor={anchor} dominantBaseline="middle"
                fontSize={fontSize} fontFamily={fontFamily} letterSpacing="0.1em"
                fill="none" stroke={corFioPrincipal} strokeWidth={1.2}
                strokeDasharray="1.8 1.4" strokeLinecap="round" opacity="0.9">{l}</text>
              <text x={textCX-0.3} y={y-0.5} textAnchor={anchor} dominantBaseline="middle"
                fontSize={fontSize} fontFamily={fontFamily} letterSpacing="0.1em"
                fill="none" stroke={corFioHL} strokeWidth={0.6} strokeLinecap="round" opacity="0.7">{l}</text>
            </g>
          )
        })}
      </g>
    )
  }
  return null
}

// ─── AplicacoesCapa ───────────────────────────────────────────
function AplicacoesCapa({ aplicacoes, cx, cy, largura, altura, raioCanto }: {
  aplicacoes: string[]; cx: number; cy: number
  largura: number; altura: number; raioCanto: number
}) {
  if (!aplicacoes || aplicacoes.length === 0) return null
  return (
    <g opacity="0.85">
      {aplicacoes.includes('metais') && (
        <g stroke="#D4AF37" strokeWidth="1.2" fill="none">
          <path d={`M ${cx-largura/2+2} ${cy-altura/2+10} L ${cx-largura/2+2} ${cy-altura/2+2} L ${cx-largura/2+12} ${cy-altura/2+2}`}/>
          <path d={`M ${cx+largura/2-12} ${cy-altura/2+2} L ${cx+largura/2-2} ${cy-altura/2+2} L ${cx+largura/2-2} ${cy-altura/2+10}`}/>
          <path d={`M ${cx-largura/2+2} ${cy+altura/2-10} L ${cx-largura/2+2} ${cy+altura/2-2} L ${cx-largura/2+12} ${cy+altura/2-2}`}/>
          <path d={`M ${cx+largura/2-12} ${cy+altura/2-2} L ${cx+largura/2-2} ${cy+altura/2-2} L ${cx+largura/2-2} ${cy+altura/2-10}`}/>
        </g>
      )}
      {aplicacoes.includes('renda') && (
        <rect x={cx-largura/2+3} y={cy-altura/2+3} width={largura-6} height={altura-6}
          rx={raioCanto} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="1.5 2"/>
      )}
      {aplicacoes.includes('botoes') && (
        <g>
          <circle cx={cx} cy={cy+altura/2-12} r={5} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
          <circle cx={cx} cy={cy+altura/2-12} r={2.5} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8"/>
          <circle cx={cx-2} cy={cy+altura/2-13} r={0.6} fill="rgba(255,255,255,0.7)"/>
          <circle cx={cx+2} cy={cy+altura/2-13} r={0.6} fill="rgba(255,255,255,0.7)"/>
          <circle cx={cx-2} cy={cy+altura/2-11} r={0.6} fill="rgba(255,255,255,0.7)"/>
          <circle cx={cx+2} cy={cy+altura/2-11} r={0.6} fill="rgba(255,255,255,0.7)"/>
        </g>
      )}
      {aplicacoes.includes('recortes') && (
        <g fill="rgba(0,0,0,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5">
          <circle cx={cx-largura/2+8} cy={cy} r={3}/>
          <circle cx={cx+largura/2-8} cy={cy} r={3}/>
        </g>
      )}
      {aplicacoes.includes('pespontos') && (
        <rect
          x={cx-largura/2+6} y={cy-altura/2+6}
          width={largura-12} height={altura-12}
          rx={raioCanto} fill="none"
          stroke="rgba(255,255,255,0.65)" strokeWidth="1.2"
          strokeDasharray="3 3"
        />
      )}
    </g>
  )
}

// ─── Padrão de página para vista aberta ───────────────────────
function renderPadraoPaginaOffset(padrao: string, largura: number, altura: number) {
  switch (padrao) {
    case 'pautado':
      return Array.from({ length: Math.floor((altura - 20) / 12) }, (_, i) => (
        <line key={i} x1={8} y1={16 + i * 12} x2={largura - 8} y2={16 + i * 12}
          stroke="#C4A08A" strokeWidth="0.5" opacity="0.6"/>
      ))
    case 'pontilhado':
      return Array.from({ length: Math.floor((altura - 20) / 12) }, (_, row) =>
        Array.from({ length: Math.floor((largura - 16) / 10) }, (_, col) => (
          <circle key={`${row}-${col}`} cx={12 + col * 10} cy={16 + row * 12}
            r="0.8" fill="#C4A08A" opacity="0.5"/>
        ))
      ).flat()
    default: return null
  }
}

// ─── Vista Aberta ─────────────────────────────────────────────
function VistaAberto({
  larguraCapa, alturaCapa, espessuraLombada, raioCanto,
  corCapa, corInternaFolhas, corBordaPages,
  padraoPaginas, tipoEncadernacao, corFio,
  marcadorAtivo, corMarcador, pinturaBordasAtiva, corPinturaBordas,
  materialGuarda, corGuarda, padraoGuarda, bolsoInterno,
  tipoPapel, envelopeAcoplado, paginaDedicatoria, paginaFoco,
  folhasColoridas, corFolhasColoridas, spread = 0,
}: {
  larguraCapa: number; alturaCapa: number; espessuraLombada: number; raioCanto: number
  corCapa: string; corInternaFolhas: string; corBordaPages: string
  padraoPaginas: string; tipoEncadernacao: string; corFio: string
  marcadorAtivo: boolean; corMarcador: string; pinturaBordasAtiva: boolean; corPinturaBordas: string
  materialGuarda: string; corGuarda: string; padraoGuarda: string; bolsoInterno: boolean
  tipoPapel: string; envelopeAcoplado: boolean; paginaDedicatoria: boolean
  paginaFoco: 'guarda' | 'miolo' | 'ambas'
  folhasColoridas?: boolean; corFolhasColoridas?: string
  spread?: number
}) {
  // spread=0: guarda + primeira pg | spread=1: miolo-miolo | spread=2: última pg + guarda posterior
  const isGuardaEsq = spread === 0    // página esq = guarda anterior
  const isGuardaDir = spread === 2    // página dir = guarda posterior
  const margem = 24
  const lombadaVis = espessuraLombada * 0.7
  const pagLarg = larguraCapa * 0.82
  const pagAlt = alturaCapa
  const vbLarg = margem * 2 + pagLarg * 2 + lombadaVis
  const vbAlt  = pagAlt + margem * 2
  const xEsq = margem; const xDir = margem + pagLarg + lombadaVis; const yPag = margem
  return (
    <motion.svg key="aberto" viewBox={`0 0 ${vbLarg} ${vbAlt}`}
      width={Math.min(vbLarg * 1.5, 380)} height={Math.min(vbAlt * 1.5, 320)}
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
      <defs>
        {padraoPaginas === 'quadriculado' && (
          <pattern id="grid-ab" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#C4A08A" strokeWidth="0.4" opacity="0.5"/>
          </pattern>
        )}
        <linearGradient id="sombra-c" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="black" stopOpacity="0.06"/>
          <stop offset="40%" stopColor="black" stopOpacity="0.0"/>
        </linearGradient>
        <linearGradient id="sombra-cd" x1="0" y1="0" x2="1" y2="0">
          <stop offset="60%" stopColor="black" stopOpacity="0.0"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.06"/>
        </linearGradient>
        <linearGradient id="refl-p" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="white" stopOpacity="0.0"/>
        </linearGradient>
      </defs>
      {/* ── Cor da guarda (página esquerda = guarda anterior) ── */}
      {(() => {
        const corG = materialGuarda === 'colorida' ? corGuarda
          : materialGuarda === 'kraft' ? '#C4A07A'
          : materialGuarda === 'marmorizada' ? '#E8E4DF'
          : corInternaFolhas
        return (
          <>
            <rect x={xEsq+3} y={yPag+3} width={pagLarg} height={pagAlt} rx={raioCanto} fill="rgba(0,0,0,0.08)"/>
            <rect x={xEsq} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto} fill={corBordaPages}/>
            <rect x={xEsq} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto} fill={corG}/>
            {/* Padrão da guarda */}
            {materialGuarda === 'marmorizada' && (
              <g transform={`translate(${xEsq},${yPag})`} clipPath="url(#clip-esq)">
                <defs><clipPath id="clip-esq"><rect width={pagLarg} height={pagAlt} rx={raioCanto}/></clipPath></defs>
                {[0.18,0.34,0.5,0.65,0.8].map((t,i) => (
                  <path key={i}
                    d={`M ${pagLarg*(-0.1+t*0.2)} 0 Q ${pagLarg*(t+0.1)} ${pagAlt*0.5} ${pagLarg*(t-0.05)} ${pagAlt}`}
                    fill="none" stroke={i%2===0 ? 'rgba(150,140,130,0.35)' : 'rgba(200,195,190,0.25)'} strokeWidth={i%2===0?1.5:0.8}/>
                ))}
              </g>
            )}
            {materialGuarda === 'kraft' && (
              <g transform={`translate(${xEsq},${yPag})`}>
                {Array.from({length: Math.floor(pagLarg*pagAlt/180)}, (_,i) => (
                  <circle key={i} cx={Math.random()*pagLarg} cy={Math.random()*pagAlt}
                    r={0.7} fill="rgba(120,80,40,0.2)"/>
                ))}
              </g>
            )}
            {materialGuarda === 'estampada' && padraoGuarda === 'floral' && (
              <g transform={`translate(${xEsq},${yPag})`} opacity={0.25}>
                {[[pagLarg*0.25,pagAlt*0.3],[pagLarg*0.7,pagAlt*0.2],[pagLarg*0.45,pagAlt*0.65],[pagLarg*0.8,pagAlt*0.75]].map(([cx,cy],i) => (
                  <g key={i} transform={`translate(${cx},${cy})`}>
                    {[0,60,120,180,240,300].map((a,j) => {
                      const rad = a*Math.PI/180
                      return <ellipse key={j} cx={Math.cos(rad)*7} cy={Math.sin(rad)*7} rx={4} ry={2.5}
                        fill="#6B4226" transform={`rotate(${a} ${Math.cos(rad)*7} ${Math.sin(rad)*7})`}/>
                    })}
                    <circle r={2.5} fill="#6B4226"/>
                  </g>
                ))}
              </g>
            )}
            {materialGuarda === 'estampada' && padraoGuarda === 'geometrico' && (
              <g transform={`translate(${xEsq},${yPag})`} opacity={0.18}>
                {Array.from({length: Math.floor(pagLarg/14)}, (_,col) =>
                  Array.from({length: Math.floor(pagAlt/14)}, (_,row) => (
                    <rect key={`${col}-${row}`} x={col*14+2} y={row*14+2} width={10} height={10}
                      fill="none" stroke="#6B4226" strokeWidth={0.6}/>
                  ))
                )}
              </g>
            )}
            {/* Aquarela — manchas sobrepostas com cores translúcidas */}
            {materialGuarda === 'estampada' && padraoGuarda === 'aquarela' && (
              <g transform={`translate(${xEsq},${yPag})`} opacity={0.28}>
                {([
                  [pagLarg*0.22, pagAlt*0.22, pagLarg*0.20, pagAlt*0.13, '#6B9EC4'],
                  [pagLarg*0.62, pagAlt*0.16, pagLarg*0.24, pagAlt*0.15, '#C46B9E'],
                  [pagLarg*0.38, pagAlt*0.55, pagLarg*0.28, pagAlt*0.17, '#7EC46B'],
                  [pagLarg*0.74, pagAlt*0.62, pagLarg*0.18, pagAlt*0.13, '#C4A06B'],
                  [pagLarg*0.15, pagAlt*0.72, pagLarg*0.22, pagAlt*0.14, '#6BC4C4'],
                  [pagLarg*0.50, pagAlt*0.38, pagLarg*0.16, pagAlt*0.11, '#C4C46B'],
                ] as [number,number,number,number,string][]).map(([cx,cy,rx,ry,fill], i) => (
                  <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry}
                    fill={fill} opacity={0.38}/>
                ))}
              </g>
            )}
            {/* Guarda — sem dedicatória (fica na primeira página) */}
            {marcadorAtivo && <rect x={xEsq+pagLarg*0.45} y={yPag} width={2} height={pagAlt+16} fill={corMarcador} rx={1} opacity={0.8}/>}
            {pinturaBordasAtiva && <rect x={xEsq+1} y={yPag+1} width={pagLarg-2} height={pagAlt-2} rx={raioCanto} fill="none" stroke={corPinturaBordas} strokeWidth={1.5} opacity={0.5}/>}
            <rect x={xEsq} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto} fill="url(#sombra-c)"/>
            <rect x={xEsq} y={yPag} width={pagLarg} height={pagAlt*0.35} rx={raioCanto} fill="url(#refl-p)"/>
            {/* Label de identificação — guarda */}
            <text x={xEsq + pagLarg*0.5} y={yPag + 7}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="4" fill="rgba(160,130,90,0.45)" fontFamily="Georgia, serif" letterSpacing="0.2em">
              GUARDA
            </text>
          </>
        )
      })()}
      {/* Lombada central */}
      <rect x={xEsq+pagLarg} y={yPag} width={lombadaVis} height={pagAlt} fill={corCapa} opacity={0.9}/>
      {tipoEncadernacao !== 'espiral' && Array.from({ length: Math.floor(pagAlt/14) }, (_, i) => (
        <line key={i} x1={xEsq+pagLarg+lombadaVis*0.3} y1={yPag+6+i*14}
          x2={xEsq+pagLarg+lombadaVis*0.7} y2={yPag+6+i*14}
          stroke={corFio} strokeWidth="0.8" strokeLinecap="round" opacity="0.7"/>
      ))}
      {tipoEncadernacao === 'espiral' && Array.from({ length: Math.floor(pagAlt/10) }, (_, i) => (
        <ellipse key={i} cx={xEsq+pagLarg+lombadaVis/2} cy={yPag+5+i*10}
          rx={lombadaVis*0.45} ry={3.5} fill="none" stroke={corFio} strokeWidth="1" opacity="0.7"/>
      ))}
      <rect x={xEsq+pagLarg} y={yPag} width={lombadaVis} height={pagAlt} fill="rgba(0,0,0,0.12)"/>
      {/* Página direita */}
      <rect x={xDir+3} y={yPag+3} width={pagLarg} height={pagAlt} rx={raioCanto} fill="rgba(0,0,0,0.08)"/>
      <rect x={xDir} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto} fill={corBordaPages}/>
      <rect x={xDir} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto} fill={corInternaFolhas}/>
      {/* No spread=2 (última folhada), página direita é guarda posterior */}
      {isGuardaDir && (() => {
        const corG = materialGuarda === 'colorida' ? corGuarda
          : materialGuarda === 'kraft' ? '#C4A07A'
          : materialGuarda === 'marmorizada' ? '#E8E4DF'
          : corInternaFolhas
        return <rect x={xDir} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto} fill={corG}/>
      })()}
      {!isGuardaDir && (
      <g transform={`translate(${xDir},${yPag})`}>
        {padraoPaginas === 'quadriculado'
          ? <rect width={pagLarg} height={pagAlt} fill="url(#grid-ab)" rx={raioCanto}/>
          : renderPadraoPaginaOffset(padraoPaginas, pagLarg, pagAlt)}
      </g>
      )}
      {/* Textura de papel do miolo */}
      {tipoPapel === 'polen' && (
        <g transform={`translate(${xDir},${yPag})`}>
          <rect width={pagLarg} height={pagAlt} rx={raioCanto} fill="rgba(245,238,215,0.22)"/>
          {Array.from({length: 40}, (_,i) => (
            <circle key={i}
              cx={(Math.sin(i*17.3)*0.5+0.5)*pagLarg}
              cy={(Math.cos(i*13.7)*0.5+0.5)*pagAlt}
              r={0.6} fill="rgba(200,175,120,0.18)"/>
          ))}
        </g>
      )}
      {tipoPapel === 'reciclado' && (
        <g transform={`translate(${xDir},${yPag})`}>
          <rect width={pagLarg} height={pagAlt} rx={raioCanto} fill="rgba(205,195,182,0.20)"/>
          {Array.from({length: 38}, (_,i) => {
            const x = (Math.sin(i*19.1)*0.5+0.5)*pagLarg
            const y = (Math.cos(i*11.3)*0.5+0.5)*pagAlt
            const a = (i*53) % 180
            return <line key={i} x1={x} y1={y}
              x2={x+Math.cos(a*Math.PI/180)*3.5} y2={y+Math.sin(a*Math.PI/180)*3.5}
              stroke="rgba(90,70,50,0.22)" strokeWidth="0.7" strokeLinecap="round"/>
          })}
        </g>
      )}
      {tipoPapel === 'vegetal' && (
        <g transform={`translate(${xDir},${yPag})`}>
          <rect width={pagLarg} height={pagAlt} rx={raioCanto} fill="rgba(225,232,238,0.18)"/>
          <rect width={pagLarg} height={pagAlt} rx={raioCanto}
            fill="none" stroke="rgba(195,208,215,0.28)" strokeWidth="0.5"/>
        </g>
      )}
      {/* Folhas coloridas intercaladas — tiras na borda direita da página */}
      {folhasColoridas && corFolhasColoridas && (() => {
        const numTiras = 7
        const tiraH = pagAlt / (numTiras * 2 + 1)
        return (
          <g>
            {Array.from({ length: numTiras }, (_, i) => (
              <rect key={i}
                x={xDir + pagLarg - 3} y={yPag + tiraH * (i * 2 + 1)}
                width={4} height={tiraH * 0.85}
                rx={0.5} fill={corFolhasColoridas} opacity={0.75}/>
            ))}
          </g>
        )
      })()}
      {/* Bolso e envelope ficam na contracapa (FaceVerso) — não na primeira página */}
      {/* Página de dedicatória — moldura na primeira página do miolo */}
      {paginaDedicatoria && (
        <g>
          <rect x={xDir + pagLarg*0.09} y={yPag + pagAlt*0.09}
            width={pagLarg*0.82} height={pagAlt*0.82}
            rx={raioCanto*0.5} fill="none"
            stroke="rgba(160,130,90,0.38)" strokeWidth="0.8"/>
          <rect x={xDir + pagLarg*0.13} y={yPag + pagAlt*0.13}
            width={pagLarg*0.74} height={pagAlt*0.74}
            rx={raioCanto*0.3} fill="none"
            stroke="rgba(160,130,90,0.22)" strokeWidth="0.4" strokeDasharray="2 1.5"/>
          {([
            [xDir+pagLarg*0.09, yPag+pagAlt*0.09],
            [xDir+pagLarg*0.91, yPag+pagAlt*0.09],
            [xDir+pagLarg*0.09, yPag+pagAlt*0.91],
            [xDir+pagLarg*0.91, yPag+pagAlt*0.91],
          ] as [number,number][]).map(([cx,cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={2} fill="rgba(160,130,90,0.42)"/>
              <circle cx={cx} cy={cy} r={4} fill="none" stroke="rgba(160,130,90,0.22)" strokeWidth="0.5"/>
            </g>
          ))}
          <text x={xDir + pagLarg*0.5} y={yPag + pagAlt*0.5}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="5" fill="rgba(140,110,80,0.48)" fontFamily="Georgia, serif" letterSpacing="0.18em">
            dedicatória
          </text>
        </g>
      )}
      {pinturaBordasAtiva && <rect x={xDir+1} y={yPag+1} width={pagLarg-2} height={pagAlt-2} rx={raioCanto} fill="none" stroke={corPinturaBordas} strokeWidth={1.5} opacity={0.5}/>}
      <rect x={xDir} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto} fill="url(#sombra-cd)"/>
      <rect x={xDir} y={yPag} width={pagLarg} height={pagAlt*0.35} rx={raioCanto} fill="url(#refl-p)"/>
      {/* Label de identificação — primeira página */}
      <text x={xDir + pagLarg*0.5} y={yPag + 7}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="4" fill="rgba(130,110,80,0.38)" fontFamily="Georgia, serif" letterSpacing="0.2em">
        1ª PÁGINA
      </text>

      {/* ── Highlight de foco: ilumina a página relevante à pergunta atual ── */}
      {paginaFoco === 'guarda' && (
        <>
          {/* Dim na página direita */}
          <rect x={xDir} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto}
            fill="rgba(255,255,255,0.35)" style={{ pointerEvents: 'none' }}/>
          {/* Ring dourado na página esquerda */}
          <motion.rect
            key={`foco-guarda`}
            x={xEsq} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto}
            fill="none" stroke="#C9A84C" strokeWidth={1.5}
            initial={{ opacity: 0, strokeWidth: 3 }}
            animate={{ opacity: 0.7, strokeWidth: 1.5 }}
            transition={{ duration: 0.4 }}
            style={{ pointerEvents: 'none' }}/>
        </>
      )}
      {paginaFoco === 'miolo' && (
        <>
          {/* Dim na página esquerda */}
          <rect x={xEsq} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto}
            fill="rgba(255,255,255,0.35)" style={{ pointerEvents: 'none' }}/>
          {/* Ring dourado na página direita */}
          <motion.rect
            key={`foco-miolo`}
            x={xDir} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto}
            fill="none" stroke="#C9A84C" strokeWidth={1.5}
            initial={{ opacity: 0, strokeWidth: 3 }}
            animate={{ opacity: 0.7, strokeWidth: 1.5 }}
            transition={{ duration: 0.4 }}
            style={{ pointerEvents: 'none' }}/>
        </>
      )}
    </motion.svg>
  )
}

// ─── Costuras na lombada (Face Spine) ─────────────────────────
function Costura({ tipoEncadernacao, corFio, W, H }: {
  tipoEncadernacao: string; corFio: string; W: number; H: number
}) {
  const n = (interval: number) => Math.max(2, Math.floor((H - 10) / interval))

  // LONG STITCH: linhas horizontais paralelas atravessando toda a lombada
  // Fiel à foto 1 — couro com fio vermelho em linhas uniformes borda-a-borda
  if (tipoEncadernacao === 'long-stitch') {
    const rows = n(14)
    const step = (H - 10) / rows
    return (
      <g stroke={corFio} strokeLinecap="square" fill="none">
        {/* Bordas laterais da capa (onde o fio entra/sai) */}
        <rect x={0} y={0} width={W*0.07} height={H} fill="rgba(0,0,0,0.12)"/>
        <rect x={W*0.93} y={0} width={W*0.07} height={H} fill="rgba(0,0,0,0.12)"/>
        {Array.from({ length: rows + 1 }, (_, i) => {
          const y = 5 + i * step
          return (
            <g key={i}>
              {/* Linha principal — atravessa toda a lombada */}
              <line x1={W*0.07} y1={y} x2={W*0.93} y2={y} strokeWidth="1.5"/>
              {/* Furo de entrada na capa esquerda */}
              <rect x={W*0.03} y={y-1} width={W*0.06} height={2} fill={corFio} stroke="none"/>
              {/* Furo de entrada na capa direita */}
              <rect x={W*0.91} y={y-1} width={W*0.06} height={2} fill={corFio} stroke="none"/>
            </g>
          )
        })}
      </g>
    )
  }

  // COPTA: cadernos encadeados com fio horizontal + nós de link entre seções
  // Fiel à foto 2 — fios coloridos em chain-link com pontos de ancoragem visíveis
  if (tipoEncadernacao === 'copta') {
    const sections = n(18)
    const sH = (H - 10) / sections
    return (
      <g strokeLinecap="round" fill="none">
        {Array.from({ length: sections }, (_, i) => {
          const y0 = 5 + i * sH
          const ym = y0 + sH / 2
          const y1 = y0 + sH
          // Alterna qual lado tem o link de corrente
          const linkX = i % 2 === 0 ? W * 0.28 : W * 0.72
          const otherX = i % 2 === 0 ? W * 0.72 : W * 0.28
          return (
            <g key={i}>
              {/* Fio horizontal da seção (caderno) */}
              <line x1={W*0.1} y1={ym} x2={W*0.9} y2={ym} stroke={corFio} strokeWidth="1.3"/>
              {/* Link de corrente para a próxima seção */}
              {i < sections - 1 && (
                <>
                  <path d={`M ${linkX} ${ym} Q ${linkX} ${y1} ${linkX} ${y1}`}
                    stroke={corFio} strokeWidth="1.1"/>
                  {/* Ponto de ancoragem visível */}
                  <circle cx={linkX} cy={y1} r="1.8" fill={corFio} stroke="none"/>
                </>
              )}
              {/* Pontos de ancoragem nos furos da lombada */}
              <circle cx={W*0.1} cy={ym} r="1.4" fill={corFio} stroke="none" opacity="0.9"/>
              <circle cx={W*0.9} cy={ym} r="1.4" fill={corFio} stroke="none" opacity="0.9"/>
              {/* Fio de retorno (cruzado, mais suave) */}
              <line x1={otherX} y1={ym-sH*0.15} x2={otherX} y2={ym+sH*0.15}
                stroke={corFio} strokeWidth="0.7" opacity="0.4"/>
            </g>
          )
        })}
      </g>
    )
  }

  // FRANCESA CRUZADA (French Link Stitch): padrão de losangos/X cruzados
  // Fiel à foto 3 — losangos formados por fios cruzando entre cadernos, com fita de tecido
  if (tipoEncadernacao === 'francesa-cruzada') {
    const sections = n(20)
    const sH = (H - 10) / sections
    const cols = Math.max(2, Math.floor(W / 7))
    const colW = W / cols
    return (
      <g stroke={corFio} strokeLinecap="round" fill="none">
        {/* Bandas de papel entre seções (efeito fita de tecido) */}
        {Array.from({ length: sections }, (_, i) => (
          i % 2 === 0
            ? <rect key={`bg${i}`} x={0} y={5+i*sH} width={W} height={sH}
                fill="rgba(180,160,140,0.18)" stroke="none"/>
            : null
        ))}
        {/* X cruzados formando losangos */}
        {Array.from({ length: sections - 1 }, (_, i) => {
          const y0 = 5 + i * sH + sH * 0.1
          const y1 = 5 + (i + 1) * sH - sH * 0.1
          return Array.from({ length: cols }, (_, c) => {
            const xc = (c + 0.5) * colW
            const xL = xc - colW * 0.38
            const xR = xc + colW * 0.38
            return (
              <g key={`${i}-${c}`}>
                <line x1={xL} y1={y0} x2={xR} y2={y1} strokeWidth="1.2"/>
                <line x1={xR} y1={y0} x2={xL} y2={y1} strokeWidth="1.2"/>
                {/* Nó no centro do X */}
                <circle cx={xc} cy={(y0+y1)/2} r="1" fill={corFio} stroke="none"/>
              </g>
            )
          })
        })}
        {/* Linhas de entrada horizontal em cada seção */}
        {Array.from({ length: sections + 1 }, (_, i) => (
          <line key={`h${i}`} x1={W*0.08} y1={5+i*sH} x2={W*0.92} y2={5+i*sH}
            strokeWidth="0.9" opacity="0.55"/>
        ))}
      </g>
    )
  }

  // WIRE-O: anéis metálicos duplos em forma de Ω
  if (tipoEncadernacao === 'wire-o') {
    const rows = n(13)
    const step = (H - 10) / rows
    return (
      <g fill="none">
        {Array.from({ length: rows + 1 }, (_, i) => {
          const cy = 5 + i * step
          const rx = W * 0.44
          return (
            <g key={i}>
              {/* Anel externo — metal escuro */}
              <ellipse cx={W/2} cy={cy} rx={rx} ry={4.5}
                stroke="rgba(90,90,100,0.85)" strokeWidth="2.2"/>
              {/* Reflexo superior — metal claro */}
              <path d={`M ${W/2-rx*0.9} ${cy-1} A ${rx*0.9} 3 0 0 1 ${W/2+rx*0.9} ${cy-1}`}
                stroke="rgba(210,210,220,0.7)" strokeWidth="0.9"/>
              {/* Sombra inferior */}
              <path d={`M ${W/2-rx*0.8} ${cy+3} A ${rx*0.8} 2.5 0 0 0 ${W/2+rx*0.8} ${cy+3}`}
                stroke="rgba(20,20,30,0.3)" strokeWidth="0.6"/>
              {/* Divisor central (duplo anel = duas espiras) */}
              <line x1={W/2-1} y1={cy-4} x2={W/2-1} y2={cy+4}
                stroke="rgba(60,60,70,0.6)" strokeWidth="0.8"/>
            </g>
          )
        })}
      </g>
    )
  }

  // BELGA: costura com seções dobradas expostas — linhas curvas entre cadernos
  if (tipoEncadernacao === 'belga') {
    const sections = n(22)
    const sH = (H - 10) / sections
    return (
      <g fill="none">
        {/* Fundo das seções expostas */}
        {Array.from({ length: sections }, (_, i) => {
          const y0 = 5 + i * sH
          return (
            <rect key={`bg${i}`} x={W*0.15} y={y0} width={W*0.7} height={sH}
              fill={i % 2 === 0 ? 'rgba(180,160,140,0.12)' : 'rgba(0,0,0,0)'}/>
          )
        })}
        {/* Fio cruzado entre seções */}
        {Array.from({ length: sections + 1 }, (_, i) => {
          const y = 5 + i * sH
          return (
            <g key={i}>
              <line x1={W*0.12} y1={y} x2={W*0.88} y2={y}
                stroke={corFio} strokeWidth="1.1" strokeLinecap="round"/>
              {/* Ponto central de ancoragem */}
              <circle cx={W*0.5} cy={y} r="1.5" fill={corFio} stroke="none" opacity="0.85"/>
              {/* Furos laterais */}
              <circle cx={W*0.12} cy={y} r="1.2" fill={corFio} stroke="none" opacity="0.75"/>
              <circle cx={W*0.88} cy={y} r="1.2" fill={corFio} stroke="none" opacity="0.75"/>
            </g>
          )
        })}
        {/* Fio vertical central (característica do belga) */}
        <line x1={W*0.5} y1={5} x2={W*0.5} y2={H-5}
          stroke={corFio} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.55"/>
      </g>
    )
  }

  // Costura padrão (brochura / sem tipo definido)
  return (
    <g stroke={corFio} strokeLinecap="round" fill="none">
      {Array.from({ length: n(12) }, (_, i) => (
        <line key={i} x1={W*0.15} y1={5+i*12} x2={W*0.85} y2={5+i*12} strokeWidth="1"/>
      ))}
    </g>
  )
}

// ─── Face: Frente (capa fechada) ──────────────────────────────
function FaceFrente({ W, H, corCapa, materialCapa, estampaCapa,
  gravacaoCapa, nomeGravado, posicaoGravacao, aplicacoesCapa,
  raioCanto, elasticoAtivo, corElastico, posicaoElastico,
  marcadorAtivo, tipoMarcador, corMarcador, larguraMarcador, quantidadeMarcadores,
  portaCaneta,
  pinturaBordasAtiva, corPinturaBordas,
  corBordado, tipoTipografia,
  tipoTextura, tipoLaminacao, abasOrelhas, tipoCantoneiras,
  papelEspecialId, linhoId,
}: {
  W: number; H: number; corCapa: string; materialCapa: string; estampaCapa: string
  gravacaoCapa: string; nomeGravado: string; posicaoGravacao: string; aplicacoesCapa: string[]
  raioCanto: number; elasticoAtivo: boolean; corElastico: string; posicaoElastico: string
  marcadorAtivo: boolean; tipoMarcador: string; corMarcador: string; larguraMarcador: string; quantidadeMarcadores?: number
  portaCaneta: boolean
  pinturaBordasAtiva: boolean; corPinturaBordas: string
  corBordado: string; tipoTipografia: string
  tipoTextura: string; tipoLaminacao: string; abasOrelhas: boolean; tipoCantoneiras: string
  papelEspecialId?: string; linhoId?: string
}) {
  const ehCouro = materialCapa === 'couro' || materialCapa === 'sintetico'
  // granulada força grain em qualquer material; lisa remove grain até do couro
  const useGrain = tipoTextura === 'granulada' || (tipoTextura !== 'lisa' && ehCouro)
  const lum = luminancia(corCapa)
  const veinColor = lum < 0.45 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'

  // Ribbon — só a pontinha saindo pela borda inferior, canto esquerdo
  const rW = larguraMarcador === '10mm' ? 8 : larguraMarcador === '7mm' ? 5.5 : larguraMarcador === 'largo' ? 8 : larguraMarcador === 'fino' ? 3.5 : 5.5
  const rX = W * 0.22   // canto inferior esquerdo
  const tipH = H         // altura da pontinha igual à altura da frente do caderno

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
      overflow="visible">
      <defs>
        {/* Material textures */}
        {materialCapa === 'linho' && (
          <pattern id="lf" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="4" y2="4" stroke={`${corCapa}55`} strokeWidth="0.6"/>
            <line x1="4" y1="0" x2="0" y2="4" stroke={`${corCapa}55`} strokeWidth="0.6"/>
          </pattern>
        )}
        {materialCapa === 'kraft' && (
          <pattern id="kf" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="0.9" fill={`${corCapa}35`}/>
          </pattern>
        )}
        {/* Material grain filter — couro/sintetico por padrão, ou forçado por tipoTextura */}
        {useGrain && (
          <filter id="grain-fr" x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.76 0.70" numOctaves="4" seed="5" result="pebble"/>
            <feDiffuseLighting in="pebble" lightingColor="white" surfaceScale="4.5" diffuseConstant="0.9" result="lit">
              <feDistantLight azimuth="130" elevation="46"/>
            </feDiffuseLighting>
            <feTurbulence type="fractalNoise" baseFrequency="1.9 1.7" numOctaves="2" seed="13" result="micro"/>
            <feColorMatrix type="saturate" values="0" in="micro" result="microGray"/>
            <feComposite in="lit" in2="microGray" operator="arithmetic" k1="0" k2="0.82" k3="0.18" k4="0" result="combined"/>
            <feBlend in="SourceGraphic" in2="combined" mode="soft-light"/>
          </filter>
        )}
        {/* Papel especial — clipPath para imagem real */}
        {materialCapa === 'papel-especial' && papelEspecialId && (
          <clipPath id="clip-papel-fr">
            <rect width={W} height={H} rx={raioCanto}/>
          </clipPath>
        )}
        {/* Linho — clipPath para imagem real */}
        {materialCapa === 'linho' && linhoId && (
          <clipPath id="clip-linho-fr">
            <rect width={W} height={H} rx={raioCanto}/>
          </clipPath>
        )}
        {/* Laminação brilho — gradiente especular forte */}
        {tipoLaminacao === 'brilho' && (
          <radialGradient id="brilho-fr" cx="25%" cy="12%" r="60%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="white" stopOpacity="0.60"/>
            <stop offset="30%"  stopColor="white" stopOpacity="0.22"/>
            <stop offset="70%"  stopColor="white" stopOpacity="0.05"/>
            <stop offset="100%" stopColor="white" stopOpacity="0.0"/>
          </radialGradient>
        )}
        {/* Lighting - radial from upper left */}
        <radialGradient id="luz-fr" cx="28%" cy="18%" r="88%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="white" stopOpacity="0.26"/>
          <stop offset="28%"  stopColor="white" stopOpacity="0.08"/>
          <stop offset="62%"  stopColor="black" stopOpacity="0.0"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.22"/>
        </radialGradient>
        <linearGradient id="bdir-fr" x1="0" y1="0" x2="1" y2="0">
          <stop offset="80%"  stopColor="black" stopOpacity="0.0"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.14"/>
        </linearGradient>
        <linearGradient id="htop-fr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="white" stopOpacity="0.3"/>
          <stop offset="12%" stopColor="white" stopOpacity="0.0"/>
        </linearGradient>
      </defs>

      {/* Base cover */}
      <rect width={W} height={H} rx={raioCanto}
        fill={corCapa}
        filter={useGrain ? 'url(#grain-fr)' : undefined}/>

      {/* Material overlay */}
      {materialCapa === 'linho' && !linhoId && <rect width={W} height={H} rx={raioCanto} fill="url(#lf)"/>}
      {materialCapa === 'kraft'  && <rect width={W} height={H} rx={raioCanto} fill="url(#kf)"/>}
      {/* Papel especial — imagem real da textura */}
      {materialCapa === 'papel-especial' && papelEspecialId && (
        <image
          href={`/papeis-especiais/${papelEspecialId}.webp`}
          x={0} y={0} width={W} height={H}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#clip-papel-fr)"
        />
      )}
      {/* Linho — imagem real da textura */}
      {materialCapa === 'linho' && linhoId && (
        <image
          href={`/linhos/${linhoId}.webp`}
          x={0} y={0} width={W} height={H}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#clip-linho-fr)"
        />
      )}

      {/* Leather veins (couro real) */}
      {materialCapa === 'couro' && (
        <g>
          {[0.15, 0.3, 0.47, 0.62, 0.77, 0.9].map((pct, i) => (
            <path key={i}
              d={`M ${W*0.03} ${H*pct} Q ${W*0.5} ${H*(pct+(i%2===0?-0.06:0.06))} ${W*0.97} ${H*pct}`}
              fill="none" stroke={veinColor} strokeWidth="1"/>
          ))}
        </g>
      )}
      {/* Couro sintético: losangos regulares */}
      {materialCapa === 'sintetico' && (
        <g opacity="0.08">
          {Array.from({ length: Math.ceil(H / 12) }, (_, row) =>
            Array.from({ length: Math.ceil(W / 16) }, (_, col) => {
              const x = col * 16 + (row % 2) * 8
              const y = row * 12
              return <path key={`${row}-${col}`}
                d={`M ${x+8} ${y} L ${x+16} ${y+6} L ${x+8} ${y+12} L ${x} ${y+6} Z`}
                fill="none" stroke={lum < 0.45 ? 'white' : 'black'} strokeWidth="0.6"/>
            })
          )}
        </g>
      )}

      {/* Estampas */}
      {estampaCapa === 'floral' && (
        <g opacity="0.22" transform={`translate(${W*0.5},${H*0.5})`}>
          {[0,60,120,180,240,300].map((a,i) => {
            const r = a*Math.PI/180
            return <ellipse key={i} cx={Math.cos(r)*18} cy={Math.sin(r)*18} rx={8} ry={5}
              fill="#FDF8F0" transform={`rotate(${a} ${Math.cos(r)*18} ${Math.sin(r)*18})`}/>
          })}
          <circle r={6} fill="#FDF8F0"/>
        </g>
      )}
      {estampaCapa === 'minimalista' && (
        <g opacity="0.18">
          <line x1={W*0.2} y1={H*0.2} x2={W*0.8} y2={H*0.8} stroke="#FDF8F0" strokeWidth="1.2"/>
          <rect x={W*0.25} y={H*0.3} width={W*0.5} height={H*0.4} fill="none" stroke="#FDF8F0" strokeWidth="0.9"/>
        </g>
      )}
      {estampaCapa === 'abstrata' && (
        <g opacity="0.20">
          <circle cx={W*0.25} cy={H*0.3} r={W*0.18} fill="none" stroke="#FDF8F0" strokeWidth="1.2"/>
          <circle cx={W*0.7} cy={H*0.6} r={W*0.25} fill="none" stroke="#FDF8F0" strokeWidth="0.9"/>
          <line x1={W*0.1} y1={H*0.55} x2={W*0.9} y2={H*0.42} stroke="#FDF8F0" strokeWidth="0.8"/>
          <circle cx={W*0.55} cy={H*0.25} r={W*0.08} fill="#FDF8F0"/>
          <line x1={W*0.4} y1={H*0.75} x2={W*0.6} y2={H*0.9} stroke="#FDF8F0" strokeWidth="1.4"/>
        </g>
      )}
      {estampaCapa === 'tematica' && (
        <g opacity="0.20" stroke="#FDF8F0" fill="none">
          {/* Ornamento de canto em cada extremidade */}
          {[[6,6],[W-6,6],[6,H-6],[W-6,H-6]].map(([x,y],i) => (
            <g key={i} transform={`translate(${x},${y}) rotate(${[0,90,270,180][i]})`}>
              <path d="M 0 0 L 8 0 M 0 0 L 0 8" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="3" cy="3" r="1.5" fill="#FDF8F0" stroke="none"/>
            </g>
          ))}
          {/* Moldura central */}
          <rect x={W*0.15} y={H*0.15} width={W*0.7} height={H*0.7} rx="3" strokeWidth="0.7" strokeDasharray="3 2"/>
        </g>
      )}

      {/* Elástico */}
      {elasticoAtivo && (
        <rect
          x={posicaoElastico === 'vertical' ? W*0.7 : 0}
          y={posicaoElastico === 'vertical' ? 0 : H*0.65}
          width={posicaoElastico === 'vertical' ? 2.5 : W}
          height={posicaoElastico === 'vertical' ? H : 2.5}
          fill={corElastico}/>
      )}

      {/* Marcador — ponta sai abaixo da capa, chanfrado (corte diagonal) */}
      {marcadorAtivo && (() => {
        const qtd = quantidadeMarcadores ?? 1
        const gap = rW + 4
        const offsets = qtd >= 2 ? [0, gap] : [0]
        return (
          <g>
            {offsets.map((off, idx) => {
              const x0 = rX + off
              return (
                <g key={idx}>
                  {/* fita-cetim: chanfrado — corte diagonal (lado direito mais curto) */}
                  {(tipoMarcador === 'fita-cetim' || tipoMarcador === 'fitilho' || !tipoMarcador) && (
                    <>
                      <polygon points={`${x0},${H} ${x0+rW},${H} ${x0+rW},${H+tipH*0.55} ${x0},${H+tipH}`} fill={corMarcador}/>
                      <polygon points={`${x0+rW*0.15},${H} ${x0+rW*0.5},${H} ${x0+rW*0.5},${H+tipH*0.28} ${x0+rW*0.15},${H+tipH*0.45}`}
                        fill="rgba(255,255,255,0.28)"/>
                    </>
                  )}
                  {/* couro: trapézio com chanfrado */}
                  {tipoMarcador === 'couro' && (
                    <>
                      <polygon points={`${x0},${H} ${x0+rW},${H} ${x0+rW*0.9},${H+tipH*0.5} ${x0+rW*0.1},${H+tipH}`} fill={corMarcador}/>
                      <polygon points={`${x0+rW*0.15},${H} ${x0+rW*0.38},${H} ${x0+rW*0.35},${H+tipH*0.35} ${x0+rW*0.13},${H+tipH*0.45}`}
                        fill="rgba(255,255,255,0.22)"/>
                      <line x1={x0+rW*0.12} y1={H+2} x2={x0+rW*0.11} y2={H+tipH-2}
                        stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="1.5 1.5"/>
                      <line x1={x0+rW*0.82} y1={H+2} x2={x0+rW*0.88} y2={H+tipH*0.45}
                        stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="1.5 1.5"/>
                    </>
                  )}
                  {/* cordão */}
                  {(tipoMarcador === 'cordao-cetim' || tipoMarcador === 'cordao') && (
                    <>
                      <line x1={x0+rW/2} y1={H} x2={x0+rW/2} y2={H+tipH-4}
                        stroke={corMarcador} strokeWidth={rW*0.55} strokeLinecap="round"/>
                      <ellipse cx={x0+rW/2} cy={H+tipH-3} rx={rW*0.45} ry={rW*0.45} fill={corMarcador}/>
                      <ellipse cx={x0+rW/2-rW*0.12} cy={H+tipH-4} rx={rW*0.14} ry={rW*0.14}
                        fill="rgba(255,255,255,0.35)"/>
                    </>
                  )}
                  {/* Slot de saída */}
                  <rect x={x0-1.5} y={H-2} width={rW+3} height={3} fill="rgba(0,0,0,0.35)" rx={0.5}/>
                </g>
              )
            })}
          </g>
        )
      })()}

      {/* Porta-caneta — tira vertical na borda direita da capa */}
      {portaCaneta && (
        <g>
          <rect x={W - 10} y={H*0.25} width={8} height={H*0.5} rx={3}
            fill="rgba(0,0,0,0.28)" />
          <rect x={W - 9.5} y={H*0.25 + 1} width={7} height={H*0.5 - 2} rx={2.5}
            fill={corCapa} opacity={0.9}/>
          {/* Costura lateral */}
          <line x1={W - 9} y1={H*0.27} x2={W - 9} y2={H*0.75}
            stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" strokeDasharray="2 1.5"/>
          {/* Abertura do topo */}
          <ellipse cx={W - 6} cy={H*0.25} rx={3} ry={1.5}
            fill="rgba(0,0,0,0.4)"/>
        </g>
      )}

      {/* Pintura nas bordas */}
      {pinturaBordasAtiva && (
        <rect x={1} y={1} width={W-2} height={H-2} rx={raioCanto}
          fill="none" stroke={corPinturaBordas} strokeWidth={2.5} opacity={0.55}/>
      )}

      {/* Iluminação multicamada */}
      <rect width={W} height={H} rx={raioCanto} fill="url(#luz-fr)" style={{ pointerEvents: 'none' }}/>
      <rect width={W} height={H} rx={raioCanto} fill="url(#bdir-fr)" style={{ pointerEvents: 'none' }}/>
      <rect width={W} height={H} rx={raioCanto} fill="url(#htop-fr)" style={{ pointerEvents: 'none' }}/>

      {/* Laminação brilho — reflexo especular adicional */}
      {tipoLaminacao === 'brilho' && (
        <rect width={W} height={H} rx={raioCanto} fill="url(#brilho-fr)" style={{ pointerEvents: 'none' }}/>
      )}
      {/* Laminação fosca — véu que atenua reflexos (aspecto aveludado) */}
      {tipoLaminacao === 'fosca' && (
        <rect width={W} height={H} rx={raioCanto} fill="rgba(240,236,232,0.13)" style={{ pointerEvents: 'none' }}/>
      )}

      {/* Highlight aresta esquerda (costura lombada) */}
      <line x1={2} y1={raioCanto*1.5} x2={2} y2={H-raioCanto*1.5}
        stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" style={{ pointerEvents: 'none' }}/>
      <line x1={0.8} y1={raioCanto} x2={0.8} y2={H-raioCanto}
        stroke="rgba(0,0,0,0.22)" strokeWidth="1" style={{ pointerEvents: 'none' }}/>

      {/* Abas / orelhas — dobras decorativas nos cantos da capa */}
      {abasOrelhas && (
        <g>
          {/* Canto superior direito */}
          <polygon points={`${W-14},0 ${W},0 ${W},14`}
            fill="rgba(255,255,255,0.82)" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
          <polygon points={`${W-14},0 ${W},14 ${W-14},14`}
            fill="rgba(0,0,0,0.10)"/>
          {/* Canto inferior direito */}
          <polygon points={`${W-14},${H} ${W},${H} ${W},${H-14}`}
            fill="rgba(255,255,255,0.82)" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>
          <polygon points={`${W-14},${H} ${W},${H-14} ${W-14},${H-14}`}
            fill="rgba(0,0,0,0.10)"/>
        </g>
      )}

      {/* Cantoneiras — apenas no lado oposto à lombada (direito) */}
      {tipoCantoneiras !== 'nenhuma' && tipoCantoneiras && (() => {
        const s = 14
        // papel=kraft, metal-simples=prata, metal-trabalhado=ouro
        const metalFill = tipoCantoneiras === 'metal-trabalhado' ? '#C8A96E'
          : tipoCantoneiras === 'metal-simples' ? '#B8B8C0'
          : '#C4A07A' // papel
        const metalGlow = tipoCantoneiras === 'metal-trabalhado' ? 'rgba(255,215,100,0.5)'
          : tipoCantoneiras === 'metal-simples' ? 'rgba(200,200,220,0.5)'
          : 'rgba(196,160,122,0.4)'
        return (
          <g>
            {/* Superior direito (lado livre — sem lombada) */}
            <polygon points={`${W},0 ${W-s},0 ${W},${s}`} fill={metalFill}/>
            <line x1={W-2} y1={0} x2={W} y2={2} stroke={metalGlow} strokeWidth="1.5"/>
            {/* Inferior direito */}
            <polygon points={`${W},${H} ${W-s},${H} ${W},${H-s}`} fill={metalFill}/>
            <line x1={W-2} y1={H} x2={W} y2={H-2} stroke={metalGlow} strokeWidth="1.5"/>
          </g>
        )
      })()}

      {/* Gravação */}
      <GravacaoCapa texto={nomeGravado ?? ''} tipo={gravacaoCapa ?? 'nenhuma'}
        posicao={posicaoGravacao ?? 'centro'} cx={W/2} cy={H/2}
        largura={W} altura={H} corCapa={corCapa}
        corBordado={corBordado} tipoTipografia={tipoTipografia}/>

      {/* Aplicações */}
      <AplicacoesCapa aplicacoes={aplicacoesCapa ?? []} cx={W/2} cy={H/2}
        largura={W} altura={H} raioCanto={raioCanto}/>
    </svg>
  )
}

// ─── Face: Verso (contracapa) ─────────────────────────────────
function FaceVerso({ W, H, corCapa, materialCapa, raioCanto, tipoTextura, tipoLaminacao, papelEspecialId, linhoId, tipoCantoneiras, aplicacoesCapa, elasticoAtivo, corElastico, posicaoElastico, bolsoInterno, envelopeContracapa }: {
  W: number; H: number; corCapa: string; materialCapa: string; raioCanto: number
  tipoTextura: string; tipoLaminacao: string; papelEspecialId?: string; linhoId?: string; tipoCantoneiras?: string
  aplicacoesCapa?: string[]; elasticoAtivo?: boolean; corElastico?: string; posicaoElastico?: string
  bolsoInterno?: boolean; envelopeContracapa?: boolean
}) {
  const ehCouro = materialCapa === 'couro' || materialCapa === 'sintetico'
  const useGrain = tipoTextura === 'granulada' || (tipoTextura !== 'lisa' && ehCouro)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {materialCapa === 'papel-especial' && papelEspecialId && (
          <clipPath id="clip-papel-v">
            <rect width={W} height={H} rx={raioCanto}/>
          </clipPath>
        )}
        {materialCapa === 'linho' && linhoId && (
          <clipPath id="clip-linho-v">
            <rect width={W} height={H} rx={raioCanto}/>
          </clipPath>
        )}
        {useGrain && (
          <filter id="grain-v" x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.76 0.70" numOctaves="4" seed="11" result="pebble"/>
            <feDiffuseLighting in="pebble" lightingColor="white" surfaceScale="4.5" diffuseConstant="0.9" result="lit">
              <feDistantLight azimuth="130" elevation="46"/>
            </feDiffuseLighting>
            <feTurbulence type="fractalNoise" baseFrequency="1.9 1.7" numOctaves="2" seed="17" result="micro"/>
            <feColorMatrix type="saturate" values="0" in="micro" result="microGray"/>
            <feComposite in="lit" in2="microGray" operator="arithmetic" k1="0" k2="0.82" k3="0.18" k4="0" result="combined"/>
            <feBlend in="SourceGraphic" in2="combined" mode="soft-light"/>
          </filter>
        )}
        <radialGradient id="luz-v" cx="72%" cy="18%" r="88%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="white" stopOpacity="0.2"/>
          <stop offset="30%"  stopColor="white" stopOpacity="0.06"/>
          <stop offset="70%"  stopColor="black" stopOpacity="0.0"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.2"/>
        </radialGradient>
        {tipoLaminacao === 'brilho' && (
          <radialGradient id="brilho-v" cx="75%" cy="12%" r="60%" gradientUnits="objectBoundingBox">
            <stop offset="0%"   stopColor="white" stopOpacity="0.55"/>
            <stop offset="35%"  stopColor="white" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="white" stopOpacity="0.0"/>
          </radialGradient>
        )}
        <linearGradient id="htop-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="white" stopOpacity="0.25"/>
          <stop offset="10%" stopColor="white" stopOpacity="0.0"/>
        </linearGradient>
      </defs>
      <rect width={W} height={H} rx={raioCanto} fill={corCapa}
        filter={useGrain ? 'url(#grain-v)' : undefined}/>
      {materialCapa === 'papel-especial' && papelEspecialId && (
        <image
          href={`/papeis-especiais/${papelEspecialId}.webp`}
          x={0} y={0} width={W} height={H}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#clip-papel-v)"
        />
      )}
      {materialCapa === 'linho' && linhoId && (
        <image
          href={`/linhos/${linhoId}.webp`}
          x={0} y={0} width={W} height={H}
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#clip-linho-v)"
        />
      )}
      <rect width={W} height={H} rx={raioCanto} fill="url(#luz-v)"/>
      <rect width={W} height={H} rx={raioCanto} fill="url(#htop-v)"/>
      {tipoLaminacao === 'brilho' && (
        <rect width={W} height={H} rx={raioCanto} fill="url(#brilho-v)" style={{ pointerEvents: 'none' }}/>
      )}
      {tipoLaminacao === 'fosca' && (
        <rect width={W} height={H} rx={raioCanto} fill="rgba(240,236,232,0.13)" style={{ pointerEvents: 'none' }}/>
      )}
      {/* Cantoneiras — lado esquerdo (oposto à lombada no verso) */}
      {tipoCantoneiras && tipoCantoneiras !== 'nenhuma' && (() => {
        const s = 14
        const metalFill = tipoCantoneiras === 'metal-trabalhado' ? '#C8A96E'
          : tipoCantoneiras === 'metal-simples' ? '#B8B8C0'
          : '#C4A07A'
        const metalGlow = tipoCantoneiras === 'metal-trabalhado' ? 'rgba(255,215,100,0.5)'
          : tipoCantoneiras === 'metal-simples' ? 'rgba(200,200,220,0.5)'
          : 'rgba(196,160,122,0.4)'
        return (
          <g>
            {/* Superior esquerdo */}
            <polygon points={`0,0 ${s},0 0,${s}`} fill={metalFill}/>
            <line x1={2} y1={0} x2={0} y2={2} stroke={metalGlow} strokeWidth="1.5"/>
            {/* Inferior esquerdo */}
            <polygon points={`0,${H} ${s},${H} 0,${H-s}`} fill={metalFill}/>
            <line x1={2} y1={H} x2={0} y2={H-2} stroke={metalGlow} strokeWidth="1.5"/>
          </g>
        )
      })()}
      {/* Aplicações (pespontos etc) */}
      {aplicacoesCapa && aplicacoesCapa.length > 0 && (
        <AplicacoesCapa aplicacoes={aplicacoesCapa} cx={W/2} cy={H/2}
          largura={W} altura={H} raioCanto={raioCanto}/>
      )}
      {/* Elástico — posição espelhada em relação à frente */}
      {elasticoAtivo && (
        <rect
          x={posicaoElastico === 'vertical' ? W*0.26 : 0}
          y={posicaoElastico === 'vertical' ? 0 : H*0.26}
          width={posicaoElastico === 'vertical' ? W*0.04 : W}
          height={posicaoElastico === 'vertical' ? H : H*0.04}
          fill={corElastico} opacity="0.85" rx="1"
        />
      )}
      {/* Bolso interno — indicador visual na contracapa */}
      {bolsoInterno && !envelopeContracapa && (
        <g opacity="0.72">
          <rect x={W*0.08} y={H*0.68} width={W*0.84} height={H*0.26}
            rx={raioCanto*0.5} fill="rgba(200,185,165,0.35)" stroke="rgba(150,130,110,0.45)" strokeWidth="0.8"/>
          <rect x={W*0.08} y={H*0.68} width={W*0.84} height={3}
            rx={raioCanto*0.5} fill="rgba(150,130,110,0.2)"/>
          <line x1={W*0.08} y1={H*0.68} x2={W*0.92} y2={H*0.68}
            stroke="rgba(150,130,110,0.5)" strokeWidth="0.7" strokeDasharray="2 2"/>
          <text x={W*0.5} y={H*0.82} textAnchor="middle" dominantBaseline="middle"
            fontSize="5.5" fill="rgba(130,110,90,0.6)" fontFamily="Georgia, serif" letterSpacing="0.08em">
            bolso
          </text>
        </g>
      )}
      {/* Envelope contracapa — indicador visual */}
      {envelopeContracapa && (
        <g opacity="0.75">
          <rect x={W*0.06} y={H*0.60} width={W*0.88} height={H*0.34}
            rx={raioCanto*0.5} fill="rgba(232,224,208,0.55)"
            stroke="rgba(150,128,105,0.50)" strokeWidth="0.8"/>
          <path d={`M ${W*0.06},${H*0.60} L ${W*0.5},${H*0.725} L ${W*0.94},${H*0.60} Z`}
            fill="rgba(218,208,190,0.60)" stroke="rgba(150,128,105,0.38)" strokeWidth="0.6"/>
          <text x={W*0.5} y={H*0.82} textAnchor="middle" dominantBaseline="middle"
            fontSize="5.5" fill="rgba(130,110,90,0.6)" fontFamily="Georgia, serif" letterSpacing="0.10em">
            envelope
          </text>
        </g>
      )}
      {/* Highlight aresta direita */}
      <line x1={W-2} y1={raioCanto} x2={W-2} y2={H-raioCanto}
        stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      <line x1={W-0.8} y1={raioCanto} x2={W-0.8} y2={H-raioCanto}
        stroke="rgba(0,0,0,0.22)" strokeWidth="1"/>
    </svg>
  )
}

// ─── Face: Lombada (spine) ────────────────────────────────────
function FaceSpine({ W, H, corCapa, materialCapa, tipoEncadernacao, tipoLombada, corFio, papelEspecialId, linhoId }: {
  W: number; H: number; corCapa: string; materialCapa: string
  tipoEncadernacao: string; tipoLombada: string; corFio: string; papelEspecialId?: string; linhoId?: string
}) {
  const ehProtegida = tipoLombada === 'protegida' || tipoLombada === 'protegida-costura-aparente'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="luz-sp" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="black" stopOpacity="0.22"/>
          <stop offset="18%"  stopColor="white" stopOpacity="0.12"/>
          <stop offset="50%"  stopColor="white" stopOpacity="0.0"/>
          <stop offset="82%"  stopColor="white" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.18"/>
        </linearGradient>
        {ehProtegida && materialCapa === 'papel-especial' && papelEspecialId && (
          <clipPath id="clip-papel-sp">
            <rect width={W} height={H}/>
          </clipPath>
        )}
        {ehProtegida && materialCapa === 'linho' && linhoId && (
          <clipPath id="clip-linho-sp">
            <rect width={W} height={H}/>
          </clipPath>
        )}
        {(materialCapa === 'couro' || materialCapa === 'sintetico') && (
          <filter id="grain-sp" x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.76 0.70" numOctaves="4" seed="19" result="pebble"/>
            <feDiffuseLighting in="pebble" lightingColor="white" surfaceScale="4.5" diffuseConstant="0.9" result="lit">
              <feDistantLight azimuth="90" elevation="46"/>
            </feDiffuseLighting>
            <feTurbulence type="fractalNoise" baseFrequency="1.9 1.7" numOctaves="2" seed="23" result="micro"/>
            <feColorMatrix type="saturate" values="0" in="micro" result="microGray"/>
            <feComposite in="lit" in2="microGray" operator="arithmetic" k1="0" k2="0.82" k3="0.18" k4="0" result="combined"/>
            <feBlend in="SourceGraphic" in2="combined" mode="soft-light"/>
          </filter>
        )}
      </defs>

      {/* Fundo — miolo exposto (pilha de páginas) ou lombada protegida */}
      {ehProtegida ? (
        <>
          <rect width={W} height={H} fill={corCapa}
            filter={(materialCapa === 'couro' || materialCapa === 'sintetico') ? 'url(#grain-sp)' : undefined}/>
          {materialCapa === 'papel-especial' && papelEspecialId && (
            <image
              href={`/papeis-especiais/${papelEspecialId}.webp`}
              x={0} y={0} width={W} height={H}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#clip-papel-sp)"
            />
          )}
          {materialCapa === 'linho' && linhoId && (
            <image
              href={`/linhos/${linhoId}.webp`}
              x={0} y={0} width={W} height={H}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#clip-linho-sp)"
            />
          )}
        </>
      ) : (
        <>
          {/* Pilha de páginas visível */}
          <rect width={W} height={H} fill="#E8E2D6"/>
          {/* Linhas representando as folhas */}
          {Array.from({ length: Math.floor(H / 1.4) }, (_, i) => (
            <line key={i} x1={0} y1={i*1.4} x2={W} y2={i*1.4}
              stroke="rgba(180,165,145,0.55)" strokeWidth="0.4"/>
          ))}
        </>
      )}

      {/* Costura — só aparece se lombada exposta */}
      {!ehProtegida && (
        <Costura tipoEncadernacao={tipoEncadernacao} corFio={corFio} W={W} H={H}/>
      )}

      {/* Gradiente de luz sobre tudo */}
      <rect width={W} height={H} fill="url(#luz-sp)" style={{ pointerEvents: 'none' }}/>
    </svg>
  )
}

// ─── Face: Corte (borda direita — páginas) ────────────────────
function FaceCorte({ W, H, corInternaFolhas, pinturaBordasAtiva, corPinturaBordas, tipoCorteEspecial }: {
  W: number; H: number; corInternaFolhas: string
  pinturaBordasAtiva: boolean; corPinturaBordas: string; tipoCorteEspecial: string
}) {
  // ~0.55px por folha — linhas verticais ao longo da largura (W ≈ 28px → ~50 linhas)
  const spacing = 0.55
  const total = Math.floor(W / spacing)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Sombra vertical — pilha fica mais escura embaixo (folhas comprimidas) */}
        <linearGradient id="sombra-c2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(0,0,0,0)"   stopOpacity="0"/>
          <stop offset="70%"  stopColor="rgba(0,0,0,0.08)" stopOpacity="1"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.22)" stopOpacity="1"/>
        </linearGradient>
        {/* Luz lateral — brilho sutil vindo da esquerda */}
        <linearGradient id="luz-c2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="white" stopOpacity="0.30"/>
          <stop offset="35%"  stopColor="white" stopOpacity="0.06"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.12"/>
        </linearGradient>
      </defs>

      {/* Fundo — cor base das folhas */}
      <rect width={W} height={H} fill={corInternaFolhas}/>

      {/* Linhas verticais de páginas — cada linha é a borda de uma folha */}
      {Array.from({ length: total }, (_, i) => {
        const x = i * spacing
        const isDark = i % 2 === 0
        return (
          <line key={i}
            x1={x} y1={0} x2={x} y2={H}
            stroke={isDark ? 'rgba(130,110,90,0.80)' : 'rgba(210,195,180,0.30)'}
            strokeWidth={isDark ? 0.55 : 0.28}
          />
        )
      })}

      {/* Pintura de bordas (gilding) — cobre as linhas completamente */}
      {pinturaBordasAtiva ? (
        <>
          <rect width={W} height={H} fill={corPinturaBordas} opacity={1}/>
          <rect width={W} height={H} fill="url(#luz-c2)" opacity={1.5}/>
        </>
      ) : (
        <>
          <rect width={W} height={H} fill="url(#sombra-c2)"/>
          <rect width={W} height={H} fill="url(#luz-c2)"/>
        </>
      )}

      {/* Deckle-edge — borda direita irregular (papel artesanal rasgado) */}
      {tipoCorteEspecial === 'deckle-edge' && (() => {
        const pts: string[] = [`${W},0`]
        const steps = 28
        for (let i = 1; i <= steps; i++) {
          const y = (H / steps) * i
          // alternância pseudo-aleatória determinística
          const jitter = (Math.sin(i * 7.3) * 0.5 + 0.5) * W * 0.45
          pts.push(`${W - jitter},${y}`)
        }
        pts.push(`${W},${H}`, `${W},0`)
        return (
          <polygon points={pts.join(' ')}
            fill={corInternaFolhas} opacity={0.92}/>
        )
      })()}
    </svg>
  )
}

// ─── Face: Topo e Base ────────────────────────────────────────
function FaceTopo({ W, H, corInternaFolhas, pinturaBordasAtiva, corPinturaBordas, elasticoAtivo, corElastico, posicaoElastico }: {
  W: number; H: number; corInternaFolhas: string
  pinturaBordasAtiva: boolean; corPinturaBordas: string
  elasticoAtivo?: boolean; corElastico?: string; posicaoElastico?: string
}) {
  const spacing = 0.55
  const total = Math.floor(W / spacing)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="luz-topo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="white" stopOpacity="0.30"/>
          <stop offset="35%"  stopColor="white" stopOpacity="0.06"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.10"/>
        </linearGradient>
        <linearGradient id="sombra-topo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(0,0,0,0)"    stopOpacity="0"/>
          <stop offset="70%"  stopColor="rgba(0,0,0,0.06)" stopOpacity="1"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)" stopOpacity="1"/>
        </linearGradient>
      </defs>
      {/* Fundo folhas */}
      <rect width={W} height={H} fill={corInternaFolhas}/>

      {/* Linhas das páginas — cobertura total, igual ao FaceCorte */}
      {!pinturaBordasAtiva && Array.from({ length: total }, (_, i) => {
        const x = i * spacing
        const isDark = i % 2 === 0
        return (
          <line key={i}
            x1={x} y1={0} x2={x} y2={H}
            stroke={isDark ? 'rgba(130,110,90,0.80)' : 'rgba(210,195,180,0.30)'}
            strokeWidth={isDark ? 0.55 : 0.28}
          />
        )
      })}

      {/* Pintura de bordas — cobre 100% da face, uniforme */}
      {pinturaBordasAtiva ? (
        <>
          <rect width={W} height={H} fill={corPinturaBordas} opacity={1}/>
          <rect width={W} height={H} fill="url(#luz-topo)" opacity={1}/>
        </>
      ) : (
        <>
          <rect width={W} height={H} fill="url(#sombra-topo)"/>
          <rect width={W} height={H} fill="url(#luz-topo)"/>
        </>
      )}
      {/* Elástico cruzando a face topo/base */}
      {elasticoAtivo && corElastico && (
        posicaoElastico === 'horizontal'
          ? <rect x={0} y={H*0.28} width={W} height={H*0.12} fill={corElastico} opacity="0.85" rx="1"/>
          : <rect x={W*0.68} y={0} width={W*0.1} height={H} fill={corElastico} opacity="0.85" rx="1"/>
      )}
    </svg>
  )
}

// ─── Livro 3D (CSS box com 6 faces) ──────────────────────────
function Livro3D({ bW, bH, bD, props }: {
  bW: number; bH: number; bD: number
  props: {
    corCapa: string; materialCapa: string; estampaCapa: string
    gravacaoCapa: string; nomeGravado: string; posicaoGravacao: string; aplicacoesCapa: string[]
    raioCanto: number; tipoEncadernacao: string; tipoLombada: string; corFio: string
    elasticoAtivo: boolean; corElastico: string; posicaoElastico: string
    marcadorAtivo: boolean; tipoMarcador: string; corMarcador: string; larguraMarcador: string; quantidadeMarcadores?: number
    portaCaneta: boolean
    pinturaBordasAtiva: boolean; corPinturaBordas: string
    tipoCorteEspecial: string
    corInternaFolhas: string; corBordado: string; tipoTipografia: string
    tipoTextura: string; tipoLaminacao: string; abasOrelhas: boolean; tipoCantoneiras: string
    papelEspecialId?: string; linhoId?: string; bolsoInterno?: boolean; envelopeContracapa?: boolean
  }
}) {
  const { corCapa, materialCapa, estampaCapa, gravacaoCapa, nomeGravado, posicaoGravacao,
    aplicacoesCapa, raioCanto, tipoEncadernacao, tipoLombada, corFio,
    elasticoAtivo, corElastico, posicaoElastico, marcadorAtivo, tipoMarcador, corMarcador, larguraMarcador, quantidadeMarcadores,
    portaCaneta, pinturaBordasAtiva, corPinturaBordas, tipoCorteEspecial,
    corInternaFolhas, corBordado, tipoTipografia,
    tipoTextura, tipoLaminacao, abasOrelhas, tipoCantoneiras, papelEspecialId, linhoId,
    bolsoInterno, envelopeContracapa } = props

  const face: React.CSSProperties = { position: 'absolute', overflow: 'hidden' }
  const faceOpen: React.CSSProperties = { position: 'absolute', overflow: 'visible' }
  const W = bW, H = bH, D = bD

  return (
    <div style={{ width: W, height: H, position: 'relative', transformStyle: 'preserve-3d', overflow: 'visible' }}>

      {/* FRENTE — overflow visible para ponta do marcador sair embaixo */}
      <div style={{ ...faceOpen, width: W, height: H, left: 0, top: 0,
        transform: `translateZ(${D/2}px)`, backfaceVisibility: 'hidden', overflow: 'visible' }}>
        <FaceFrente W={W} H={H} corCapa={corCapa} materialCapa={materialCapa}
          estampaCapa={estampaCapa} gravacaoCapa={gravacaoCapa} nomeGravado={nomeGravado}
          posicaoGravacao={posicaoGravacao} aplicacoesCapa={aplicacoesCapa}
          raioCanto={raioCanto} elasticoAtivo={elasticoAtivo} corElastico={corElastico}
          posicaoElastico={posicaoElastico} marcadorAtivo={marcadorAtivo}
          tipoMarcador={tipoMarcador} corMarcador={corMarcador} larguraMarcador={larguraMarcador}
          quantidadeMarcadores={quantidadeMarcadores}
          portaCaneta={portaCaneta}
          pinturaBordasAtiva={pinturaBordasAtiva} corPinturaBordas={corPinturaBordas}
          corBordado={corBordado} tipoTipografia={tipoTipografia}
          tipoTextura={tipoTextura} tipoLaminacao={tipoLaminacao} abasOrelhas={abasOrelhas}
          tipoCantoneiras={tipoCantoneiras} papelEspecialId={papelEspecialId} linhoId={linhoId}/>
      </div>

      {/* VERSO */}
      <div style={{ ...face, width: W, height: H, left: 0, top: 0,
        transform: `rotateY(180deg) translateZ(${D/2}px)`, backfaceVisibility: 'hidden' }}>
        <FaceVerso W={W} H={H} corCapa={corCapa} materialCapa={materialCapa} raioCanto={raioCanto}
          tipoTextura={tipoTextura} tipoLaminacao={tipoLaminacao} papelEspecialId={papelEspecialId}
          linhoId={linhoId} tipoCantoneiras={tipoCantoneiras} aplicacoesCapa={aplicacoesCapa}
          elasticoAtivo={elasticoAtivo} corElastico={corElastico} posicaoElastico={posicaoElastico}
          bolsoInterno={bolsoInterno} envelopeContracapa={envelopeContracapa}/>
      </div>

      {/* LOMBADA (esquerda) */}
      <div style={{ ...face, width: D, height: H, left: (W-D)/2, top: 0,
        transform: `rotateY(-90deg) translateZ(${W/2}px)`, backfaceVisibility: 'hidden' }}>
        <FaceSpine W={D} H={H} corCapa={corCapa} materialCapa={materialCapa}
          tipoEncadernacao={tipoEncadernacao} tipoLombada={tipoLombada} corFio={corFio}
          papelEspecialId={papelEspecialId} linhoId={linhoId}/>
      </div>

      {/* CORTE / páginas (direita) */}
      <div style={{ ...face, width: D, height: H, left: (W-D)/2, top: 0,
        transform: `rotateY(90deg) translateZ(${W/2}px)`, backfaceVisibility: 'hidden' }}>
        <FaceCorte W={D} H={H} corInternaFolhas={corInternaFolhas}
          pinturaBordasAtiva={pinturaBordasAtiva} corPinturaBordas={corPinturaBordas}
          tipoCorteEspecial={tipoCorteEspecial}/>
      </div>

      {/* TOPO */}
      <div style={{ ...face, width: W, height: D, left: 0, top: (H-D)/2,
        transform: `rotateX(90deg) translateZ(${H/2}px)`, backfaceVisibility: 'hidden' }}>
        <FaceTopo W={W} H={D} corInternaFolhas={corInternaFolhas}
          pinturaBordasAtiva={pinturaBordasAtiva} corPinturaBordas={corPinturaBordas}
          elasticoAtivo={elasticoAtivo} corElastico={corElastico} posicaoElastico={posicaoElastico}/>
      </div>

      {/* BASE */}
      <div style={{ ...face, width: W, height: D, left: 0, top: (H-D)/2,
        transform: `rotateX(-90deg) translateZ(${H/2}px)`, backfaceVisibility: 'hidden' }}>
        <FaceTopo W={W} H={D} corInternaFolhas={corInternaFolhas}
          pinturaBordasAtiva={pinturaBordasAtiva} corPinturaBordas={corPinturaBordas}
          elasticoAtivo={elasticoAtivo} corElastico={corElastico} posicaoElastico={posicaoElastico}/>
      </div>
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────
export default function PreviewCaderno() {
  const { configuracao, perguntaIndex } = useCadernoStore()
  const [modo, setModo] = useState<Modo>('fechado')
  const [spread, setSpread] = useState(0) // 0=guarda+1ª pg | 1=miolo | 2=última pg+guarda

  // Identifica pergunta atual para auto-modo e foco de página
  const perguntasVisiveis = getPerguntasVisiveis(configuracao)
  const perguntaAtualPreview = perguntasVisiveis[perguntaIndex]
  const paginaFocoAtual: 'guarda' | 'miolo' | 'ambas' =
    PAGINA_FOCO[perguntaAtualPreview?.id ?? ''] ?? 'ambas'

  // Auto-modo: abre/fecha conforme pergunta ativa
  // - grupo 2 (miolo) → aberto
  // - extras-elementos (bolso/envelope) → aberto (ver layout nas páginas)
  // - pinturaBordasAtiva / corPinturaBordas → fechado (ver bordas laterais no 3D)
  useEffect(() => {
    const id = perguntaAtualPreview?.id ?? ''
    const grupo = perguntaAtualPreview?.grupo ?? 1
    const deveFechar = id === 'pinturaBordasAtiva' || id === 'corPinturaBordas'
    const deveAbrir  = grupo === 2 || id === 'extras-elementos'
    setModo(deveFechar ? 'fechado' : deveAbrir ? 'aberto' : 'fechado')
  }, [perguntaAtualPreview?.id, perguntaAtualPreview?.grupo])

  // Refs para manipulação DOM direta — zero re-renders durante drag
  const wrapRef      = useRef<HTMLDivElement>(null)
  const bookRef      = useRef<HTMLDivElement>(null)
  const wrapAbertoRef = useRef<HTMLDivElement>(null)  // container da vista aberta
  const hintRef      = useRef<HTMLParagraphElement>(null)
  const rot          = useRef({ Y: 20, X: -10 })
  const rotAberto    = useRef({ Y: 0, X: 0 })        // rotação da vista aberta
  const drag         = useRef({ on: false, lX: 0, lY: 0, velY: 0, velX: 0 })
  const rafId        = useRef(0)
  const rafPending   = useRef(false)
  const modoRef      = useRef(modo)                   // modo sem closure stale nos handlers
  useEffect(() => { modoRef.current = modo }, [modo])

  const {
    tamanho, subtamanhoPersonalizado, formato, espessura,
    corCapa, materialCapa, estampaCapa,
    gravacaoCapa, nomeGravado, posicaoGravacao, aplicacoesCapa,
    tipoTipografia, corBordado,
    tipoEncadernacao, tipoLombada, corFio,
    elasticoAtivo, corElastico, posicaoElastico,
    marcadorAtivo, tipoMarcador, corMarcador, larguraMarcador, quantidadeMarcadores,
    bolsoInterno, portaCaneta, envelopeAcoplado, envelopeContracapa, abasOrelhas,
    tipoCantos, tipoCantoneiras, pinturaBordasAtiva, corPinturaBordas,
    tipoCorteEspecial, tipoLaminacao, tipoTextura,
    padraoPaginas, corFolhas, tipoPapel,
    materialGuarda, corGuarda, padraoGuarda, padraoGuardaEstampado,
    paginaDedicatoria, querPersonalizacaoCapa,
    papelEspecialId, linhoId, pespontosAtivo,
    folhasColoridas, corFolhasColoridas,
  } = configuracao

  const prop = tamanho === 'personalizado' && subtamanhoPersonalizado
    ? (PROPORCAO_PERSONALIZADO[subtamanhoPersonalizado] ?? { fL: 1.0, fA: 1.4 })
    : (PROPORCAO_POR_FORMATO[formato] ?? PROPORCAO_POR_FORMATO['retrato'])
  const bW = Math.round(175 * prop.fL)
  const bH = Math.round(175 * prop.fA)
  const bD = ESPESSURA_CSS[espessura] ?? 28

  const espessuraLombada = ESPESSURA_SVG[espessura] ?? 22
  const larguraCapa = 148 * prop.fL
  const alturaCapa  = 148 * prop.fA

  const corFolhasMap: Record<string, string> = {
    branca: '#FAFAF8', creme: '#F5F0E0', colorida: '#E8F0D8',
  }
  const corInternaFolhas = corFolhasMap[corFolhas] ?? '#FAFAF8'
  const raioCanto = tipoCantos === 'arredondados' ? 8 : 2
  const corBordaPages = pinturaBordasAtiva ? corPinturaBordas : corInternaFolhas

  // Escala visual por tamanho físico do caderno
  const escalaTamanho: Record<string, number> = {
    A6: 0.72, A5: 1.0, A4: 1.38, personalizado: 1.0,
  }
  const escala = escalaTamanho[tamanho] ?? 1.0

  // Mapeia padraoGuardaEstampado (flores/poas/abstrata) → padrão SVG (floral/geometrico/aquarela)
  const padraoGuardaEstampadoMap: Record<string, string> = {
    flores: 'floral', poas: 'geometrico', abstrata: 'aquarela',
  }
  const padraoGuardaResolvido = materialGuarda === 'estampada'
    ? (padraoGuardaEstampadoMap[padraoGuardaEstampado] ?? 'floral')
    : (padraoGuarda ?? 'liso')

  const livroProps = {
    corCapa, materialCapa, estampaCapa,
    papelEspecialId: papelEspecialId ?? '',
    linhoId: linhoId ?? '',
    gravacaoCapa: querPersonalizacaoCapa ? gravacaoCapa : 'nenhuma',
    nomeGravado: querPersonalizacaoCapa ? nomeGravado : '',
    posicaoGravacao, aplicacoesCapa: [...(aplicacoesCapa ?? []), ...(pespontosAtivo ? ['pespontos'] : [])],
    raioCanto, tipoEncadernacao, tipoLombada, corFio,
    elasticoAtivo: elasticoAtivo ?? false, corElastico, posicaoElastico,
    marcadorAtivo: marcadorAtivo ?? false, tipoMarcador: tipoMarcador ?? 'fita-cetim',
    corMarcador, larguraMarcador: larguraMarcador ?? 'medio',
    quantidadeMarcadores: quantidadeMarcadores ?? 1,
    portaCaneta: portaCaneta ?? false,
    pinturaBordasAtiva: pinturaBordasAtiva ?? false, corPinturaBordas,
    tipoCorteEspecial: tipoCorteEspecial ?? 'nenhum',
    corInternaFolhas, corBordado: corBordado ?? '#F5DFA0', tipoTipografia: tipoTipografia ?? 'serif',
    tipoTextura: tipoTextura ?? 'granulada',
    tipoLaminacao: tipoLaminacao ?? 'nenhuma',
    abasOrelhas: abasOrelhas ?? false,
    tipoCantoneiras: tipoCantoneiras ?? 'sem-cantoneiras',
    bolsoInterno: bolsoInterno ?? false,
    envelopeContracapa: envelopeContracapa ?? false,
  }

  const propsAberto = {
    larguraCapa, alturaCapa, espessuraLombada, raioCanto,
    corCapa, corInternaFolhas, corBordaPages,
    padraoPaginas, tipoEncadernacao, corFio,
    marcadorAtivo: marcadorAtivo ?? false, corMarcador,
    pinturaBordasAtiva: pinturaBordasAtiva ?? false, corPinturaBordas,
    materialGuarda: materialGuarda ?? 'branca',
    corGuarda: corGuarda ?? '#F5F0E0',
    padraoGuarda: padraoGuardaResolvido,
    bolsoInterno: bolsoInterno ?? false,
    tipoPapel: tipoPapel ?? 'offset',
    envelopeAcoplado: envelopeAcoplado ?? false,
    paginaDedicatoria: paginaDedicatoria ?? false,
    paginaFoco: paginaFocoAtual,
    folhasColoridas: folhasColoridas ?? false,
    corFolhasColoridas: corFolhasColoridas ?? '#A8C5A0',
    spread,
  }

  // Aplica rotação diretamente no DOM — sem passar pelo React
  function applyTransform() {
    if (modoRef.current === 'fechado' && bookRef.current)
      bookRef.current.style.transform = `rotateX(${rot.current.X}deg) rotateY(${rot.current.Y}deg)`
    if (modoRef.current === 'aberto' && wrapAbertoRef.current)
      wrapAbertoRef.current.style.transform = `perspective(900px) rotateX(${rotAberto.current.X}deg) rotateY(${rotAberto.current.Y}deg)`
  }

  // Inércia pós-drag via rAF — decaimento exponencial
  function inertia() {
    drag.current.velY *= 0.93
    drag.current.velX *= 0.93
    if (Math.abs(drag.current.velY) < 0.06 && Math.abs(drag.current.velX) < 0.06) return
    if (modoRef.current === 'fechado') {
      rot.current.Y += drag.current.velY
      rot.current.X = Math.max(-35, Math.min(25, rot.current.X + drag.current.velX))
    } else {
      rotAberto.current.Y = Math.max(-30, Math.min(30, rotAberto.current.Y + drag.current.velY * 0.35))
      rotAberto.current.X = Math.max(-20, Math.min(20, rotAberto.current.X + drag.current.velX * 0.35))
    }
    applyTransform()
    rafId.current = requestAnimationFrame(inertia)
  }

  function onPDown(e: React.PointerEvent<HTMLDivElement>) {
    cancelAnimationFrame(rafId.current)
    drag.current = { on: true, lX: e.clientX, lY: e.clientY, velY: 0, velX: 0 }
    const container = modoRef.current === 'fechado' ? wrapRef.current : wrapAbertoRef.current
    if (container) container.style.cursor = 'grabbing'
    if (hintRef.current) {
      hintRef.current.style.opacity = '0'
      hintRef.current.style.pointerEvents = 'none'
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.preventDefault()
  }

  function onPMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.on) return
    const dx = e.clientX - drag.current.lX
    const dy = e.clientY - drag.current.lY
    drag.current.velY = dx * 0.45
    drag.current.velX = -dy * 0.3
    drag.current.lX = e.clientX
    drag.current.lY = e.clientY
    if (modoRef.current === 'fechado') {
      rot.current.Y += drag.current.velY
      rot.current.X = Math.max(-35, Math.min(25, rot.current.X + drag.current.velX))
    } else {
      rotAberto.current.Y = Math.max(-30, Math.min(30, rotAberto.current.Y + drag.current.velY * 0.35))
      rotAberto.current.X = Math.max(-20, Math.min(20, rotAberto.current.X + drag.current.velX * 0.35))
    }
    if (!rafPending.current) {
      rafPending.current = true
      requestAnimationFrame(() => {
        applyTransform()
        rafPending.current = false
      })
    }
  }

  function onPUp() {
    if (!drag.current.on) return
    drag.current.on = false
    const container = modoRef.current === 'fechado' ? wrapRef.current : wrapAbertoRef.current
    if (container) container.style.cursor = 'grab'
    rafId.current = requestAnimationFrame(inertia)
  }

  return (
    <LazyMotion features={loadFeatures}>
    <div className="flex flex-col items-center gap-4 w-full select-none">

      {/* Rótulo */}
      <div className="text-center">
        <p className="text-xs text-onix-500 uppercase tracking-widest">Prévia do caderno</p>
        <p className="text-sm font-serif text-onix-500 mt-0.5">
          {tamanho} · {formato} · {espessura}
        </p>
      </div>

      {/* Área do preview */}
      <div className="relative" style={{ perspective: '900px', perspectiveOrigin: '50% 42%' }}>
        <AnimatePresence mode="wait">
          {modo === 'fechado' ? (
            <motion.div
              key="fechado"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Camada de eventos — sem transform próprio (evita re-render no drag) */}
              <div
                ref={wrapRef}
                className="touch-none"
                style={{ padding: 40, cursor: 'grab', transform: `scale(${escala})`, transformOrigin: 'center center' } as React.CSSProperties}
                onPointerDown={onPDown}
                onPointerMove={onPMove}
                onPointerUp={onPUp}
                onPointerLeave={onPUp}
                onPointerCancel={onPUp}
              >
                {/* Camada 3D — transform mutado diretamente via bookRef (60fps no compositor) */}
                <div
                  ref={bookRef}
                  style={{
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    transform: `rotateX(${rot.current.X}deg) rotateY(${rot.current.Y}deg)`,
                  } as React.CSSProperties}
                >
                  <Livro3D bW={bW} bH={bH} bD={bD} props={livroProps}/>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="aberto"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}>
              {/* Wrapper drag 360° para a vista aberta */}
              <div
                ref={wrapAbertoRef}
                className="touch-none"
                style={{
                  cursor: 'grab',
                  willChange: 'transform',
                  transformStyle: 'preserve-3d',
                  transform: `perspective(900px) rotateX(${rotAberto.current.X}deg) rotateY(${rotAberto.current.Y}deg)`,
                  filter: 'drop-shadow(4px 8px 24px rgba(26,24,24,0.18))',
                } as React.CSSProperties}
                onPointerDown={onPDown}
                onPointerMove={onPMove}
                onPointerUp={onPUp}
                onPointerLeave={onPUp}
                onPointerCancel={onPUp}
              >
                <VistaAberto {...propsAberto}/>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sombra no chão */}
      {modo === 'fechado' && (
        <div style={{
          width: bW * 0.7, height: 14, marginTop: -20,
          background: 'radial-gradient(ellipse, rgba(20,15,10,0.28) 0%, transparent 70%)',
          filter: 'blur(5px)',
        }}/>
      )}

      {/* Controles de folhear — só visíveis no modo aberto */}
      {modo === 'aberto' && (
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => setSpread(s => Math.max(0, s - 1))}
            disabled={spread === 0}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-ivoire-400 text-onix-500 disabled:opacity-25 hover:bg-ivoire-200 transition-colors"
            aria-label="Página anterior">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
          <span className="text-xs text-onix-500 font-serif tracking-widest min-w-[5rem] text-center">
            {spread === 0 ? 'guarda · 1ª pg' : spread === 1 ? 'miolo' : 'última · guarda'}
          </span>
          <button
            onClick={() => setSpread(s => Math.min(2, s + 1))}
            disabled={spread === 2}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-ivoire-400 text-onix-500 disabled:opacity-25 hover:bg-ivoire-200 transition-colors"
            aria-label="Próxima página">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Dica de rotação — sempre visível, controlada via ref */}
      <p ref={hintRef}
        className="text-xs text-onix-500 tracking-widest flex items-center gap-2 transition-opacity duration-500">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <path d="M1 5h14M10 1l4 4-4 4M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        Arraste para ver 360°
      </p>

      {/* Tags de resumo */}
      <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
        <span className="text-xs bg-ivoire-300 text-onix-600 px-2 py-0.5">{materialCapa}</span>
        <span className="text-xs bg-ivoire-300 text-onix-600 px-2 py-0.5">{tipoEncadernacao}</span>
        <span className="text-xs bg-ivoire-300 text-onix-600 px-2 py-0.5">{padraoPaginas}</span>
        {gravacaoCapa && gravacaoCapa !== 'nenhuma' && nomeGravado && (
          <span className="text-xs bg-ouro-100 text-onix-500 px-2 py-0.5 border border-ouro-300">
            {gravacaoCapa}: &ldquo;{nomeGravado}&rdquo;
          </span>
        )}
        {elasticoAtivo && <span className="text-xs bg-ivoire-300 text-onix-600 px-2 py-0.5">com elástico</span>}
        {marcadorAtivo && <span className="text-xs bg-ivoire-300 text-onix-600 px-2 py-0.5">com marcador</span>}
      </div>
    </div>
    </LazyMotion>
  )
}
