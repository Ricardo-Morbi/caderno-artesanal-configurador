'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCadernoStore } from '@/store/useCadernoStore'

// Dimensões base para cada tamanho (proporção visual)
const PROPORCAO_POR_FORMATO: Record<string, { fatorLargura: number; fatorAltura: number }> = {
  retrato:  { fatorLargura: 1,   fatorAltura: 1.4 },
  paisagem: { fatorLargura: 1.4, fatorAltura: 1   },
  quadrado: { fatorLargura: 1,   fatorAltura: 1   },
}

const ESPESSURA_POR_TIPO: Record<string, number> = {
  fino:          14,
  medio:         22,
  grosso:        32,
  'extra-grosso':44,
}

// Padrão SVG para diferentes materiais da capa
function padraoMaterial(material: string, corCapa: string) {
  switch (material) {
    case 'linho':
      return (
        <pattern id="linho" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="4" y2="4" stroke={`${corCapa}55`} strokeWidth="0.5" />
          <line x1="4" y1="0" x2="0" y2="4" stroke={`${corCapa}55`} strokeWidth="0.5" />
        </pattern>
      )
    case 'tecido':
      return (
        <pattern id="tecido" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill={`${corCapa}22`} />
          <rect x="3" y="3" width="3" height="3" fill={`${corCapa}22`} />
        </pattern>
      )
    case 'kraft':
      return (
        <pattern id="kraft" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="0.8" fill={`${corCapa}33`} />
        </pattern>
      )
    default:
      return null
  }
}

// Padrão interno para as páginas
function padraoPagina(padrao: string) {
  switch (padrao) {
    case 'pautado':
      return Array.from({ length: 8 }, (_, i) => (
        <line
          key={i}
          x1="8" y1={24 + i * 14}
          x2="92" y2={24 + i * 14}
          stroke="#C4A08A" strokeWidth="0.5" opacity="0.6"
        />
      ))
    case 'pontilhado':
      return Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={12 + col * 11} cy={24 + row * 14}
            r="0.8" fill="#C4A08A" opacity="0.5"
          />
        ))
      ).flat()
    case 'quadriculado':
      return (
        <pattern id="grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#C4A08A" strokeWidth="0.4" opacity="0.5" />
        </pattern>
      )
    default:
      return null
  }
}

