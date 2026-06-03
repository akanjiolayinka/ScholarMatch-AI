import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import matchingRoutes from './routes/matching.js'

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/matching', matchingRoutes)

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`ScholarMatch API listening on :${port}`)
})
