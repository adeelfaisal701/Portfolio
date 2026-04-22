"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MAX_STORED_REVIEWS } from "@/app/lib/reviews-constants";

import { dbRowToStored, type ReviewDbRow } from "@/app/lib/review-db-mapper";
import {
  MAX_REVIEW_MESSAGE_LENGTH,
  MAX_REVIEW_NAME_LENGTH,
  MAX_STARS,
  MIN_STARS,
  type StoredReview,
} from "@/app/lib/reviews-storage";
import { createSupabaseClient } from "@/lib/supabaseClient";

/** Polling interval when Realtime subscription is healthy (sparse refresh). */
const POLL_MS_REALTIME_OK = 45_000;
/** Polling when Realtime is down or unsubscribed (~5–10s). */
const POLL_MS_FALLBACK = 8_000;
/** Minimum gap between successful submits (spam guard). */
const SUBMIT_COOLDOWN_MS = 1_600;

type FieldErrors = {
  name?: string;
  message?: string;
  stars?: string;
  form?: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatStars(n: number): string {
  const s = Math.min(MAX_STARS, Math.max(MIN_STARS, Math.round(n)));
  return "★".repeat(s) + "☆".repeat(MAX_STARS - s);
}

/** Defer past React commit + Next router work; sync refresh during updates can worsen E668 races in dev. */
function scheduleScrollTriggerRefresh() {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const realtimeDismissedRef = useRef(false);
  const lastSubmitOkAt = useRef(0);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [stars, setStars] = useState<number>(0);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);
  const [newestId, setNewestId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoadError(null);
    const client = createSupabaseClient();
    if (!client) {
      setLoadError(
        "Reviews are not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
      );
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await client
        .from("reviews")
        .select("id,name,review,rating,created_at")
        .order("created_at", { ascending: false })
        .limit(MAX_STORED_REVIEWS);

      if (error) {
        console.error("[reviews fetch]", error.message);
        const hint =
          error.message.includes("column") && error.message.includes("exist")
            ? " Run Supabase migrations (review/rating columns)."
            : "";
        setLoadError(`Could not load reviews.${hint}`);
        setReviews([]);
        return;
      }

      const rows = (data ?? []) as ReviewDbRow[];
      setReviews(rows.map((r) => dbRowToStored(r)).filter((r): r is StoredReview => r !== null));
    } catch {
      setLoadError("Could not load reviews. Please check your connection.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    const client = createSupabaseClient();
    if (!client) {
      setRealtimeActive(false);
      return;
    }

    realtimeDismissedRef.current = false;

    const channel = client
      .channel("reviews_public_inserts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reviews",
        },
        (payload) => {
          const row = payload.new as ReviewDbRow;
          const review = dbRowToStored(row);
          if (!review) return;
          setReviews((prev) => {
            if (prev.some((r) => r.id === review.id)) return prev;
            return [review, ...prev].slice(0, MAX_STORED_REVIEWS);
          });
          setNewestId(review.id);
          window.setTimeout(() => setNewestId(null), 700);
          scheduleScrollTriggerRefresh();
        },
      )
      .subscribe((status, err) => {
        if (realtimeDismissedRef.current) return;
        if (status === "SUBSCRIBED") {
          setRealtimeActive(true);
          return;
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          if (process.env.NODE_ENV === "development") {
            console.warn("[reviews realtime]", status, err?.message ?? "");
          }
          setRealtimeActive(false);
        }
      });

    return () => {
      realtimeDismissedRef.current = true;
      setRealtimeActive(false);
      void client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const pollMs = realtimeActive ? POLL_MS_REALTIME_OK : POLL_MS_FALLBACK;
    const id = window.setInterval(() => {
      void fetchReviews();
    }, pollMs);
    const onWindowFocus = () => void fetchReviews();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void fetchReviews();
    };
    window.addEventListener("focus", onWindowFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onWindowFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchReviews, realtimeActive]);

  const displayStars = hoverStars ?? (stars || 0);

  const validate = useCallback((): boolean => {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedMsg = message.trim();

    if (!trimmedName) next.name = "Please enter your name.";
    else if (trimmedName.length > MAX_REVIEW_NAME_LENGTH)
      next.name = `Name must be ${MAX_REVIEW_NAME_LENGTH} characters or fewer.`;

    if (!trimmedMsg) next.message = "Please write a short review.";
    else if (trimmedMsg.length > MAX_REVIEW_MESSAGE_LENGTH)
      next.message = `Review must be ${MAX_REVIEW_MESSAGE_LENGTH} characters or fewer.`;

    if (!stars || stars < MIN_STARS || stars > MAX_STARS)
      next.stars = "Please choose a star rating (1–5).";

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [name, message, stars]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const client = createSupabaseClient();
    if (!client) {
      setErrors({
        form: "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      });
      return;
    }

    const now = Date.now();
    if (lastSubmitOkAt.current > 0 && now - lastSubmitOkAt.current < SUBMIT_COOLDOWN_MS) {
      setErrors({ form: "Please wait a moment before submitting again." });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const trimmedName = name.trim();
      const trimmedMsg = message.trim();

      const { data, error } = await client
        .from("reviews")
        .insert({
          name: trimmedName,
          review: trimmedMsg,
          rating: stars,
        })
        .select("id,name,review,rating,created_at")
        .single();

      if (error) {
        let form =
          error.message ||
          "Could not save your review.";
        if (error.code === "42501" || form.toLowerCase().includes("row-level security")) {
          form =
            "Could not save — check Supabase RLS allows INSERT on public.reviews for anon (see supabase/README.txt).";
        }
        setErrors({ form });
        return;
      }

      const inserted = dbRowToStored(data as ReviewDbRow);
      if (!inserted) {
        setErrors({ form: "Could not save your review." });
        return;
      }

      lastSubmitOkAt.current = Date.now();

      setReviews((prev) => {
        const withoutDup = prev.filter((r) => r.id !== inserted.id);
        return [inserted, ...withoutDup].slice(0, MAX_STORED_REVIEWS);
      });
      setNewestId(inserted.id);
      window.setTimeout(() => setNewestId(null), 700);
      setName("");
      setMessage("");
      setStars(0);
      setHoverStars(null);
      setSuccessFlash(true);
      window.setTimeout(() => setSuccessFlash(false), 3200);
      scheduleScrollTriggerRefresh();
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const starHint = useMemo(() => {
    if (hoverStars) return `${hoverStars} of ${MAX_STARS} stars`;
    if (stars) return `${stars} of ${MAX_STARS} stars selected`;
    return "Click to rate";
  }, [hoverStars, stars]);

  return (
    <section className="section reviews-section" id="reviews" aria-labelledby="reviews-heading">
      <p className="s-label reveal">Community</p>
      <h2 className="s-title reveal" id="reviews-heading">
        Leave a <em>Review</em>
      </h2>

      <div className="reviews-layout reveal">
        <form className="reviews-form-card" onSubmit={handleSubmit} noValidate>
          <h3 className="reviews-form-title">Share your feedback</h3>
          <p className="reviews-form-lead">
            Reviews are public and visible to everyone. They are saved in Supabase and shared across all visitors.
          </p>

          {errors.form ? (
            <p className="reviews-form-banner reviews-form-banner--error" role="alert">
              {errors.form}
            </p>
          ) : null}
          {successFlash ? (
            <p className="reviews-form-banner reviews-form-banner--ok" role="status">
              Thanks — your review was added.
            </p>
          ) : null}

          <div className="reviews-field">
            <label className="reviews-label" htmlFor="review-name">
              Name
            </label>
            <input
              id="review-name"
              className={`reviews-input ${errors.name ? "reviews-input--error" : ""}`}
              type="text"
              name="name"
              autoComplete="name"
              maxLength={MAX_REVIEW_NAME_LENGTH}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((o) => ({ ...o, name: undefined }));
              }}
              placeholder="Your name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "review-name-err" : undefined}
            />
            {errors.name ? (
              <p className="reviews-field-error" id="review-name-err" role="alert">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="reviews-field">
            <span className="reviews-label" id="review-stars-label">
              Rating
            </span>
            <div
              className="reviews-stars"
              role="group"
              aria-labelledby="review-stars-label"
              aria-describedby="review-stars-hint"
            >
              {Array.from({ length: MAX_STARS }, (_, i) => i + 1).map((n) => {
                const active = displayStars >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    className={`reviews-star-btn ${active ? "is-active" : ""}`}
                    onClick={() => {
                      setStars(n);
                      setErrors((o) => ({ ...o, stars: undefined }));
                    }}
                    onMouseEnter={() => setHoverStars(n)}
                    onMouseLeave={() => setHoverStars(null)}
                    onFocus={() => setHoverStars(n)}
                    onBlur={() => setHoverStars(null)}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    aria-pressed={stars === n}
                  >
                    <span aria-hidden>{active ? "★" : "☆"}</span>
                  </button>
                );
              })}
            </div>
            <p className="reviews-stars-hint" id="review-stars-hint">
              {starHint}
            </p>
            {errors.stars ? (
              <p className="reviews-field-error" role="alert">
                {errors.stars}
              </p>
            ) : null}
          </div>

          <div className="reviews-field">
            <label className="reviews-label" htmlFor="review-message">
              Review
            </label>
            <textarea
              id="review-message"
              className={`reviews-textarea ${errors.message ? "reviews-input--error" : ""}`}
              name="message"
              rows={4}
              maxLength={MAX_REVIEW_MESSAGE_LENGTH}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors((o) => ({ ...o, message: undefined }));
              }}
              placeholder="What stood out about the experience?"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "review-msg-err" : "review-msg-count"}
            />
            <div className="reviews-textarea-meta">
              {errors.message ? (
                <p className="reviews-field-error" id="review-msg-err" role="alert">
                  {errors.message}
                </p>
              ) : (
                <span />
              )}
              <span className="reviews-char-count" id="review-msg-count">
                {message.length}/{MAX_REVIEW_MESSAGE_LENGTH}
              </span>
            </div>
          </div>

          <button type="submit" className="reviews-submit btn-p" disabled={submitting}>
            <span className="btn-p-txt">{submitting ? "Submitting…" : "Submit review"}</span>
          </button>
        </form>

        <aside className="reviews-aside reveal">
          <div className="reviews-aside-card">
            <p className="reviews-aside-kicker">Trust</p>
            <p className="reviews-aside-text">
              Honest feedback helps visitors decide quickly. Public reviews help others see real experiences with
              this portfolio.
            </p>
          </div>
        </aside>
      </div>

      <div className="reviews-list-wrap reveal">
        <h3 className="reviews-list-title">Visitor reviews</h3>
        {loadError ? (
          <p className="reviews-empty" role="alert">
            {loadError}
          </p>
        ) : loading ? (
          <p className="reviews-empty" aria-live="polite">
            Loading reviews…
          </p>
        ) : reviews.length === 0 ? (
          <p className="reviews-empty">No reviews yet — be the first to share feedback.</p>
        ) : (
          <div className="reviews-user-grid">
            {reviews.map((r) => (
              <article
                key={r.id}
                className={`user-review-card ${newestId === r.id ? "is-new" : ""}`}
              >
                <div className="user-review-stars" aria-label={`${r.stars} out of ${MAX_STARS} stars`}>
                  {formatStars(r.stars)}
                </div>
                <p className="user-review-text">&quot;{r.message}&quot;</p>
                <div className="user-review-author">
                  <div className="user-review-avatar">{initials(r.name)}</div>
                  <div className="user-review-meta">
                    <h4 className="user-review-name">{r.name}</h4>
                    <span className="user-review-date">
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
