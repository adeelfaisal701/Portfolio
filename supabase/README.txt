Supabase reviews setup (run in Supabase SQL Editor for your project)

1. Run the full contents of migrations/20260416120000_reviews.sql
2. Then run the full contents of migrations/20260421140000_reviews_realtime.sql

Copy API keys from Project Settings → API into .env.local (see repo .env.example).

Then locally: npm run verify:reviews-env && npm run dev (other terminal) && npm run smoke:reviews-api
(If dev uses port 3001, smoke tries 3000 then 3001 automatically; or set REVIEWS_SMOKE_PORT.)