// Calcular luminância do hex para escolher cor de contraste do texto gravado
function luminancia(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

// Calcula Y do texto baseado na posição escolhida
function calcularCY(posicao: string, cy: number, altura: number): number {
  switch (posicao) {
    case 'terco-superior':    return cy - altura * 0.28
    case 'terco-inferior':    return cy + altura * 0.28
    case 'canto-inf-direito': return cy + altura * 0.38
    default:                  return cy  // 'centro'
  }
}

// Renderiza o texto gravado na capa com a estética do tipo escolhido
function GravacaoCapa({
  texto, tipo, posicao, cx, cy, largura, altura, corCapa,
}: {
  texto: string
  tipo: string
  posicao: string
  cx: number
  cy: number
  largura: number
  altura: number
  corCapa: string
}) {
  if (!texto || tipo === 'nenhuma') return null

  const lum = corCapa.startsWith('#') ? luminancia(corCapa) : 0.5
  const ehEscuro = lum < 0.45

  // Posição Y ajustada
  const textCY = calcularCY(posicao, cy, altura)
  // Para assinatura: alinhar à direita
  const textCX = posicao === 'canto-inf-direito' ? cx + largura * 0.28 : cx
  const anchor  = posicao === 'canto-inf-direito' ? 'end' : 'middle'

  // Quebra o texto em linhas (máx 18 chars por linha)
  const palavras = texto.split(' ')
  const linhas: string[] = []
  let linhaAtual = ''
  for (const p of palavras) {
    if ((linhaAtual + ' ' + p).trim().length > 18) {
      linhas.push(linhaAtual.trim())
      linhaAtual = p
    } else {
      linhaAtual = (linhaAtual + ' ' + p).trim()
    }
  }
  if (linhaAtual) linhas.push(linhaAtual.trim())

  const fontSize   = posicao === 'canto-inf-direito'
    ? Math.min(largura / 14, 7)
    : Math.min(largura / 10, 10)
  const lineHeight = fontSize * 1.6
  const totalHeight = linhas.length * lineHeight
  const yInicio = textCY - totalHeight / 2 + lineHeight / 2

  if (tipo === 'baixo-relevo') {
    const corTexto = ehEscuro ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.22)'
    const corSombra = ehEscuro ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.75)'
    return (
      <g>
        <defs>
          <filter id="baixo-relevo-filter" x="-20%" y="-20%" width="140%" height="140%">
            {/* Sombra interna — luz vem de cima-esquerda */}
            <feDropShadow dx="0.6" dy="0.8" stdDeviation="0.4" floodColor={corSombra} floodOpacity="1" result="shadow-out" />
            <feDropShadow dx="-0.4" dy="-0.5" stdDeviation="0.3"
              floodColor={ehEscuro ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'}
              floodOpacity="1" result="highlight" />
          </filter>
        </defs>
        {linhas.map((linha, i) => (
          <text key={i}
            x={textCX} y={yInicio + i * lineHeight}
            textAnchor={anchor} dominantBaseline="middle"
            fontSize={fontSize} fontFamily="Georgia, serif"
            letterSpacing="0.12em" fill={corTexto}
            filter="url(#baixo-relevo-filter)"
          >{linha}</text>
        ))}
      </g>
    )
  }

  if (tipo === 'alto-relevo') {
    const corTexto    = ehEscuro ? 'rgba(255,255,255,0.92)' : 'rgba(20,10,5,0.82)'
    const corBase     = ehEscuro ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.35)'
    const corHighlight= ehEscuro ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)'
    return (
      <g>
        {/* Sombra de profundidade (fundo) */}
        {linhas.map((linha, i) => (
          <text key={`d-${i}`}
            x={textCX + 1.2} y={yInicio + i * lineHeight + 1.8}
            textAnchor={anchor} dominantBaseline="middle"
            fontSize={fontSize} fontFamily="Georgia, serif"
            letterSpacing="0.12em" fill={corBase}
          >{linha}</text>
        ))}
        {/* Highlight superior (topo elevado) */}
        {linhas.map((linha, i) => (
          <text key={`h-${i}`}
            x={textCX - 0.4} y={yInicio + i * lineHeight - 0.6}
            textAnchor={anchor} dominantBaseline="middle"
            fontSize={fontSize} fontFamily="Georgia, serif"
            letterSpacing="0.12em" fill={corHighlight}
          >{linha}</text>
        ))}
        {/* Texto principal */}
        {linhas.map((linha, i) => (
          <text key={i}
            x={textCX} y={yInicio + i * lineHeight}
            textAnchor={anchor} dominantBaseline="middle"
            fontSize={fontSize} fontFamily="Georgia, serif"
            letterSpacing="0.12em" fill={corTexto}
          >{linha}</text>
        ))}
      </g>
    )
  }

  if (tipo === 'bordado') {
    // Cores do fio — contrastantes e saturadas como linha de bordar real
    const corFioPrincipal = ehEscuro ? '#F5DFA0' : '#7B2D2D'
    const corFioSombra    = ehEscuro ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.3)'
    const corFioHighlight = ehEscuro ? 'rgba(255,255,220,0.6)' : 'rgba(255,180,120,0.5)'

    // Largura do texto estimada para decoração
    const largTextoEst = Math.min(texto.length * fontSize * 0.6, largura * 0.7)

    return (
      <g>
        <defs>
          {/* Filtro de textura de fio */}
          <filter id="bordado-filter" x="-5%" y="-20%" width="110%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {linhas.map((linha, i) => {
          const y = yInicio + i * lineHeight
          const xEsq = textCX - largTextoEst / 2
          const xDir = textCX + largTextoEst / 2

          return (
            <g key={i}>
              {/* ── Linhas decorativas de bastidor ── */}
              {i === 0 && (
                <>
                  {/* Linha superior decorativa */}
                  <line x1={xEsq} y1={y - fontSize * 1.1}
                    x2={xDir} y2={y - fontSize * 1.1}
                    stroke={corFioPrincipal} strokeWidth="0.5"
                    strokeDasharray="1.5 1.2" opacity="0.5" strokeLinecap="round" />
                  {/* Pontos cruzados nas extremidades (ponto de ancoragem) */}
                  <line x1={xEsq - 1} y1={y - fontSize * 1.3} x2={xEsq + 1} y2={y - fontSize * 0.9}
                    stroke={corFioPrincipal} strokeWidth="0.6" />
                  <line x1={xEsq + 1} y1={y - fontSize * 1.3} x2={xEsq - 1} y2={y - fontSize * 0.9}
                    stroke={corFioPrincipal} strokeWidth="0.6" />
                  <line x1={xDir - 1} y1={y - fontSize * 1.3} x2={xDir + 1} y2={y - fontSize * 0.9}
                    stroke={corFioPrincipal} strokeWidth="0.6" />
                  <line x1={xDir + 1} y1={y - fontSize * 1.3} x2={xDir - 1} y2={y - fontSize * 0.9}
                    stroke={corFioPrincipal} strokeWidth="0.6" />
                </>
              )}
              {i === linhas.length - 1 && (
                <>
                  {/* Linha inferior decorativa */}
                  <line x1={xEsq} y1={y + fontSize * 0.9}
                    x2={xDir} y2={y + fontSize * 0.9}
                    stroke={corFioPrincipal} strokeWidth="0.5"
                    strokeDasharray="1.5 1.2" opacity="0.5" strokeLinecap="round" />
                  <line x1={xEsq - 1} y1={y + fontSize * 0.7} x2={xEsq + 1} y2={y + fontSize * 1.1}
                    stroke={corFioPrincipal} strokeWidth="0.6" />
                  <line x1={xEsq + 1} y1={y + fontSize * 0.7} x2={xEsq - 1} y2={y + fontSize * 1.1}
                    stroke={corFioPrincipal} strokeWidth="0.6" />
                  <line x1={xDir - 1} y1={y + fontSize * 0.7} x2={xDir + 1} y2={y + fontSize * 1.1}
                    stroke={corFioPrincipal} strokeWidth="0.6" />
                  <line x1={xDir + 1} y1={y + fontSize * 0.7} x2={xDir - 1} y2={y + fontSize * 1.1}
                    stroke={corFioPrincipal} strokeWidth="0.6" />
                </>
              )}

              {/* ── Texto bordado em 3 camadas ── */}

              {/* Camada 1: sombra de profundidade */}
              <text
                x={textCX + 0.7} y={y + 1}
                textAnchor={anchor} dominantBaseline="middle"
                fontSize={fontSize} fontFamily="Georgia, serif"
                letterSpacing="0.1em"
                fill="none" stroke={corFioSombra} strokeWidth={2.8}
                strokeLinecap="round" strokeLinejoin="round"
              >{linha}</text>

              {/* Camada 2: fio principal grosso (corpo do bordado) */}
              <text
                x={textCX} y={y}
                textAnchor={anchor} dominantBaseline="middle"
                fontSize={fontSize} fontFamily="Georgia, serif"
                letterSpacing="0.1em"
                fill="none" stroke={corFioPrincipal} strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round"
              >{linha}</text>

              {/* Camada 3: textura de ponto (linha fina tracejada por cima) */}
              <text
                x={textCX} y={y}
                textAnchor={anchor} dominantBaseline="middle"
                fontSize={fontSize} fontFamily="Georgia, serif"
                letterSpacing="0.1em"
                fill="none" stroke={corFioPrincipal} strokeWidth={1.2}
                strokeDasharray="1.8 1.4" strokeLinecap="round" strokeLinejoin="round"
                opacity="0.9"
              >{linha}</text>

              {/* Camada 4: highlight do fio (brilho do fio metálico) */}
              <text
                x={textCX - 0.3} y={y - 0.5}
                textAnchor={anchor} dominantBaseline="middle"
                fontSize={fontSize} fontFamily="Georgia, serif"
                letterSpacing="0.1em"
                fill="none" stroke={corFioHighlight} strokeWidth={0.6}
                strokeLinecap="round" strokeLinejoin="round"
                opacity="0.7"
              >{linha}</text>
            </g>
          )
        })}
      </g>
    )
  }

  return null
}

