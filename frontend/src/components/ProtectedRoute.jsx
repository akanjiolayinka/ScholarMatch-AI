import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../lib/useSession'
import { isSupabaseConfigured } from '../lib/supabase'

// In dev without Supabase configured, render children so the design is still
// browsable. In production, gate behind a session.
export default function ProtectedRoute({ children }) {
  const { session, loading } = useSession()
  const location = useLocation()

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
