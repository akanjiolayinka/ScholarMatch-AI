# ScholarMatch AI

AI-powered scholarship matching for African students.

## Structure

- `frontend/` — Vite + React app (UI, Supabase auth client)
- `backend/` — Express API (matching, AI drafts, user sync) — uses Supabase JS client only
- `supabase/schema.sql` — run this in the Supabase SQL editor to create tables, RLS, and storage policies

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
- Express + Supabase JS client (Postgres, Auth, Storage)
- Anthropic Claude for AI drafting

## Design tokens

- Navy: `#0A0E2A`
- Gold: `#F5A623`
- Fonts: Sora (headings), DM Sans (body)
