import { useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import ApplicationAssistant from './pages/ApplicationAssistant'
import Tracker from './pages/Tracker'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { useSession } from './lib/useSession'
import { syncUser } from './lib/api'

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  const { user } = useSession()
  const syncedFor = useRef(null)

  // When a user logs in (or the page boots into an existing session), sync them
  // into our `users` table. Don't re-sync the same id within a session.
  useEffect(() => {
    if (user && syncedFor.current !== user.id) {
      syncedFor.current = user.id
      syncUser()
    }
  }, [user])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/apply/:id" element={<Protected><ApplicationAssistant /></Protected>} />
      <Route path="/tracker" element={<Protected><Tracker /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
    </Routes>
  )
}
