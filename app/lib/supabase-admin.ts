import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { supabaseServerFetch } from "@/app/lib/supabase-server-fetch";

let cached: SupabaseClient | null | undefined;

/**
 * Server-only Supabase client using the service role key (bypasses RLS for inserts).
 * Returns null when env is not configured (API routes should return 503).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    cached = null;
    return null;
  }

  cached = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: supabaseServerFetch,
    },
  });
  return cached;
}
