-- Run in Supabase SQL Editor (or via Supabase CLI) before using the reviews API.
-- Then run 20260421140000_reviews_realtime.sql so browser Realtime sees new inserts.
create extension if not exists "pgcrypto";

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  stars smallint not null,
  created_at timestamptz not null default now(),
  approved boolean not null default true,
  constraint reviews_stars_range check (stars >= 1 and stars <= 5)
);

create index if not exists reviews_created_at_desc_idx on public.reviews (created_at desc);

alter table public.reviews enable row level security;

-- Inserts go through Next.js API using the service role key (bypasses RLS).
-- Optional: allow anon read of approved rows if you later add a Supabase Realtime client.
create policy "Public read approved reviews"
  on public.reviews
  for select
  to anon, authenticated
  using (approved = true);
