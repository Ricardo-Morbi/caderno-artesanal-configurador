'use client'

import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') return <>{children}</>

  async function sair() {
    await fetch('/api/auth/admin', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-ivoire-100 flex flex-col">
      <header className="bg-onix-800 text-ivoire-100">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-6">
            <Image
                src="/logo-dmo.webp"
                alt="DMO Papelaria"
                width={120}
                height={40}
                className="mix-blend-screen"
              />
            <nav className="flex items-center gap-1">
              <Link
                href="/admin/pedidos"
                className={`px-4 py-1.5 text-xs tracking-widest uppercase font-sans rounded-sm transition-colors ${
                  pathname === '/admin/pedidos'
                    ? 'bg-white/10 text-ivoire-100'
                    : 'text-ivoire-300 hover:text-ivoire-100'
                }`}
              >
                Pedidos
              </Link>
              <Link
                href="/admin/contatos"
                className={`px-4 py-1.5 text-xs tracking-widest uppercase font-sans rounded-sm transition-colors ${
                  pathname === '/admin/contatos'
                    ? 'bg-white/10 text-ivoire-100'
                    : 'text-ivoire-300 hover:text-ivoire-100'
                }`}
              >
                Contatos
              </Link>
              <Link
                href="/admin/materiais"
                className={`px-4 py-1.5 text-xs tracking-widest uppercase font-sans rounded-sm transition-colors ${
                  pathname === '/admin/materiais'
                    ? 'bg-white/10 text-ivoire-100'
                    : 'text-ivoire-300 hover:text-ivoire-100'
                }`}
              >
                Materiais
              </Link>
              <Link
                href="/admin/calculadora"
                className={`px-4 py-1.5 text-xs tracking-widest uppercase font-sans rounded-sm transition-colors ${
                  pathname === '/admin/calculadora'
                    ? 'bg-white/10 text-ivoire-100'
                    : 'text-ivoire-300 hover:text-ivoire-100'
                }`}
              >
                Calculadora
              </Link>
              <Link
                href="/admin/dashboard"
                className={`px-4 py-1.5 text-xs tracking-widest uppercase font-sans rounded-sm transition-colors ${
                  pathname === '/admin/dashboard'
                    ? 'bg-white/10 text-ivoire-100'
                    : 'text-ivoire-300 hover:text-ivoire-100'
                }`}
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <button
            onClick={sair}
            className="text-xs text-ivoire-400 hover:text-ivoire-100 tracking-widest uppercase font-sans transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-5 py-6">
        {children}
      </main>
    </div>
  )
}