// Aplicações decorativas da capa
function AplicacoesCapa({
  aplicacoes, cx, cy, largura, altura, raioCanto,
}: {
  aplicacoes: string[]
  cx: number
  cy: number
  largura: number
  altura: number
  raioCanto: number
}) {
  if (!aplicacoes || aplicacoes.length === 0) return null

  return (
    <g opacity="0.85">
      {/* Cantoneiras metálicas */}
      {aplicacoes.includes('metais') && (
        <g stroke="#D4AF37" strokeWidth="1.2" fill="none">
          {/* Canto superior esquerdo */}
          <path d={`M ${cx - largura / 2 + 2} ${cy - altura / 2 + 10} L ${cx - largura / 2 + 2} ${cy - altura / 2 + 2} L ${cx - largura / 2 + 12} ${cy - altura / 2 + 2}`} />
          {/* Canto superior direito */}
          <path d={`M ${cx + largura / 2 - 12} ${cy - altura / 2 + 2} L ${cx + largura / 2 - 2} ${cy - altura / 2 + 2} L ${cx + largura / 2 - 2} ${cy - altura / 2 + 10}`} />
          {/* Canto inferior esquerdo */}
          <path d={`M ${cx - largura / 2 + 2} ${cy + altura / 2 - 10} L ${cx - largura / 2 + 2} ${cy + altura / 2 - 2} L ${cx - largura / 2 + 12} ${cy + altura / 2 - 2}`} />
          {/* Canto inferior direito */}
          <path d={`M ${cx + largura / 2 - 12} ${cy + altura / 2 - 2} L ${cx + largura / 2 - 2} ${cy + altura / 2 - 2} L ${cx + largura / 2 - 2} ${cy + altura / 2 - 10}`} />
        </g>
      )}

      {/* Renda — borda decorativa pontilhada */}
      {aplicacoes.includes('renda') && (
        <rect
          x={cx - largura / 2 + 3}
          y={cy - altura / 2 + 3}
          width={largura - 6}
          height={altura - 6}
          rx={raioCanto}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
          strokeDasharray="1.5 2"
        />
      )}

      {/* Botões decorativos */}
      {aplicacoes.includes('botoes') && (
        <g>
          <circle cx={cx} cy={cy + altura / 2 - 12} r={5} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          <circle cx={cx} cy={cy + altura / 2 - 12} r={2.5} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
          <circle cx={cx - 2} cy={cy + altura / 2 - 13} r={0.6} fill="rgba(255,255,255,0.7)" />
          <circle cx={cx + 2} cy={cy + altura / 2 - 13} r={0.6} fill="rgba(255,255,255,0.7)" />
          <circle cx={cx - 2} cy={cy + altura / 2 - 11} r={0.6} fill="rgba(255,255,255,0.7)" />
          <circle cx={cx + 2} cy={cy + altura / 2 - 11} r={0.6} fill="rgba(255,255,255,0.7)" />
        </g>
      )}

      {/* Recortes — vazados nos cantos */}
      {aplicacoes.includes('recortes') && (
        <g fill="rgba(0,0,0,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5">
          <circle cx={cx - largura / 2 + 8} cy={cy} r={3} />
          <circle cx={cx + largura / 2 - 8} cy={cy} r={3} />
        </g>
      )}
    </g>
  )
}

