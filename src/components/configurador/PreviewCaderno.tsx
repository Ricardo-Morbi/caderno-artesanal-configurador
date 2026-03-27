'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCadernoStore } from '@/store/useCadernoStore'

type Modo = 'fechado' | 'aberto'

const PROPORCAO_POR_FORMATO: Record<string, { fL: number; fA: number }> = {
  retrato:  { fL: 1,   fA: 1.4 },
  paisagem: { fL: 1.4, fA: 1   },
  quadrado: { fL: 1,   fA: 1   },
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

  if (tipo === 'alto-relevo') {
    const corTexto = ehEscuro ? 'rgba(255,255,255,0.92)' : 'rgba(20,10,5,0.82)'
    const corBase  = ehEscuro ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.35)'
    const corHL    = ehEscuro ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)'
    return (
      <g>
        {linhas.map((l, i) => <text key={`d${i}`} x={textCX+1.2} y={yInicio+i*lineHeight+1.8}
          textAnchor={anchor} dominantBaseline="middle" fontSize={fontSize}
          fontFamily={fontFamily} letterSpacing="0.12em" fill={corBase}>{l}</text>)}
        {linhas.map((l, i) => <text key={`h${i}`} x={textCX-0.4} y={yInicio+i*lineHeight-0.6}
          textAnchor={anchor} dominantBaseline="middle" fontSize={fontSize}
          fontFamily={fontFamily} letterSpacing="0.12em" fill={corHL}>{l}</text>)}
        {linhas.map((l, i) => <text key={i} x={textCX} y={yInicio+i*lineHeight}
          textAnchor={anchor} dominantBaseline="middle" fontSize={fontSize}
          fontFamily={fontFamily} letterSpacing="0.12em" fill={corTexto}>{l}</text>)}
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
}: {
  larguraCapa: number; alturaCapa: number; espessuraLombada: number; raioCanto: number
  corCapa: string; corInternaFolhas: string; corBordaPages: string
  padraoPaginas: string; tipoEncadernacao: string; corFio: string
  marcadorAtivo: boolean; corMarcador: string; pinturaBordasAtiva: boolean; corPinturaBordas: string
}) {
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
      {/* Página esquerda */}
      <rect x={xEsq+3} y={yPag+3} width={pagLarg} height={pagAlt} rx={raioCanto} fill="rgba(0,0,0,0.08)"/>
      <rect x={xEsq} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto} fill={corBordaPages}/>
      <rect x={xEsq} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto} fill={corInternaFolhas}/>
      <g transform={`translate(${xEsq},${yPag})`}>
        {padraoPaginas === 'quadriculado'
          ? <rect width={pagLarg} height={pagAlt} fill="url(#grid-ab)" rx={raioCanto}/>
          : renderPadraoPaginaOffset(padraoPaginas, pagLarg, pagAlt)}
      </g>
      {marcadorAtivo && <rect x={xEsq+pagLarg*0.45} y={yPag} width={2} height={pagAlt+16} fill={corMarcador} rx={1} opacity={0.8}/>}
      {pinturaBordasAtiva && <rect x={xEsq+1} y={yPag+1} width={pagLarg-2} height={pagAlt-2} rx={raioCanto} fill="none" stroke={corPinturaBordas} strokeWidth={1.5} opacity={0.5}/>}
      <rect x={xEsq} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto} fill="url(#sombra-c)"/>
      <rect x={xEsq} y={yPag} width={pagLarg} height={pagAlt*0.35} rx={raioCanto} fill="url(#refl-p)"/>
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
      <g transform={`translate(${xDir},${yPag})`}>
        {padraoPaginas === 'quadriculado'
          ? <rect width={pagLarg} height={pagAlt} fill="url(#grid-ab)" rx={raioCanto}/>
          : renderPadraoPaginaOffset(padraoPaginas, pagLarg, pagAlt)}
      </g>
      {pinturaBordasAtiva && <rect x={xDir+1} y={yPag+1} width={pagLarg-2} height={pagAlt-2} rx={raioCanto} fill="none" stroke={corPinturaBordas} strokeWidth={1.5} opacity={0.5}/>}
      <rect x={xDir} y={yPag} width={pagLarg} height={pagAlt} rx={raioCanto} fill="url(#sombra-cd)"/>
      <rect x={xDir} y={yPag} width={pagLarg} height={pagAlt*0.35} rx={raioCanto} fill="url(#refl-p)"/>
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
  marcadorAtivo, corMarcador, larguraMarcador,
  pinturaBordasAtiva, corPinturaBordas,
  corBordado, tipoTipografia,
}: {
  W: number; H: number; corCapa: string; materialCapa: string; estampaCapa: string
  gravacaoCapa: string; nomeGravado: string; posicaoGravacao: string; aplicacoesCapa: string[]
  raioCanto: number; elasticoAtivo: boolean; corElastico: string; posicaoElastico: string
  marcadorAtivo: boolean; corMarcador: string; larguraMarcador: string
  pinturaBordasAtiva: boolean; corPinturaBordas: string
  corBordado: string; tipoTipografia: string
}) {
  const ehCouro = materialCapa === 'couro' || materialCapa === 'sintetico'
  const lum = luminancia(corCapa)
  const veinColor = lum < 0.45 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'

  // Ribbon variables (computed here to avoid IIFE inside JSX)
  const rW = larguraMarcador === 'fino' ? 3.5 : larguraMarcador === 'largo' ? 8.5 : 5.5
  const rX = W * 0.615
  const rYstart = H * 0.54   // ribbon emerge da metade inferior — só parte de baixo visível
  const tipH = 22

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
        {materialCapa === 'tecido' && (
          <pattern id="tf" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="3" height="3" fill={`${corCapa}25`}/>
            <rect x="3" y="3" width="3" height="3" fill={`${corCapa}25`}/>
          </pattern>
        )}
        {materialCapa === 'kraft' && (
          <pattern id="kf" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="0.9" fill={`${corCapa}35`}/>
          </pattern>
        )}
        {/* Leather grain filter */}
        {ehCouro && (
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
        {/* Ribbon fade-in: simula emerge entre as páginas */}
        <linearGradient id="ribbon-entry-fr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={corCapa} stopOpacity="0.85"/>
          <stop offset="100%" stopColor={corCapa} stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* Base cover */}
      <rect width={W} height={H} rx={raioCanto}
        fill={corCapa}
        filter={ehCouro ? 'url(#grain-fr)' : undefined}/>

      {/* Material overlay */}
      {materialCapa === 'linho'  && <rect width={W} height={H} rx={raioCanto} fill="url(#lf)"/>}
      {materialCapa === 'tecido' && <rect width={W} height={H} rx={raioCanto} fill="url(#tf)"/>}
      {materialCapa === 'kraft'  && <rect width={W} height={H} rx={raioCanto} fill="url(#kf)"/>}

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

      {/* Elástico */}
      {elasticoAtivo && (
        <rect
          x={posicaoElastico === 'vertical' ? W*0.7 : 0}
          y={posicaoElastico === 'vertical' ? 0 : H*0.65}
          width={posicaoElastico === 'vertical' ? 2.5 : W}
          height={posicaoElastico === 'vertical' ? H : 2.5}
          fill={corElastico}/>
      )}

      {/* Marcador — ribbon emerge da metade inferior, ponta saindo embaixo */}
      {marcadorAtivo && (
        <g>
          {/* Sombra lateral direita */}
          <rect x={rX + rW + 0.5} y={rYstart} width={rW * 0.55} height={H - rYstart + tipH}
            fill="rgba(0,0,0,0.18)" rx={0.8}/>
          {/* Corpo do ribbon */}
          <rect x={rX} y={rYstart} width={rW} height={H - rYstart} fill={corMarcador} rx={1}/>
          {/* Ponta triangular (V-cut) */}
          <polygon
            points={`${rX},${H} ${rX + rW},${H} ${rX + rW/2},${H + tipH}`}
            fill={corMarcador}/>
          {/* Brilho longitudinal */}
          <rect x={rX + rW * 0.15} y={rYstart} width={rW * 0.22} height={H - rYstart}
            fill="rgba(255,255,255,0.28)" rx={0.5}/>
          {/* Fade-in no topo: simula ribbon saindo de entre as páginas */}
          <rect x={rX - 0.5} y={rYstart} width={rW + 1} height={16}
            fill="url(#ribbon-entry-fr)" rx={1}/>
          {/* Sombra de entrada — slot entre páginas e capa */}
          <rect x={rX - 2} y={rYstart - 1.5} width={rW + 4} height={3}
            fill="rgba(0,0,0,0.45)" rx={0.8}/>
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

      {/* Highlight aresta esquerda (costura lombada) */}
      <line x1={2} y1={raioCanto*1.5} x2={2} y2={H-raioCanto*1.5}
        stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" style={{ pointerEvents: 'none' }}/>
      <line x1={0.8} y1={raioCanto} x2={0.8} y2={H-raioCanto}
        stroke="rgba(0,0,0,0.22)" strokeWidth="1" style={{ pointerEvents: 'none' }}/>

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
function FaceVerso({ W, H, corCapa, materialCapa, raioCanto }: {
  W: number; H: number; corCapa: string; materialCapa: string; raioCanto: number
}) {
  const ehCouro = materialCapa === 'couro' || materialCapa === 'sintetico'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {ehCouro && (
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
        <linearGradient id="htop-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="white" stopOpacity="0.25"/>
          <stop offset="10%" stopColor="white" stopOpacity="0.0"/>
        </linearGradient>
      </defs>
      <rect width={W} height={H} rx={raioCanto} fill={corCapa}
        filter={ehCouro ? 'url(#grain-v)' : undefined}/>
      {materialCapa === 'linho' && (
        <pattern id="lv" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="4" y2="4" stroke={`${corCapa}55`} strokeWidth="0.6"/>
          <line x1="4" y1="0" x2="0" y2="4" stroke={`${corCapa}55`} strokeWidth="0.6"/>
        </pattern>
      )}
      <rect width={W} height={H} rx={raioCanto} fill="url(#luz-v)"/>
      <rect width={W} height={H} rx={raioCanto} fill="url(#htop-v)"/>
      {/* Highlight aresta direita */}
      <line x1={W-2} y1={raioCanto} x2={W-2} y2={H-raioCanto}
        stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      <line x1={W-0.8} y1={raioCanto} x2={W-0.8} y2={H-raioCanto}
        stroke="rgba(0,0,0,0.22)" strokeWidth="1"/>
    </svg>
  )
}

// ─── Face: Lombada (spine) ────────────────────────────────────
function FaceSpine({ W, H, corCapa, materialCapa, tipoEncadernacao, tipoLombada, corFio }: {
  W: number; H: number; corCapa: string; materialCapa: string
  tipoEncadernacao: string; tipoLombada: string; corFio: string
}) {
  const ehProtegida = tipoLombada === 'protegida'
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
        {materialCapa === 'linho' && (
          <pattern id="ls" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="4" y2="4" stroke={`${corCapa}55`} strokeWidth="0.6"/>
            <line x1="4" y1="0" x2="0" y2="4" stroke={`${corCapa}55`} strokeWidth="0.6"/>
          </pattern>
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
          {materialCapa === 'linho' && <rect width={W} height={H} fill="url(#ls)"/>}
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
function FaceCorte({ W, H, corInternaFolhas, pinturaBordasAtiva, corPinturaBordas }: {
  W: number; H: number; corInternaFolhas: string
  pinturaBordasAtiva: boolean; corPinturaBordas: string
}) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="luz-c2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="white" stopOpacity="0.18"/>
          <stop offset="60%"  stopColor="white" stopOpacity="0.0"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={corInternaFolhas}/>
      {/* Linhas de páginas */}
      {Array.from({ length: Math.floor(H / 1.2) }, (_, i) => (
        <line key={i} x1={0} y1={i*1.2} x2={W} y2={i*1.2}
          stroke="rgba(180,160,140,0.45)" strokeWidth="0.35"/>
      ))}
      {/* Gilding / pintura de bordas */}
      {pinturaBordasAtiva && (
        <rect width={W} height={H} fill={corPinturaBordas} opacity={0.4}/>
      )}
      <rect width={W} height={H} fill="url(#luz-c2)"/>
    </svg>
  )
}

// ─── Face: Topo e Base ────────────────────────────────────────
function FaceTopo({ W, H, corCapa, corInternaFolhas, spineRatio = 0.14 }: {
  W: number; H: number; corCapa: string; corInternaFolhas: string; spineRatio?: number
}) {
  const sW = W * spineRatio
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width={W} height={H} fill={corInternaFolhas}/>
      {Array.from({ length: Math.floor(W*(1-spineRatio)/0.8) }, (_, i) => (
        <line key={i} x1={sW+i*0.8} y1={0} x2={sW+i*0.8} y2={H}
          stroke="rgba(180,160,140,0.4)" strokeWidth="0.25"/>
      ))}
      <rect width={sW} height={H} fill={corCapa} opacity="0.9"/>
      <rect width={W} height={H} fill="rgba(255,255,255,0.12)"/>
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
    marcadorAtivo: boolean; corMarcador: string; larguraMarcador: string
    pinturaBordasAtiva: boolean; corPinturaBordas: string
    corInternaFolhas: string; corBordado: string; tipoTipografia: string
  }
}) {
  const { corCapa, materialCapa, estampaCapa, gravacaoCapa, nomeGravado, posicaoGravacao,
    aplicacoesCapa, raioCanto, tipoEncadernacao, tipoLombada, corFio,
    elasticoAtivo, corElastico, posicaoElastico, marcadorAtivo, corMarcador, larguraMarcador,
    pinturaBordasAtiva, corPinturaBordas, corInternaFolhas, corBordado, tipoTipografia } = props

  const face: React.CSSProperties = { position: 'absolute', overflow: 'hidden' }
  const faceOpen: React.CSSProperties = { position: 'absolute', overflow: 'visible' }
  const W = bW, H = bH, D = bD

  return (
    <div style={{ width: W, height: H, position: 'relative', transformStyle: 'preserve-3d' }}>

      {/* FRENTE — overflow visible para ponta do marcador sair embaixo */}
      <div style={{ ...faceOpen, width: W, height: H, left: 0, top: 0,
        transform: `translateZ(${D/2}px)`, backfaceVisibility: 'hidden' }}>
        <FaceFrente W={W} H={H} corCapa={corCapa} materialCapa={materialCapa}
          estampaCapa={estampaCapa} gravacaoCapa={gravacaoCapa} nomeGravado={nomeGravado}
          posicaoGravacao={posicaoGravacao} aplicacoesCapa={aplicacoesCapa}
          raioCanto={raioCanto} elasticoAtivo={elasticoAtivo} corElastico={corElastico}
          posicaoElastico={posicaoElastico} marcadorAtivo={marcadorAtivo} corMarcador={corMarcador}
          larguraMarcador={larguraMarcador}
          pinturaBordasAtiva={pinturaBordasAtiva} corPinturaBordas={corPinturaBordas}
          corBordado={corBordado} tipoTipografia={tipoTipografia}/>
      </div>

      {/* VERSO */}
      <div style={{ ...face, width: W, height: H, left: 0, top: 0,
        transform: `rotateY(180deg) translateZ(${D/2}px)`, backfaceVisibility: 'hidden' }}>
        <FaceVerso W={W} H={H} corCapa={corCapa} materialCapa={materialCapa} raioCanto={raioCanto}/>
      </div>

      {/* LOMBADA (esquerda) */}
      <div style={{ ...face, width: D, height: H, left: (W-D)/2, top: 0,
        transform: `rotateY(-90deg) translateZ(${W/2}px)`, backfaceVisibility: 'hidden' }}>
        <FaceSpine W={D} H={H} corCapa={corCapa} materialCapa={materialCapa}
          tipoEncadernacao={tipoEncadernacao} tipoLombada={tipoLombada} corFio={corFio}/>
      </div>

      {/* CORTE / páginas (direita) */}
      <div style={{ ...face, width: D, height: H, left: (W-D)/2, top: 0,
        transform: `rotateY(90deg) translateZ(${W/2}px)`, backfaceVisibility: 'hidden' }}>
        <FaceCorte W={D} H={H} corInternaFolhas={corInternaFolhas}
          pinturaBordasAtiva={pinturaBordasAtiva} corPinturaBordas={corPinturaBordas}/>
      </div>

      {/* TOPO */}
      <div style={{ ...face, width: W, height: D, left: 0, top: (H-D)/2,
        transform: `rotateX(90deg) translateZ(${H/2}px)`, backfaceVisibility: 'hidden' }}>
        <FaceTopo W={W} H={D} corCapa={corCapa} corInternaFolhas={corInternaFolhas}/>
      </div>

      {/* BASE */}
      <div style={{ ...face, width: W, height: D, left: 0, top: (H-D)/2,
        transform: `rotateX(-90deg) translateZ(${H/2}px)`, backfaceVisibility: 'hidden' }}>
        <FaceTopo W={W} H={D} corCapa={corCapa} corInternaFolhas={corInternaFolhas}/>
      </div>
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────
export default function PreviewCaderno() {
  const { configuracao } = useCadernoStore()
  const [modo, setModo] = useState<Modo>('fechado')

  // Refs para manipulação DOM direta — zero re-renders durante drag
  const wrapRef    = useRef<HTMLDivElement>(null)
  const bookRef    = useRef<HTMLDivElement>(null)
  const hintRef    = useRef<HTMLParagraphElement>(null)
  const rot        = useRef({ Y: 20, X: -10 })
  const drag       = useRef({ on: false, lX: 0, lY: 0, velY: 0, velX: 0 })
  const rafId      = useRef(0)
  const rafPending = useRef(false)   // RAF scheduling — limita DOM writes a 60fps

  const {
    tamanho, formato, espessura,
    corCapa, materialCapa, estampaCapa,
    gravacaoCapa, nomeGravado, posicaoGravacao, aplicacoesCapa,
    tipoTipografia, corBordado,
    tipoEncadernacao, tipoLombada, corFio,
    elasticoAtivo, corElastico, posicaoElastico,
    marcadorAtivo, corMarcador, larguraMarcador,
    tipoCantos, pinturaBordasAtiva, corPinturaBordas,
    padraoPaginas, corFolhas,
  } = configuracao

  const prop = PROPORCAO_POR_FORMATO[formato] ?? PROPORCAO_POR_FORMATO['retrato']
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

  const livroProps = {
    corCapa, materialCapa, estampaCapa, gravacaoCapa, nomeGravado,
    posicaoGravacao, aplicacoesCapa: aplicacoesCapa ?? [],
    raioCanto, tipoEncadernacao, tipoLombada, corFio,
    elasticoAtivo: elasticoAtivo ?? false, corElastico, posicaoElastico,
    marcadorAtivo: marcadorAtivo ?? false, corMarcador, larguraMarcador: larguraMarcador ?? 'medio',
    pinturaBordasAtiva: pinturaBordasAtiva ?? false, corPinturaBordas,
    corInternaFolhas, corBordado: corBordado ?? '#F5DFA0', tipoTipografia: tipoTipografia ?? 'serif',
  }

  const propsAberto = {
    larguraCapa, alturaCapa, espessuraLombada, raioCanto,
    corCapa, corInternaFolhas, corBordaPages,
    padraoPaginas, tipoEncadernacao, corFio,
    marcadorAtivo: marcadorAtivo ?? false, corMarcador,
    pinturaBordasAtiva: pinturaBordasAtiva ?? false, corPinturaBordas,
  }

  // Aplica rotação diretamente no DOM — sem passar pelo React
  function applyTransform() {
    if (bookRef.current)
      bookRef.current.style.transform = `rotateX(${rot.current.X}deg) rotateY(${rot.current.Y}deg)`
  }

  // Inércia pós-drag via rAF — decaimento exponencial
  function inertia() {
    drag.current.velY *= 0.93
    drag.current.velX *= 0.93
    if (Math.abs(drag.current.velY) < 0.06 && Math.abs(drag.current.velX) < 0.06) return
    rot.current.Y += drag.current.velY
    rot.current.X = Math.max(-35, Math.min(25, rot.current.X + drag.current.velX))
    applyTransform()
    rafId.current = requestAnimationFrame(inertia)
  }

  function onPDown(e: React.PointerEvent<HTMLDivElement>) {
    if (modo !== 'fechado') return
    cancelAnimationFrame(rafId.current)
    drag.current = { on: true, lX: e.clientX, lY: e.clientY, velY: 0, velX: 0 }
    if (wrapRef.current) wrapRef.current.style.cursor = 'grabbing'
    if (hintRef.current) {
      hintRef.current.style.opacity = '0'
      hintRef.current.style.pointerEvents = 'none'
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.preventDefault()
  }

  function onPMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.on) return
    // Delta-based: velocidade = deslocamento desde o último evento
    const dx = e.clientX - drag.current.lX
    const dy = e.clientY - drag.current.lY
    drag.current.velY = dx * 0.45
    drag.current.velX = -dy * 0.3
    drag.current.lX = e.clientX
    drag.current.lY = e.clientY
    rot.current.Y += drag.current.velY
    rot.current.X = Math.max(-35, Math.min(25, rot.current.X + drag.current.velX))
    // RAF scheduling — garante exatamente 60fps, evita writes acima da taxa do monitor
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
    if (wrapRef.current) wrapRef.current.style.cursor = 'grab'
    // Inicia inércia com a velocidade acumulada no último frame
    rafId.current = requestAnimationFrame(inertia)
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full select-none">

      {/* Rótulo */}
      <div className="text-center">
        <p className="text-xs text-onix-300 uppercase tracking-widest">Prévia do caderno</p>
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
                style={{ padding: 40, cursor: 'grab' } as React.CSSProperties}
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
              transition={{ duration: 0.3 }}
              style={{ filter: 'drop-shadow(4px 8px 24px rgba(26,24,24,0.18))' }}>
              <VistaAberto {...propsAberto}/>
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

      {/* Dica de rotação — visibilidade controlada via ref, sem re-render */}
      {modo === 'fechado' && (
        <p ref={hintRef}
          className="text-xs text-onix-200 tracking-widest flex items-center gap-2 transition-opacity duration-500">
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
            <path d="M1 5h14M10 1l4 4-4 4M6 1L2 5l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Arraste para ver 360°
        </p>
      )}

      {/* Botão Abrir / Fechar */}
      <button
        onClick={() => setModo(m => m === 'fechado' ? 'aberto' : 'fechado')}
        className="text-xs font-sans tracking-widest uppercase border border-ivoire-400 hover:border-onix-400 text-onix-400 hover:text-onix-600 px-5 py-2 transition-all duration-150"
      >
        {modo === 'fechado' ? 'Abrir caderno' : 'Fechar caderno'}
      </button>

      {/* Tags de resumo */}
      <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
        <span className="text-xs bg-ivoire-300 text-onix-400 px-2 py-0.5">{materialCapa}</span>
        <span className="text-xs bg-ivoire-300 text-onix-400 px-2 py-0.5">{tipoEncadernacao}</span>
        <span className="text-xs bg-ivoire-300 text-onix-400 px-2 py-0.5">{padraoPaginas}</span>
        {gravacaoCapa && gravacaoCapa !== 'nenhuma' && nomeGravado && (
          <span className="text-xs bg-ouro-100 text-onix-500 px-2 py-0.5 border border-ouro-300">
            {gravacaoCapa}: &ldquo;{nomeGravado}&rdquo;
          </span>
        )}
        {elasticoAtivo && <span className="text-xs bg-ivoire-300 text-onix-400 px-2 py-0.5">com elástico</span>}
        {marcadorAtivo && <span className="text-xs bg-ivoire-300 text-onix-400 px-2 py-0.5">com marcador</span>}
      </div>
    </div>
  )
}
