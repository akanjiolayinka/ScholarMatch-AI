import { MOCK_SCHOLARSHIPS } from './mockData'

// Static seed data for the demo. In production, replace with a Supabase query:
//   const { data } = await supabase.from('scholarships').select('*')
// The frontend treats `organization` (preferred) and the legacy `org` field
// as interchangeable so older rows keep working.

export const SCHOLARSHIPS = MOCK_SCHOLARSHIPS.map((s) => ({
  ...s,
  org: s.organization,
  match: s.match_score,
  fresh: s.is_new,
}))

export function getScholarship(id) {
  return SCHOLARSHIPS.find((s) => s.id === id)
}

export function daysUntil(deadlineISO) {
  if (!deadlineISO) return Infinity
  const d = new Date(deadlineISO)
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function matchTier(match) {
  if (match >= 90) return 'high'
  if (match >= 80) return 'med'
  return 'good'
}

export function deadlineTier(days) {
  if (days < 0) return 'past'
  if (days <= 30) return 'urgent'
  if (days <= 60) return 'warn'
  return 'ok'
}

export function formatDeadline(deadlineISO) {
  if (!deadlineISO) return '—'
  const days = daysUntil(deadlineISO)
  const d = new Date(deadlineISO)
  const month = d.toLocaleString('en-US', { month: 'short' })
  const date = d.getDate()
  const year = d.getFullYear()
  if (days < 0) return `${month} ${date}, ${year} — closed`
  if (days <= 60) return `${month} ${date}, ${year} · ${days} day${days === 1 ? '' : 's'} left`
  return `${month} ${date}, ${year}`
}