export default function PreviewCaderno() {
  const { configuracao } = useCadernoStore()

  const {
    tamanho, formato, espessura,
    corCapa, materialCapa, estampaCapa,
    gravacaoCapa, nomeGravado, posicaoGravacao, aplicacoesCapa,
    tipoEncadernacao, tipoLombada,
    elasticoAtivo, corElastico, posicaoElastico,
    marcadorAtivo, corMarcador, corFio,
    tipoCantos, pinturaBordasAtiva, corPinturaBordas,
    padraoPaginas, corFolhas,
  } = configuracao

  const proporcao = PROPORCAO_POR_FORMATO[formato] ?? PROPORCAO_POR_FORMATO['retrato']
  const espessuraLombada = ESPESSURA_POR_TIPO[espessura] ?? 22

  const larguraCapa = 148 * proporcao.fatorLargura
  const alturaCapa  = 148 * proporcao.fatorAltura

  const corFolhasMap: Record<string, string> = {
    branca:   '#FAFAF8',
    creme:    '#F5F0E0',
    colorida: '#E8F0D8',
  }
  const corInternaFolhas = corFolhasMap[corFolhas] ?? '#FAFAF8'
  const raioCanto = tipoCantos === 'arredondados' ? 8 : 2
  const corBordaPages = pinturaBordasAtiva ? corPinturaBordas : corInternaFolhas

  const viewBoxLargura = larguraCapa + espessuraLombada + 80
  const viewBoxAltura  = alturaCapa + 80

  // Centro da capa para posicionar a gravação
  const capaCX = 38 + espessuraLombada + larguraCapa / 2
  const capaCY = 32 + alturaCapa / 2

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* Rótulo */}
      <div className="text-center">
        <p className="text-xs text-onix-300 uppercase tracking-widest">Prévia do caderno</p>
        <p className="text-sm font-serif text-onix-500 mt-0.5">
          {tamanho} · {formato} · {espessura}
        </p>
      </div>

      {/* SVG do caderno */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{
          filter: 'drop-shadow(8px 12px 32px rgba(26,24,24,0.18)) drop-shadow(2px 4px 12px rgba(26,24,24,0.10))',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.svg
            key={`${tamanho}-${formato}-${espessura}`}
            viewBox={`0 0 ${viewBoxLargura} ${viewBoxAltura}`}
            width={Math.min(viewBoxLargura * 1.8, 380)}
            height={Math.min(viewBoxAltura * 1.8, 420)}
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <defs>
              {padraoMaterial(materialCapa, corCapa)}
              {padraoPaginas === 'quadriculado' && (
                <pattern id="grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#C4A08A" strokeWidth="0.4" opacity="0.5" />
                </pattern>
              )}
              <linearGradient id="reflexo" x1="0" y1="0" x2="0.5" y2="1">
                <stop offset="0%"   stopColor="white" stopOpacity="0.12" />
                <stop offset="40%"  stopColor="white" stopOpacity="0.04" />
                <stop offset="100%" stopColor="black" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* MIOLO */}
            <motion.rect
              x={espessuraLombada + 42} y={36}
              width={larguraCapa - 4} height={alturaCapa}
              rx={raioCanto} ry={raioCanto}
              fill={corBordaPages}
              animate={{ fill: corBordaPages }}
              transition={{ duration: 0.3 }}
            />
            <motion.rect
              x={espessuraLombada + 40} y={34}
              width={larguraCapa - 4} height={alturaCapa}
              rx={raioCanto} ry={raioCanto}
              fill={corInternaFolhas}
              animate={{ fill: corInternaFolhas }}
              transition={{ duration: 0.3 }}
            />
            <g transform={`translate(${espessuraLombada + 40}, 34)`}>
              {padraoPaginas === 'quadriculado' ? (
                <rect width={larguraCapa - 4} height={alturaCapa} fill="url(#grid)" rx={raioCanto} />
              ) : (
                padraoPagina(padraoPaginas)
              )}
            </g>

            {/* LOMBADA */}
            <motion.rect
              x={38} y={32}
              width={espessuraLombada} height={alturaCapa + 4}
              rx={tipoLombada === 'exposta' ? 3 : 0}
              fill={tipoLombada === 'exposta' ? 'transparent' : corCapa}
              animate={{ fill: tipoLombada === 'exposta' ? 'transparent' : corCapa }}
              transition={{ duration: 0.3 }}
            />
            {tipoLombada === 'exposta' && tipoEncadernacao !== 'espiral' && (
              <g>
                {tipoEncadernacao === 'copta' &&
                  Array.from({ length: Math.floor(alturaCapa / 18) }, (_, i) => (
                    <line key={i} x1={38} y1={40 + i * 18} x2={38 + espessuraLombada} y2={40 + i * 18}
                      stroke={corFio} strokeWidth="1.5" strokeLinecap="round" />
                  ))
                }
                {tipoEncadernacao === 'japonesa' &&
                  Array.from({ length: Math.floor(alturaCapa / 12) }, (_, i) => (
                    <g key={i}>
                      <line x1={38} y1={38 + i * 12} x2={38 + espessuraLombada} y2={38 + i * 12}
                        stroke={corFio} strokeWidth="1" />
                      {i % 2 === 0 && (
                        <line x1={42} y1={38 + i * 12} x2={42} y2={38 + (i + 1) * 12}
                          stroke={corFio} strokeWidth="1" />
                      )}
                    </g>
                  ))
                }
                {tipoEncadernacao === 'long-stitch' &&
                  Array.from({ length: Math.floor(alturaCapa / 22) }, (_, i) => (
                    <g key={i}>
                      <line x1={38} y1={38 + i * 22} x2={38 + espessuraLombada} y2={38 + i * 22}
                        stroke={corFio} strokeWidth="1.5" />
                      <line x1={38 + espessuraLombada / 2} y1={38 + i * 22}
                        x2={38 + espessuraLombada / 2} y2={38 + (i + 1) * 22}
                        stroke={corFio} strokeWidth="1" />
                    </g>
                  ))
                }
              </g>
            )}
            {tipoEncadernacao === 'espiral' &&
              Array.from({ length: Math.floor(alturaCapa / 14) }, (_, i) => (
                <ellipse key={i}
                  cx={38 + espessuraLombada / 2} cy={40 + i * 14}
                  rx={espessuraLombada / 2 + 2} ry={5}
                  fill="none" stroke={corFio} strokeWidth="1.5" />
              ))
            }

            {/* CAPA */}
            <motion.rect
              x={38 + espessuraLombada} y={32}
              width={larguraCapa} height={alturaCapa + 4}
              rx={raioCanto} ry={raioCanto}
              fill={corCapa}
              animate={{ fill: corCapa }}
              transition={{ duration: 0.4 }}
            />

            {/* Overlay de material */}
            {['linho', 'tecido', 'kraft'].includes(materialCapa) && (
              <rect
                x={38 + espessuraLombada} y={32}
                width={larguraCapa} height={alturaCapa + 4}
                rx={raioCanto} ry={raioCanto}
                fill={`url(#${materialCapa})`}
              />
            )}

            {/* Estampa floral */}
            {estampaCapa === 'floral' && (
              <g opacity="0.25" transform={`translate(${38 + espessuraLombada + larguraCapa * 0.5}, ${32 + alturaCapa * 0.5})`}>
                {[0, 60, 120, 180, 240, 300].map((angulo, i) => {
                  const rad = (angulo * Math.PI) / 180
                  const x = Math.cos(rad) * 18
                  const y = Math.sin(rad) * 18
                  return (
                    <ellipse key={i} cx={x} cy={y} rx={8} ry={5} fill="#FDF8F0"
                      transform={`rotate(${angulo} ${x} ${y})`} />
                  )
                })}
                <circle cx={0} cy={0} r={6} fill="#FDF8F0" />
              </g>
            )}

            {/* Estampa minimalista */}
            {estampaCapa === 'minimalista' && (
              <g opacity="0.2" transform={`translate(${38 + espessuraLombada}, 32)`}>
                <line x1={larguraCapa * 0.2} y1={alturaCapa * 0.2}
                  x2={larguraCapa * 0.8} y2={alturaCapa * 0.8} stroke="#FDF8F0" strokeWidth="1" />
                <rect x={larguraCapa * 0.25} y={alturaCapa * 0.3}
                  width={larguraCapa * 0.5} height={alturaCapa * 0.4}
                  fill="none" stroke="#FDF8F0" strokeWidth="0.8" />
              </g>
            )}

            {/* Reflexo de luz */}
            <rect
              x={38 + espessuraLombada} y={32}
              width={larguraCapa} height={alturaCapa + 4}
              rx={raioCanto} ry={raioCanto}
              fill="url(#reflexo)" style={{ pointerEvents: 'none' }}
            />

            {/* ── GRAVAÇÃO NA CAPA ── */}
            <GravacaoCapa
              texto={nomeGravado ?? ''}
              tipo={gravacaoCapa ?? 'nenhuma'}
              posicao={posicaoGravacao ?? 'centro'}
              cx={capaCX}
              cy={capaCY}
              largura={larguraCapa}
              altura={alturaCapa}
              corCapa={corCapa}
            />

            {/* ── APLICAÇÕES DECORATIVAS ── */}
            <AplicacoesCapa
              aplicacoes={aplicacoesCapa ?? []}
              cx={capaCX}
              cy={capaCY}
              largura={larguraCapa}
              altura={alturaCapa}
              raioCanto={raioCanto}
            />

            {/* ELÁSTICO */}
            {elasticoAtivo && (
              <motion.rect
                x={posicaoElastico === 'vertical'
                  ? 38 + espessuraLombada + larguraCapa * 0.7
                  : 38 + espessuraLombada}
                y={posicaoElastico === 'vertical' ? 32 : 32 + alturaCapa * 0.65}
                width={posicaoElastico === 'vertical' ? 2.5 : larguraCapa + espessuraLombada}
                height={posicaoElastico === 'vertical' ? alturaCapa + 4 : 2.5}
                fill={corElastico}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, fill: corElastico }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* MARCADOR */}
            {marcadorAtivo && (
              <motion.rect
                x={38 + espessuraLombada + larguraCapa * 0.5 - 1}
                y={32}
                width={2.5} height={alturaCapa + 32}
                fill={corMarcador} rx={1}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1, fill: corMarcador }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: 'top' }}
              />
            )}

            {/* PINTURA NAS BORDAS */}
            {pinturaBordasAtiva && (
              <motion.rect
                x={38 + espessuraLombada + 2} y={34}
                width={larguraCapa - 4} height={alturaCapa}
                rx={raioCanto} ry={raioCanto}
                fill="none" stroke={corPinturaBordas} strokeWidth={2} opacity={0.6}
                animate={{ stroke: corPinturaBordas }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.svg>
        </AnimatePresence>
      </motion.div>

      {/* Resumo das opções */}
      <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
        <span className="text-xs bg-ivoire-300 text-onix-400 px-2 py-0.5">{materialCapa}</span>
        <span className="text-xs bg-ivoire-300 text-onix-400 px-2 py-0.5">{tipoEncadernacao}</span>
        <span className="text-xs bg-ivoire-300 text-onix-400 px-2 py-0.5">{padraoPaginas}</span>
        {gravacaoCapa && gravacaoCapa !== 'nenhuma' && nomeGravado && (
          <span className="text-xs bg-ouro-100 text-onix-500 px-2 py-0.5 border border-ouro-300">
            {gravacaoCapa}: "{nomeGravado}"
          </span>
        )}
        {elasticoAtivo && (
          <span className="text-xs bg-ivoire-300 text-onix-400 px-2 py-0.5">com elástico</span>
        )}
        {marcadorAtivo && (
          <span className="text-xs bg-ivoire-300 text-onix-400 px-2 py-0.5">com marcador</span>
        )}
      </div>
    </div>
  )
}
