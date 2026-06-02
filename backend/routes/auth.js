import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/sync', requireAuth, async (req, res) => {
  const { userId, userEmail } = req
  await prisma.user.upsert({
    where: { id: userId },
    update: { lastLoginAt: new Date() },
    create: { id: userId, email: userEmail },
  })
  res.json({ ok: true })
})

export default router
