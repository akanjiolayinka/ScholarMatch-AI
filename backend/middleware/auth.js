import { supabaseAdmin, supabaseForUser } from '../lib/supabase.js'

export async function requireAuth(req, res, next) {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Auth not configured on this server' })
  }
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })

  req.userId = user.id
  req.userEmail = user.email
  req.supabase = supabaseForUser(token)
  next()
}
