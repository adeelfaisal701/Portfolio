"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { dbRowToStored, type ReviewDbRow } from "@/app/lib/review-db-mapper";
import {
  MAX_REVIEW_MESSAGE_LENGTH,
  MAX_REVIEW_NAME_LENGTH,
  MAX_STORED_REVIEWS,
  MAX_STARS,
  MIN_STARS,
} from "@/app/lib/reviews-constants";
import type { StoredReview } from "@/app/lib/reviews-validation";
import { validateReviewInput } from "@/app/lib/reviews-validation";
import { createSupabaseClient } from "@/lib/supabaseClient";

const POLL_MS_NO_REALTIME = 8_000;
const POLL_MS_REALTIME_OK = 45_000;
const SUBMIT_COOLDOWN_MS = 1_600;

function StarRow({ value }: { value: number }) {
  const v = Math.min(MAX_STARS, Math.max(MIN_STARS, Math.round(value)));
  return (
    <span className="text-amber-400" aria-hidden>
      {"★".repeat(v)}
      {"☆".repeat(MAX_STARS - v)}
    </span>
  );
}

export default function ReviewsPage() {
  const lastSubmitRef = useRef(0);

  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeOk, setRealtimeOk] = useState(false);

  const [name, setName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; message?: string; stars?: string; form?: string }>(
    {},
  );

  const loadReviews = useCallback(async () => {
    const client = createSupabaseClient();
    if (!client) {
      setError("Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
      setReviews([]);
      setLoading(false);
      return;
    }

    setError(null);
    const { data, error: qErr } = await client
      .from("reviews")
      .select("id, name, review, rating, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_STORED_REVIEWS);

    if (qErr) {
      console.error("[reviews load]", qErr.message);
      setError(
        qErr.message.includes("column") && qErr.message.includes("does not exist")
          ? "Database columns may be outdated. Run supabase/migrations/20260422140000_reviews_review_rating_public_rls.sql in the SQL Editor."
          : "Could not load reviews. Check your Supabase project and RLS policies.",
      );
      setReviews([]);
    } else {
      const rows = (data ?? []) as ReviewDbRow[];
      setReviews(rows.map((r) => dbRowToStored(r)).filter((r): r is StoredReview => r !== null));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) return;

    const channel = client
      .channel("reviews_standalone")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reviews" },
        (payload) => {
          const row = payload.new as ReviewDbRow;
          const r = dbRowToStored(row);
          if (!r) return;
          setReviews((prev) => {
            if (prev.some((x) => x.id === r.id)) return prev;
            return [r, ...prev].slice(0, MAX_STORED_REVIEWS);
          });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setRealtimeOk(true);
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setRealtimeOk(false);
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const pollMs = realtimeOk ? POLL_MS_REALTIME_OK : POLL_MS_NO_REALTIME;
    const id = window.setInterval(() => {
      void loadReviews();
    }, pollMs);
    return () => window.clearInterval(id);
  }, [loadReviews, realtimeOk]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const client = createSupabaseClient();
    if (!client) {
      setFieldErrors({ form: "Supabase is not configured in the browser." });
      return;
    }

    const now = Date.now();
    if (now - lastSubmitRef.current < SUBMIT_COOLDOWN_MS) {
      setFieldErrors({ form: "Please wait a moment before submitting again." });
      return;
    }

    const parsed = validateReviewInput({
      name,
      message: reviewText,
      stars: rating,
    });

    if (!parsed.ok) {
      setFieldErrors(parsed.errors);
      return;
    }

    setSubmitting(true);
    setFieldErrors({});
    lastSubmitRef.current = now;

    const { error: insErr } = await client.from("reviews").insert({
      name: parsed.value.name,
      review: parsed.value.message,
      rating: parsed.value.stars,
    });

    if (insErr) {
      console.error("[reviews insert]", insErr.message);
      setFieldErrors({
        form:
          insErr.message.includes("row-level security") || insErr.code === "42501"
            ? "Insert was blocked. In Supabase SQL Editor, run the migration that adds the public INSERT policy on public.reviews."
            : insErr.message || "Could not save your review.",
      });
      setSubmitting(false);
      return;
    }

    setName("");
    setReviewText("");
    setRating(0);
    setHover(null);
    setSubmitting(false);
    void loadReviews();
  }

  const displayRating = hover ?? rating;
  const misconfigured = createSupabaseClient() === null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <header className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400/90">Community</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Reviews</h1>
          <p className="mt-3 text-sm text-slate-400">
            Submissions use the public <strong className="text-slate-300">anon</strong> key only — no{" "}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">service_role</code> in the browser.
          </p>
          <p className="mt-4 text-xs text-slate-500">
            Prefer the portfolio layout? Visit the home page — this route is a standalone demo (
            <code className="rounded bg-slate-800 px-1">/reviews</code>).
          </p>
        </header>

        {misconfigured ? (
          <div
            className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
            role="alert"
          >
            Configure <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then restart{" "}
            <code className="rounded bg-black/30 px-1">npm run dev</code>.
          </div>
        ) : null}

        <section className="mt-10 rounded-2xl border border-slate-700/80 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Write a review</h2>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            {fieldErrors.form ? (
              <p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
                {fieldErrors.form}
              </p>
            ) : null}

            <div>
              <label htmlFor="rv-name" className="block text-sm font-medium text-slate-300">
                Name
              </label>
              <input
                id="rv-name"
                className="mt-1.5 w-full rounded-xl border border-slate-600 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none ring-emerald-500/0 transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/30"
                maxLength={MAX_REVIEW_NAME_LENGTH}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Your name"
              />
              {fieldErrors.name ? <p className="mt-1 text-xs text-red-300">{fieldErrors.name}</p> : null}
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-300">Rating</span>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: MAX_STARS }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`rounded-lg px-2 py-1 text-xl transition ${
                      displayRating >= n ? "text-amber-400" : "text-slate-600 hover:text-slate-400"
                    }`}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(null)}
                    aria-label={`${n} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {fieldErrors.stars ? <p className="mt-1 text-xs text-red-300">{fieldErrors.stars}</p> : null}
            </div>

            <div>
              <label htmlFor="rv-body" className="block text-sm font-medium text-slate-300">
                Review
              </label>
              <textarea
                id="rv-body"
                rows={4}
                className="mt-1.5 w-full resize-y rounded-xl border border-slate-600 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/30"
                maxLength={MAX_REVIEW_MESSAGE_LENGTH}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience…"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>{fieldErrors.message ? <span className="text-red-300">{fieldErrors.message}</span> : null}</span>
                <span>
                  {reviewText.length}/{MAX_REVIEW_MESSAGE_LENGTH}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || misconfigured}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {submitting ? "Saving…" : "Submit review"}
            </button>
          </form>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-white">All reviews</h2>
            <span className="text-xs text-slate-500">
              {realtimeOk ? "Live updates on" : "Polling every ~8s"}
            </span>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100" role="alert">
              {error}
            </p>
          ) : loading ? (
            <p className="mt-8 text-center text-slate-400">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-slate-600 bg-slate-900/40 px-6 py-12 text-center text-slate-400">
              No reviews yet. Be the first to leave one.
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-slate-700/80 bg-slate-900/50 px-5 py-4 shadow-lg shadow-black/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{r.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(r.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <div className="text-lg" aria-label={`${r.stars} out of ${MAX_STARS} stars`}>
                      <StarRow value={r.stars} />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">&ldquo;{r.message}&rdquo;</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
