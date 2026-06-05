import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import matchingRoutes from './routes/matching.js'
import draftsRoutes from './routes/drafts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/matching', matchingRoutes)
app.use('/api/drafts', draftsRoutes)

// Serve the React production build. In dev (npm run dev:frontend) this folder
// may not exist, which is fine — express.static silently skips and the SPA
// runs from Vite's dev server instead.
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist')
app.use(express.static(FRONTEND_DIST))

// SPA fallback: anything that isn't an /api/* route gets index.html so React
// Router can take over.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'), (err) => {
    if (err) next()
  })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`ScholarMatch API listening on :${port}`)
})

