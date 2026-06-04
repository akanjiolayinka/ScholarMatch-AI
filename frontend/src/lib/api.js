import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || ''

async function authHeaders() {
  const headers = { 'Content-Type': 'application/json' }
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`
  }
  return headers
}

export async function get(path) {
  const res = await fetch(`${API_URL}${path}`, { headers: await authHeaders() })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

export async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  return res.json()
}

export async function patch(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`)
  return res.json()
}

// Sync the Supabase user into our `users` table. Safe to call on every login.
export async function syncUser() {
  if (!API_URL) return { skipped: true }
  try {
    return await post('/api/auth/sync', {})
  } catch (err) {
    console.warn('syncUser failed:', err.message)
    return { error: err.message }
  }
}
