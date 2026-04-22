"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function isConfiguredBrowserSupabase(url: string, anonKey: string): boolean {
  if (!url.trim() || !anonKey.trim()) return false;
  const u = url.toLowerCase();
  const k = anonKey.toLowerCase();
  if (u.includes("your_project_ref") || u.includes("placeholder")) return false;
  if (k.includes("your_anon") || k.includes("placeholder")) return false;
  return true;
}

let cachedClient: SupabaseClient | null | undefined;

/**
 * Browser Supabase client using only NEXT_PUBLIC_* keys (safe for bundles).
 * Used for Realtime subscriptions. Inserts must go through /api/reviews (service role).
 *
 * Singleton: avoids multiple GoTrueClient instances (Strict Mode / remounts).
 */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!isConfiguredBrowserSupabase(url, anonKey)) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });

  return cachedClient;
}
