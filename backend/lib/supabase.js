import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using the service role key.
// Use this for any privileged work (reading other users, bypassing RLS, storage admin).
// For per-request, RLS-respecting calls, prefer creating a scoped client with the
// caller's access token via `supabaseForUser(token)`.
export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
)

export function supabaseForUser(accessToken) {
  return createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
