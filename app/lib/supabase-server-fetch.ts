/**
 * Fetch wrapper for Supabase server client. Mitigates intermittent
 * `TypeError: fetch failed` when calling Supabase from Node on Windows (often
 * IPv6/DNS or transient TLS/network issues) by preferring IPv4 and retrying.
 */

import dns from "node:dns";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

function isRetryableNetworkError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const m = e.message;
  return (
    m === "fetch failed" ||
    m.includes("ECONNRESET") ||
    m.includes("ECONNREFUSED") ||
    m.includes("ETIMEDOUT") ||
    m.includes("ENOTFOUND") ||
    m.includes("EAI_AGAIN") ||
    m.includes("EPIPE") ||
    m.includes("socket") ||
    m.includes("network")
  );
}

const MAX_ATTEMPTS = 3;

export async function supabaseServerFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await fetch(input, init);
    } catch (e) {
      lastError = e;
      if (init?.signal?.aborted) throw e;
      if (attempt < MAX_ATTEMPTS - 1 && isRetryableNetworkError(e)) {
        await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
        continue;
      }
      throw e;
    }
  }

  throw lastError;
}
