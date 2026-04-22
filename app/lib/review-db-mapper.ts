import type { StoredReview } from "@/app/lib/reviews-validation";

/** Shape returned by Supabase PostgREST / Realtime payloads (snake_case). */
export type ReviewDbRow = {
  id: string;
  name: string;
  message: string;
  stars: number;
  created_at: string;
  approved?: boolean | null;
};

export function dbRowToStored(row: ReviewDbRow): StoredReview | null {
  if (row.approved === false) return null;
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    stars: row.stars,
    createdAt: row.created_at,
  };
}
