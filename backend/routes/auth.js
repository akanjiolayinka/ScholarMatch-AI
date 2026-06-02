import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Upsert the user row on first login / on every login refresh.
// Run via the user-scoped client so Supabase RLS applies.
router.post('/sync', requireAuth, async (req, res) => {
  const { userId, userEmail, supabase } = req
  const { error } = await supabase
    .from('users')
    .upsert(
      { id: userId, email: userEmail, last_login_at: new Date().toISOString() },
      { onConflict: 'id' },
    )
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

export default router
