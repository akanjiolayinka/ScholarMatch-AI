import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../lib/useSession'
import { isSupabaseConfigured } from '../lib/supabase'
import { isMockMode, hasMockSession } from '../lib/mockAuth'

// In mock mode (no Supabase configured, or the user clicked "Continue as
// demo"), let everything through unguarded. Otherwise gate on a session.
export default function ProtectedRoute({ children }) {
  const { session, loading } = useSession()
  const location = useLocation()

  if (isMockMode() || hasMockSession()) return children
  if (!isSupabaseConfigured) return children

  if (loading) {
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

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return children
}
