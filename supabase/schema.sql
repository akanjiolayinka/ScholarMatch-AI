-- ScholarMatch AI — Supabase schema
-- Run this in the Supabase SQL editor. RLS is enabled on every user-owned table
-- so users can only read/write their own rows. Scholarships are publicly readable.

------------------------------------------------------------------------------
-- USERS
------------------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text unique not null,
  name          text,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users: read own" on public.users
  for select using (auth.uid() = id);

create policy "users: insert own" on public.users
  for insert with check (auth.uid() = id);

create policy "users: update own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

------------------------------------------------------------------------------
-- PROFILES
------------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id       uuid primary key references public.users (id) on delete cascade,
  nationality   text,
  university    text,
  degree        text,
  level         text,
  gpa           numeric,
  gpa_scale     numeric,
  field         text,
  goal          text,
  destinations  text[] default '{}',
  need_based    boolean,
  extras        text,
  languages     text[] default '{}',
  completion    int not null default 0,
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

------------------------------------------------------------------------------
-- SCHOLARSHIPS (public read)
------------------------------------------------------------------------------
create table if not exists public.scholarships (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  organisation  text not null,
  amount        text not null,
  level         text,
  destination   text,
  tags          text[] default '{}',
  deadline      timestamptz,
  description   text,
  requirements  text,
  created_at    timestamptz not null default now()
);

alter table public.scholarships enable row level security;

create policy "scholarships: public read" on public.scholarships
  for select using (true);

------------------------------------------------------------------------------
-- APPLICATIONS
------------------------------------------------------------------------------
create table if not exists public.applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  scholarship_id  uuid not null references public.scholarships (id) on delete cascade,
  status          text not null default 'saved'
                  check (status in ('saved','applied','interview','result')),
  match_score     int,
  docs_ready      int not null default 0,
  docs_total      int not null default 3,
  notes           text,
  reminder_at     timestamptz,
  result_status   text check (result_status in ('won','lost','pending')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, scholarship_id)
);

alter table public.applications enable row level security;

create policy "applications: read own" on public.applications
  for select using (auth.uid() = user_id);

create policy "applications: insert own" on public.applications
  for insert with check (auth.uid() = user_id);

create policy "applications: update own" on public.applications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "applications: delete own" on public.applications
  for delete using (auth.uid() = user_id);

------------------------------------------------------------------------------
-- DOCUMENTS (metadata; files live in Supabase Storage bucket `documents`)
------------------------------------------------------------------------------
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  type        text not null
              check (type in ('transcript','waec','passport','recommendation','other')),
  filename    text not null,
  storage_path text not null,
  size        int,
  created_at  timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "documents: read own" on public.documents
  for select using (auth.uid() = user_id);

create policy "documents: insert own" on public.documents
  for insert with check (auth.uid() = user_id);

create policy "documents: delete own" on public.documents
  for delete using (auth.uid() = user_id);

------------------------------------------------------------------------------
-- NOTIFICATION PREFS
------------------------------------------------------------------------------
create table if not exists public.notification_prefs (
  user_id       uuid primary key references public.users (id) on delete cascade,
  email         text,
  new_matches   boolean not null default true,
  deadlines     boolean not null default true,
  weekly_digest boolean not null default false
);

alter table public.notification_prefs enable row level security;

create policy "notif: read own" on public.notification_prefs
  for select using (auth.uid() = user_id);

create policy "notif: upsert own" on public.notification_prefs
  for insert with check (auth.uid() = user_id);

create policy "notif: update own" on public.notification_prefs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

------------------------------------------------------------------------------
-- STORAGE
-- Create a private bucket called `documents` in the Supabase dashboard
-- (Storage → New bucket → name: documents, public: off), then run:
------------------------------------------------------------------------------
-- Per-user folder access. Files must be uploaded as `{user_id}/{filename}`.
create policy "documents bucket: read own" on storage.objects
  for select using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "documents bucket: write own" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "documents bucket: delete own" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
