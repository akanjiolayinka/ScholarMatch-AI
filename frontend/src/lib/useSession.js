import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import { isMockMode, hasMockSession, getMockSession, setMockSession } from './mockAuth'

// Returns { session, user, loading }. In mock mode (no Supabase env, placeholder
// URL, or the demo-session flag in localStorage) it returns a fixed demo user
// without ever hitting the network.
export function useSession() {
  const [session, setSession] = useState(() => (isMockMode() || hasMockSession()) ? getMockSession() : null)
  const [loading, setLoading] = useState(() => !(isMockMode() || hasMockSession()))

  useEffect(() => {
    if (isMockMode() || hasMockSession()) return
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return { session, user: session?.user || null, loading }
}

export async function signOut() {
  setMockSession(false)
  if (isSupabaseConfigured && !isMockMode()) await supabase.auth.signOut()
  // Force a reload so every stale session-aware component resets.
  if (typeof window !== 'undefined') window.location.assign('/')
}
