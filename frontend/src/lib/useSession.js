import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import { isMockMode, hasMockSession, getMockUser, clearMockSession } from './mockAuth'

function mockShape() {
  const user = getMockUser()
  if (!user) return null
  // Mimic Supabase's user shape so consumers can read user_metadata.full_name.
  return {
    user: {
      ...user,
      user_metadata: { full_name: user.name, ...(user.user_metadata || {}) },
    },
    access_token: 'mock',
  }
}

// Reads the current session. In mock mode it always reads from localStorage,
// so signup / login / signout reflect instantly without a network round-trip.
export function useSession() {
  const [session, setSession] = useState(() => hasMockSession() ? mockShape() : null)
  const [loading, setLoading] = useState(() => !(isMockMode() || hasMockSession()))

  useEffect(() => {
    // Respond to localStorage changes from other tabs (or our own writes via
    // the storage event).
    function onStorage() {
      if (hasMockSession()) setSession(mockShape())
      else setSession(null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

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
  clearMockSession()
  if (isSupabaseConfigured && !isMockMode()) await supabase.auth.signOut()
  if (typeof window !== 'undefined') window.location.assign('/')
}
