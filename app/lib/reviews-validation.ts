import {
  MAX_REVIEW_MESSAGE_LENGTH,
  MAX_REVIEW_NAME_LENGTH,
  MAX_STARS,
  MIN_STARS,
} from "@/app/lib/reviews-constants";

export type StoredReview = {
  id: string;
  name: string;
  message: string;
  stars: number;
  createdAt: string;
};

export type ReviewFieldErrors = {
  name?: string;
  message?: string;
  stars?: string;
  /** Set when the request body is not valid JSON or not an object. */
  form?: string;
};

export type ReviewValidationResult =
  | { ok: true; value: { name: string; message: string; stars: number } }
  | { ok: false; errors: ReviewFieldErrors };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function validateReviewInput(body: unknown): ReviewValidationResult {
  const errors: ReviewFieldErrors = {};

  if (!isRecord(body)) {
    return { ok: false, errors: { form: "Invalid request body." } };
  }

  const nameRaw = body.name;
  const messageRaw = body.message;
  const starsRaw = body.stars;

  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  const message = typeof messageRaw === "string" ? messageRaw.trim() : "";
  const stars =
    typeof starsRaw === "number" && Number.isFinite(starsRaw)
      ? Math.round(starsRaw)
      : typeof starsRaw === "string" && starsRaw.trim() !== ""
        ? Math.round(Number(starsRaw))
        : NaN;

  if (!name) errors.name = "Please enter your name.";
  else if (name.length > MAX_REVIEW_NAME_LENGTH)
    errors.name = `Name must be ${MAX_REVIEW_NAME_LENGTH} characters or fewer.`;

  if (!message) errors.message = "Please write a short review.";
  else if (message.length > MAX_REVIEW_MESSAGE_LENGTH)
    errors.message = `Review must be ${MAX_REVIEW_MESSAGE_LENGTH} characters or fewer.`;

  if (!Number.isFinite(stars) || stars < MIN_STARS || stars > MAX_STARS) {
    errors.stars = `Please choose a star rating (${MIN_STARS}–${MAX_STARS}).`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name: name.slice(0, MAX_REVIEW_NAME_LENGTH),
      message: message.slice(0, MAX_REVIEW_MESSAGE_LENGTH),
      stars: Math.min(MAX_STARS, Math.max(MIN_STARS, stars)),
    },
  };
}
