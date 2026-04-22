Supabase reviews (browser-only, no custom API)

Reviews are loaded and saved from the React app using the public anon key only.
Set in project root .env.local (then restart `npm run dev`):

  NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

Do not use SUPABASE_SERVICE_ROLE_KEY in the client or in NEXT_PUBLIC_*.
The optional route at /reviews and the home page reviews section use lib/supabaseClient.ts.

Run SQL in this order in Supabase → SQL Editor:

1. migrations/20260416120000_reviews.sql  (or start from a table with name, review, rating, created_at)
2. migrations/20260421140000_reviews_realtime.sql
3. migrations/20260422140000_reviews_review_rating_public_rls.sql

This gives public.reviews with RLS: anyone can SELECT and INSERT; no UPDATE/DELETE policies.
Enable Realtime on the table (step 2) for live updates.

Validate local env:  npm run verify:reviews-env
