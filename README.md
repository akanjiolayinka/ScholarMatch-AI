# ScholarMatch AI

AI-powered scholarship matching for African students.

## Structure

- `frontend/` — Vite + React app (UI, Supabase auth client)
- `backend/` — Express API + Prisma (matching, AI drafts, user sync)

## Quick start

```bash
npm install
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
npm run dev:frontend
npm run dev:backend
```

## Stack

- React 18 + Vite + React Router
- Supabase Auth (Google OAuth + email)
- Express + Prisma + PostgreSQL
- Anthropic Claude for AI drafting

## Design tokens

- Navy: `#0A0E2A`
- Gold: `#F5A623`
- Fonts: Sora (headings), DM Sans (body)
