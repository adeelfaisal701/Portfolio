import type { StoredReview } from "@/app/lib/reviews-validation";

/** Shape returned by Supabase PostgREST / Realtime (snake_case). Supports legacy message/stars and spec review/rating. */
export type ReviewDbRow = {
  id: string;
  name: string;
  /** Legacy column */
  message?: string | null;
  /** Spec column */
  review?: string | null;
  /** Legacy column */
  stars?: number | null;
  /** Spec column */
  rating?: number | null;
  created_at: string;
  approved?: boolean | null;
};

export function dbRowToStored(row: ReviewDbRow): StoredReview | null {
  const text = (row.review ?? row.message ?? "").trim();
  const starRaw = row.rating ?? row.stars;
  const stars =
    typeof starRaw === "number" && Number.isFinite(starRaw)
      ? Math.round(starRaw)
      : typeof starRaw === "string"
        ? Math.round(Number(starRaw))
        : NaN;

  if (row.approved === false) return null;

  if (!Number.isFinite(stars) || stars < 1 || stars > 5) return null;

  return {
    id: row.id,
    name: row.name,
    message: text,
    stars,
    createdAt: row.created_at,
  };
}
