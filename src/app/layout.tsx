import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Caderno Artesanal Configurador | Monte o Seu Caderno Ideal',
  description:
    'Crie o caderno artesanal perfeito para você. Personalize capa, miolo, encadernação, acabamentos e muito mais — com preview em tempo real enquanto você monta.',
  keywords: [
    'caderno artesanal personalizado',
    'caderno handmade customizado',
    'configurador de caderno',
    'caderno sob medida',
    'diário personalizado',
    'planner artesanal',
  ],
  openGraph: {
    title: 'Monte o Seu Caderno Artesanal Ideal',
    description:
      'Personalize cada detalhe do seu caderno e veja como vai ficar em tempo real.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-creme-100">
        {children}
      </body>
    </html>
  )
}
