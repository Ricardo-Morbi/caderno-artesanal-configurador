import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Clientes lazy — criados na primeira chamada, não no import
// Necessário para build: env vars não existem em tempo de build

let _browser: SupabaseClient | null = null
let _admin: SupabaseClient | null = null

// Cliente browser — anon key, RLS ativo (client components)
export function getSupabase(): SupabaseClient {
  if (!_browser) {
    _browser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _browser
}

// Cliente server — service role, ignora RLS (API routes apenas)
export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _admin
}
