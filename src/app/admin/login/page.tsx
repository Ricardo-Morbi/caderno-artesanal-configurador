'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginAdmin() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      })

      if (res.ok) {
        router.push('/admin/pedidos')
      } else {
        setErro('Senha incorreta')
      }
    } catch {
      setErro('Erro ao conectar. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivoire-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-8 h-px bg-ouro-400 mx-auto mb-6" />
          <h1 className="text-xl font-serif text-onix-700">Painel Administrativo</h1>
          <p className="text-xs text-onix-500 mt-2 tracking-widest uppercase font-sans">Acesso restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-ivoire-400 p-8">
          <label className="block text-xs text-onix-500 tracking-widest uppercase font-sans mb-2">
            Senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            className="w-full border border-ivoire-400 bg-ivoire-50 px-4 py-3 text-sm text-onix-700 outline-none focus:border-onix-400 transition-colors mb-4"
            placeholder="••••••••"
            autoFocus
            required
          />

          {erro && (
            <p className="text-xs text-red-600 mb-4">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-onix-700 hover:bg-onix-800 disabled:opacity-50 text-ivoire-100 py-3 text-xs tracking-widest uppercase font-sans transition-colors duration-200"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
