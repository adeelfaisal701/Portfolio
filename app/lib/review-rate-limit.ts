/**
 * In-memory sliding-window rate limit for POST /api/reviews.
 * On serverless, each instance has its own map (limits are best-effort).
 */

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_POSTS_PER_WINDOW = 8;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function pruneIfLarge(now: number) {
  if (buckets.size <= 2000) return;
  for (const [ip, b] of buckets) {
    if (now > b.resetAt) buckets.delete(ip);
  }
}

export function checkReviewPostRateLimit(clientIp: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  pruneIfLarge(now);

  const b = buckets.get(clientIp);
  if (!b || now > b.resetAt) {
    buckets.set(clientIp, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (b.count >= MAX_POSTS_PER_WINDOW) {
    const retryAfterSec = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  b.count += 1;
  return { ok: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real?.trim()) return real.trim();
  return "unknown";
}
