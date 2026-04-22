/**
 * Barrel for review types, validation, and limits used by the UI and API.
 * Reviews are stored in Supabase; localStorage helpers were removed.
 */

export type { ReviewFieldErrors, StoredReview } from "./reviews-validation";
export { validateReviewInput } from "./reviews-validation";
export {
  MAX_REVIEW_MESSAGE_LENGTH,
  MAX_REVIEW_NAME_LENGTH,
  MAX_STORED_REVIEWS,
  MAX_STARS,
  MIN_STARS,
} from "./reviews-constants";
