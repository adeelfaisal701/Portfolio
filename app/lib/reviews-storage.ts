export type StoredReview = {
  id: string;
  name: string;
  message: string;
  stars: number;
  createdAt: string;
};

export const REVIEWS_STORAGE_KEY = "fa_dev_visitor_reviews_v1";
export const MAX_STORED_REVIEWS = 50;
export const MAX_REVIEW_MESSAGE_LENGTH = 500;
export const MAX_REVIEW_NAME_LENGTH = 80;
export const MIN_STARS = 1;
export const MAX_STARS = 5;

function parseStored(json: string | null): StoredReview[] {
  if (!json) return [];
  try {
    const data = JSON.parse(json) as unknown;
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (r): r is StoredReview =>
          r &&
          typeof r === "object" &&
          typeof (r as StoredReview).id === "string" &&
          typeof (r as StoredReview).name === "string" &&
          typeof (r as StoredReview).message === "string" &&
          typeof (r as StoredReview).stars === "number" &&
          typeof (r as StoredReview).createdAt === "string",
      )
      .slice(0, MAX_STORED_REVIEWS);
  } catch {
    return [];
  }
}

export function loadReviews(): StoredReview[] {
  if (typeof window === "undefined") return [];
  return parseStored(window.localStorage.getItem(REVIEWS_STORAGE_KEY));
}

export function saveReviews(reviews: StoredReview[]): void {
  if (typeof window === "undefined") return;
  const trimmed = reviews.slice(0, MAX_STORED_REVIEWS);
  window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(trimmed));
}

export function createReview(input: {
  name: string;
  message: string;
  stars: number;
}): StoredReview {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `r_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name: input.name.trim().slice(0, MAX_REVIEW_NAME_LENGTH),
    message: input.message.trim().slice(0, MAX_REVIEW_MESSAGE_LENGTH),
    stars: Math.min(MAX_STARS, Math.max(MIN_STARS, Math.round(input.stars))),
    createdAt: new Date().toISOString(),
  };
}
