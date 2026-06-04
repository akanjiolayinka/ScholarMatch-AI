import { supabase, isSupabaseConfigured } from './supabase'
import { post } from './api'

// Fields that contribute to completion %, in the order they're collected
// during onboarding.
const PROFILE_FIELDS = [
  'nationality',
  'university',
  'degree',
  'level',
  'gpa',
  'gpa_scale',
  'field',
  'goal',
  'destinations',
  'need_based',
  'extras',
  'languages',
]

export function computeCompletionPct(profile) {
  if (!profile) return 0
  let filled = 0
  for (const k of PROFILE_FIELDS) {
    const v = profile[k]
    if (Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && String(v).trim() !== '') {
      filled += 1
    }
  }
  return Math.round((filled / PROFILE_FIELDS.length) * 100)
}

export async function fetchProfile(userId) {
  if (!isSupabaseConfigured || !userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    console.warn('fetchProfile:', error.message)
    return null
  }
  return data
}

// Upsert a partial profile patch. Recomputes completion_pct from the merged
// view (existing row + patch) and triggers a background match refresh.
export async function upsertProfile(userId, patch) {
  if (!isSupabaseConfigured || !userId) return { skipped: true }

  const current = (await fetchProfile(userId)) || {}
  const merged = { ...current, ...patch, user_id: userId }
  merged.completion_pct = computeCompletionPct(merged)
  merged.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('profiles')
    .upsert(merged, { onConflict: 'user_id' })
    .select()
    .maybeSingle()

  if (error) {
    console.warn('upsertProfile:', error.message)
    return { error: error.message }
  }
  runMatchingInBackground()
  return { data }
}

// Update a single field. Use during onboarding so each Scholar answer
// persists immediately.
export async function setProfileField(userId, key, value) {
  return upsertProfile(userId, { [key]: value })
}

export async function setUserName(userId, name) {
  if (!isSupabaseConfigured || !userId) return
  const { error } = await supabase.from('users').update({ name }).eq('id', userId)
  if (error) console.warn('setUserName:', error.message)
}

// Parse free-text studies like "Computer Engineering, 300 level at UNILAG"
// into university + degree + level. Best-effort; leaves blanks for anything
// it can't infer.
export function parseStudies(text) {
  if (!text) return {}
  const out = { degree: null, university: null, level: null }
  const atMatch = text.match(/\bat\s+([A-Za-z .'&-]+?)(?:[,.]|$)/i)
  if (atMatch) out.university = atMatch[1].trim()
  const levelMatch = text.match(/(\d{3,4})\s*level|(\d)(?:st|nd|rd|th)\s*year|year\s*(\d)/i)
  if (levelMatch) out.level = (levelMatch[1] || `Year ${levelMatch[2] || levelMatch[3]}`).trim()
  const cleaned = text
    .replace(/\bat\s+[A-Za-z .'&-]+/i, '')
    .replace(/\d{3,4}\s*level/i, '')
    .replace(/\d(?:st|nd|rd|th)\s*year/i, '')
    .replace(/[,.]+/g, ' ')
    .trim()
  out.degree = cleaned || text
  return out
}

// Parse "4.3 out of 5" / "4.3/5" / "first class" / etc into gpa + scale.
export function parseGpa(text) {
  if (!text) return {}
  const out = {}
  const slash = text.match(/(\d+(?:\.\d+)?)\s*(?:\/|out of)\s*(\d+(?:\.\d+)?)/i)
  if (slash) {
    out.gpa = parseFloat(slash[1])
    out.gpa_scale = parseFloat(slash[2])
    return out
  }
  const single = text.match(/(\d+(?:\.\d+)?)/)
  if (single) {
    const n = parseFloat(single[1])
    out.gpa = n
    out.gpa_scale = n > 4.0 ? 5 : 4
  }
  return out
}

// Fire and forget — refresh matches on the server. Server returns quickly;
// it spawns the heavy work itself.
export function runMatchingInBackground() {
  post('/api/matching/run', {}).catch((err) => {
    console.warn('matching/run failed:', err.message)
  })
}
