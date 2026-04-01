import type { NextConfig } from "next";
import path from "path";

// ─── Security Headers ─────────────────────────────────────────
// Aplicados em todas as rotas da aplicação.
// Referência: OWASP Secure Headers Project + Next.js docs.
const securityHeaders = [
  // Previne ataques de protocol downgrade e cookie hijacking
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Previne clickjacking — só permite ser exibido no mesmo origem
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Previne MIME-type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Controla informações enviadas no Referer
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Desativa recursos sensíveis do browser não utilizados pela app
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  // DNS prefetch controlado
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // Content Security Policy
  // unsafe-inline necessário: Next.js hydration scripts + Framer Motion inline styles
  // frame-ancestors 'none' previne clickjacking (reforça X-Frame-Options em browsers modernos)
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },

  experimental: {
    // Substitui <link rel="stylesheet"> por <style> inline no <head>.
    // Elimina o waterfall de CSS render-blocking no App Router (streaming RSC).
    // Nota: visitantes recorrentes re-baixam o CSS (sem cache de arquivo separado).
    inlineCss: true,
  },

  webpack(config, { webpack: wp }) {
    // O Next.js carrega polyfill-module via require() relativo em app-globals.js.
    // O webpack resolve o caminho para um path absoluto antes de aplicar aliases,
    // então resolve.alias com string de módulo não intercepta.
    // NormalModuleReplacementPlugin opera no path já resolvido — funciona.
    // Elimina ~12 KiB de polyfills desnecessários para browsers modernos.
    // Seguro para: Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+
    config.plugins.push(
      new wp.NormalModuleReplacementPlugin(
        /[\\/]next[\\/]dist[\\/]build[\\/]polyfills[\\/]polyfill-module/,
        path.resolve('./src/lib/empty.js'),
      ),
    )
    return config
  },

  async headers() {
    return [
      {
        // Aplica em todas as rotas
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig;
