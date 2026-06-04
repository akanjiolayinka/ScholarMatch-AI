// Demo mode — lets the entire app work without real Supabase credentials.
// Activate by either leaving VITE_SUPABASE_URL unset, pointing it at the
// placeholder host, or stashing a session in localStorage via the "Continue
// as demo user" button on the Auth page.

const MOCK_USER = {
  id: 'mock-user-001',
  email: 'temi@scholarmatch.ai',
  user_metadata: {
    full_name: 'Temi Adeyemi',
    avatar_url: null,
  },
}

const MOCK_SESSION_KEY = 'scholarmatch_mock_session'

export function isMockMode() {
  const url = import.meta.env.VITE_SUPABASE_URL
  return !url || url === 'https://placeholder.supabase.co' || url.startsWith('https://your-project')
}

export function getMockSession() {
  return {
    user: MOCK_USER,
    access_token: 'mock-token-123',
  }
}

// LocalStorage flag — lets the Auth page's "Continue as demo" button
// short-circuit even when real Supabase env vars are present.
export function hasMockSession() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(MOCK_SESSION_KEY) === '1'
}

export function setMockSession(on) {
  if (typeof window === 'undefined') return
  if (on) window.localStorage.setItem(MOCK_SESSION_KEY, '1')
  else window.localStorage.removeItem(MOCK_SESSION_KEY)
}

export { MOCK_USER }
