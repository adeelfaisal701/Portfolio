"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function isConfigured(url: string, anonKey: string): boolean {
  if (!url.trim() || !anonKey.trim()) return false;
  const u = url.toLowerCase();
  const k = anonKey.toLowerCase();
  if (u.includes("your_project_ref") || u.includes("placeholder")) return false;
  if (k.includes("your_anon") || k.includes("placeholder")) return false;
  return true;
}

let cached: SupabaseClient | null | undefined;

/**
 * Browser Supabase client — **anon key only** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
 * Safe for client bundles; never import `SUPABASE_SERVICE_ROLE_KEY` here.
 *
 * Singleton to avoid duplicate GoTrue clients (React Strict Mode / remounts).
 */
export function createSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!isConfigured(url, anonKey)) {
    cached = null;
    return null;
  }

  cached = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });

  return cached;
}

/** @deprecated Prefer `createSupabaseClient`; kept for existing imports. */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  return createSupabaseClient();
}
