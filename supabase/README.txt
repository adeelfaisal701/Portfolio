Supabase reviews setup (SQL Editor → New query → Run)

Apply migrations in order:

1. migrations/20260416120000_reviews.sql — creates table public.reviews (legacy columns message/stars).
2. migrations/20260421140000_reviews_realtime.sql — adds reviews to Realtime publication.
3. migrations/20260422140000_reviews_review_rating_public_rls.sql — renames columns to review/rating,
   removes approval column, enables public SELECT + INSERT for anon (matches full-stack anon-only UI).

Environment (.env.local in repo root):

  NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

Never put SUPABASE_SERVICE_ROLE_KEY in frontend code or NEXT_PUBLIC_* variables.
The service role may still be used only in Next.js Route Handlers (server) at app/api/reviews/route.ts.

Standalone reviews UI (anon key only): open http://localhost:3000/reviews after migration (3).

Portfolio home still uses the embedded ReviewsSection; configure the same env vars.

Verify & smoke:

  npm run verify:reviews-env
  npm run dev
  npm run smoke:reviews-api

Optional: MongoDB reviews API — see backend/ and NEXT_PUBLIC_REVIEWS_API_URL.
