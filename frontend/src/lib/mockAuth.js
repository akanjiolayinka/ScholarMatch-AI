// Demo mode keys. The whole app reads from localStorage when isMockMode() is
// true OR when the user has explicitly signed up through the mock auth form
// (which sets sm_mock_session = 'active').

export const MOCK_KEYS = {
  user: 'sm_mock_user',
  session: 'sm_mock_session',
  profile: 'sm_mock_profile',
  onboardingDone: 'sm_onboarding_complete',
  notifs: 'sm_mock_notifs',
}

export function isMockMode() {
  const url = import.meta.env.VITE_SUPABASE_URL
  return !url || url === 'https://placeholder.supabase.co' || url.startsWith('https://your-project')
}

function readJson(key, fallback = null) {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(window.localStorage.getItem(key) || 'null') ?? fallback }
  catch { return fallback }
}
function writeJson(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getMockUser() {
  return readJson(MOCK_KEYS.user)
}

export function hasMockSession() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(MOCK_KEYS.session) === 'active' && !!getMockUser()
}

export function startMockSession() {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MOCK_KEYS.session, 'active')
}

export function clearMockSession() {
  if (typeof window === 'undefined') return
  // Keep user, profile, onboarding state so they can log back in.
  window.localStorage.removeItem(MOCK_KEYS.session)
}

export function signUpMock(name, email) {
  const user = { id: 'mock-' + Date.now(), name, email, createdAt: new Date().toISOString() }
  writeJson(MOCK_KEYS.user, user)
  startMockSession()
  return user
}

export function logInMock(email) {
  const existing = getMockUser()
  if (!existing) return null
  if (existing.email && existing.email.toLowerCase() !== email.toLowerCase()) return null
  startMockSession()
  return existing
}

export function isOnboardingComplete() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(MOCK_KEYS.onboardingDone) === 'true'
}

export function markOnboardingComplete(profile) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MOCK_KEYS.onboardingDone, 'true')
  if (profile) writeJson(MOCK_KEYS.profile, profile)
}

export function getMockProfile() {
  return readJson(MOCK_KEYS.profile)
}

export function setMockProfile(profile) {
  writeJson(MOCK_KEYS.profile, profile)
}
