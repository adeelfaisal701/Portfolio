"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MAX_STORED_REVIEWS } from "@/app/lib/reviews-constants";

const REVIEWS_API_BASE_RAW =
  typeof process.env.NEXT_PUBLIC_REVIEWS_API_URL === "string"
    ? process.env.NEXT_PUBLIC_REVIEWS_API_URL.trim()
    : "";
const REVIEWS_API_BASE = REVIEWS_API_BASE_RAW.replace(/\/$/, "");

const reviewsEndpoint = REVIEWS_API_BASE ? `${REVIEWS_API_BASE}/reviews` : "/api/reviews";
import { dbRowToStored, type ReviewDbRow } from "@/app/lib/review-db-mapper";
import {
  MAX_REVIEW_MESSAGE_LENGTH,
  MAX_REVIEW_NAME_LENGTH,
  MAX_STARS,
  MIN_STARS,
  type StoredReview,
} from "@/app/lib/reviews-storage";
import { createBrowserSupabaseClient } from "@/app/lib/supabase-browser";

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

/** Backup polling when Realtime is healthy (catches missed events). */
const POLL_MS_REALTIME_OK = 120_000;
/** Faster polling when Realtime is unavailable or anon key missing. */
const POLL_MS_FALLBACK = 25_000;

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const realtimeDismissedRef = useRef(false);
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
    try {
      const res = await fetch(reviewsEndpoint, { cache: "no-store" });
      if (res.status === 503) {
        setLoadError(
          REVIEWS_API_BASE
            ? "Reviews API is unavailable. Ensure the Express server is running and MONGODB_URI is set."
            : "Reviews are not configured. Add MONGODB_URI to .env.local for MongoDB Atlas, or configure Supabase (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).",
        );
        setReviews([]);
        return;
      }
      if (!res.ok) {
        setLoadError("Could not load reviews. Please try again later.");
        setReviews([]);
        return;
      }
      const data = (await res.json()) as { reviews?: StoredReview[] };
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
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
    /* Mongo/Express reviews: no Supabase Realtime (avoids CHANNEL_ERROR + duplicate GoTrue clients). */
    if (REVIEWS_API_BASE) {
      setRealtimeActive(false);
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setRealtimeActive(false);
      return;
    }

    realtimeDismissedRef.current = false;

    const channel = supabase
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
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const pollMs =
      REVIEWS_API_BASE ? POLL_MS_FALLBACK : realtimeActive ? POLL_MS_REALTIME_OK : POLL_MS_FALLBACK;
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

    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch(reviewsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          message: message.trim(),
          stars,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        review?: StoredReview;
        errors?: FieldErrors;
        error?: string;
        retryAfterSec?: number;
      };

      if (res.status === 429) {
        const wait = payload.retryAfterSec ? ` Try again in about ${payload.retryAfterSec}s.` : "";
        setErrors({ form: (payload.error ?? "Too many submissions from this network.") + wait });
        return;
      }

      if (res.status === 400 && payload.errors) {
        setErrors({
          name: payload.errors.name,
          message: payload.errors.message,
          stars: payload.errors.stars,
          form: payload.errors.form,
        });
        return;
      }

      if (!res.ok || !payload.review) {
        setErrors({ form: payload.error ?? "Something went wrong. Please try again." });
        return;
      }

      const review = payload.review;
      setReviews((prev) => {
        const withoutDup = prev.filter((r) => r.id !== review.id);
        return [review, ...withoutDup].slice(0, MAX_STORED_REVIEWS);
      });
      setNewestId(review.id);
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
            Reviews are public and visible to everyone. They are stored securely on the server and shared across
            all visitors.
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
