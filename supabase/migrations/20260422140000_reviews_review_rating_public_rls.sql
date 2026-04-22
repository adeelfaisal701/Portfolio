-- Run after prior reviews migrations (table must exist).
-- Renames legacy columns → name, review, rating; enables public SELECT + INSERT for anon (RLS).

-- Legacy policies — safe to re-run
drop policy if exists "Public read approved reviews" on public.reviews;
drop policy if exists "reviews_public_select" on public.reviews;
drop policy if exists "reviews_public_insert" on public.reviews;

alter table public.reviews drop constraint if exists reviews_stars_range;

-- Rename if still using message/stars from 20260416120000_reviews.sql
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'reviews' and column_name = 'message'
  ) then
    alter table public.reviews rename column message to review;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'reviews' and column_name = 'stars'
  ) then
    alter table public.reviews rename column stars to rating;
    alter table public.reviews alter column rating type integer using rating::integer;
  end if;
end $$;

alter table public.reviews drop constraint if exists reviews_rating_range;
alter table public.reviews add constraint reviews_rating_range check (rating >= 1 and rating <= 5);

alter table public.reviews drop column if exists approved;

alter table public.reviews
  alter column review set not null;

alter table public.reviews
  alter column rating set not null;

-- Supabase Realtime already includes public.reviews from prior migration

create policy "reviews_public_select"
  on public.reviews
  for select
  to anon, authenticated
  using (true);

create policy "reviews_public_insert"
  on public.reviews
  for insert
  to anon, authenticated
  with check (true);
