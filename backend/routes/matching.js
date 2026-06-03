import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Trivial scoring: +20 per matching destination, +20 for field keyword overlap,
// +30 if GPA >= 3.5/4 or 4.3/5, +20 if goal matches the scholarship level.
function scoreFit(profile, scholarship) {
  let score = 30 // base
  const dests = profile?.destinations || []
  if (scholarship.destination && dests.includes(scholarship.destination)) score += 20
  const field = (profile?.field || '').toLowerCase()
  const tags = (scholarship.tags || []).map((t) => t.toLowerCase())
  if (field && tags.some((t) => field.includes(t) || t.includes(field))) score += 20
  if (profile?.gpa) {
    const scale = profile.gpa_scale || 5
    const ratio = profile.gpa / scale
    if (ratio >= 0.75) score += 20
    else if (ratio >= 0.65) score += 10
  }
  const goal = (profile?.goal || '').toLowerCase()
  const level = (scholarship.level || '').toLowerCase()
  if (goal.includes('postgrad') && level.includes('postgrad')) score += 10
  if (goal.includes('undergrad') && level.includes('undergrad')) score += 10
  return Math.min(99, score)
}

// POST /api/matching/run
// Reads the caller's profile, scores every scholarship, and upserts the
// top scores as `saved` applications so they show up on the dashboard.
router.post('/run', requireAuth, async (req, res) => {
  const { userId, supabase } = req
  const t0 = Date.now()

  const [{ data: profile }, { data: scholarships }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('scholarships').select('*'),
  ])

  if (!profile || !scholarships) {
    return res.json({ ok: true, scored: 0, durationMs: Date.now() - t0 })
  }

  const scored = scholarships.map((s) => ({
    scholarship_id: s.id,
    user_id: userId,
    status: 'saved',
    match_score: scoreFit(profile, s),
  }))

  // Only persist matches over 70% as auto-saved suggestions; the user can
  // still bookmark anything else manually from the dashboard.
  const auto = scored.filter((row) => row.match_score >= 70)

  if (auto.length) {
    const { error } = await supabase
      .from('applications')
      .upsert(auto, { onConflict: 'user_id,scholarship_id', ignoreDuplicates: false })
    if (error) console.warn('matching upsert:', error.message)
  }

  res.json({ ok: true, scored: scored.length, autoSaved: auto.length, durationMs: Date.now() - t0 })
})

export default router
