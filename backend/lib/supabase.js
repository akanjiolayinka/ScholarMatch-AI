import { createClient } from '@supabase/supabase-js'

// Accept either SUPABASE_URL (QuikDB convention) or VITE_SUPABASE_URL (Vite
// dev convention). Same for the anon key.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Server-side Supabase client using the service role key.
// Use this for privileged work (reading other users, bypassing RLS, storage admin).
// For per-request, RLS-respecting calls, prefer `supabaseForUser(token)`.
export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

export function supabaseForUser(accessToken) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export const isSupabaseConfigured = Boolean(supabaseAdmin)
