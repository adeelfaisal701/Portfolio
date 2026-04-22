-- Run after 20260416120000_reviews.sql in Supabase SQL Editor.
-- Realtime: broadcast INSERT/UPDATE/DELETE on public.reviews to subscribed clients.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reviews'
  ) then
    alter publication supabase_realtime add table public.reviews;
  end if;
end $$;

-- Security note:
-- - RLS remains enabled; anon/authenticated can SELECT only where approved = true (see prior migration).
-- - There is NO INSERT policy for anon: inserts go only through Next.js API using SUPABASE_SERVICE_ROLE_KEY.
-- - Do not add a public INSERT policy unless you move validation server-side elsewhere; it would bypass rate limits.
