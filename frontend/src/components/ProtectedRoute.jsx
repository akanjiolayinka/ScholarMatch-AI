import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../lib/useSession'
import { isSupabaseConfigured } from '../lib/supabase'
import { isMockMode, hasMockSession, isOnboardingComplete } from '../lib/mockAuth'

// Gates a route on:
//   1. having a session
//   2. (optionally) having completed onboarding
// In mock mode the session comes from localStorage; in production it comes
// from Supabase. The onboarding gate is keyed off `sm_onboarding_complete`.
export default function ProtectedRoute({ children, requireOnboarding = true }) {
  const { session, loading } = useSession()
  const location = useLocation()

  const mock = isMockMode() || hasMockSession()

  // Determine sign-in state for redirect logic.
  const signedIn = mock ? hasMockSession() : !!session

  if (!mock && !isSupabaseConfigured) {
    // No backend configured — show landing/auth-only without redirect loops.
    return children
  }

  if (!mock && loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Sans, sans-serif',
        color: 'var(--color-text-secondary)',
        fontSize: 13,
      }}>
        Loading…
      </div>
    )
  }

  if (!signedIn) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  // Onboarding gate: anything but /onboarding itself requires the flag.
  if (requireOnboarding && !isOnboardingComplete()) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
