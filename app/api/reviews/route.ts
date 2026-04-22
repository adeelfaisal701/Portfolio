import { dbRowToStored, type ReviewDbRow } from "@/app/lib/review-db-mapper";
import { connectMongoReviews, isMongoReviewsConfigured } from "@/app/lib/mongodb";
import { getReviewModel } from "@/app/lib/review-mongoose-model";
import { MAX_STORED_REVIEWS } from "@/app/lib/reviews-constants";
import { checkReviewPostRateLimit, getClientIp } from "@/app/lib/review-rate-limit";
import { validateReviewInput } from "@/app/lib/reviews-validation";
import type { StoredReview } from "@/app/lib/reviews-validation";
import { getSupabaseAdmin } from "@/app/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REVIEWS_NOT_CONFIGURED =
  "Reviews are not configured. Set MONGODB_URI (MongoDB Atlas), or set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for server-side routes.";

function mongoLeanToStored(d: {
  _id: unknown;
  name: string;
  comment: string;
  rating: number;
  createdAt: Date;
}): StoredReview {
  return {
    id: String(d._id),
    name: d.name,
    message: d.comment,
    stars: d.rating,
    createdAt: new Date(d.createdAt).toISOString(),
  };
}

export async function GET() {
  if (isMongoReviewsConfigured()) {
    try {
      await connectMongoReviews();
      const Review = getReviewModel();
      const docs = await Review.find()
        .sort({ createdAt: -1 })
        .limit(MAX_STORED_REVIEWS)
        .lean();

      const reviews = docs.map((d) =>
        mongoLeanToStored({
          _id: d._id,
          name: d.name,
          comment: d.comment,
          rating: d.rating,
          createdAt: d.createdAt as Date,
        }),
      );
      return Response.json({ reviews });
    } catch (e) {
      console.error("[reviews GET mongo]", e);
      return Response.json({ error: "Could not load reviews." }, { status: 500 });
    }
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json({ error: REVIEWS_NOT_CONFIGURED }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id, name, review, rating, created_at")
    .order("created_at", { ascending: false })
    .limit(MAX_STORED_REVIEWS);

  if (error) {
    const detail =
      error && typeof error === "object" && "cause" in error && error.cause != null
        ? ` cause=${String((error as { cause: unknown }).cause)}`
        : "";
    console.error("[reviews GET]", error.message, detail);
    const isNetwork =
      typeof error.message === "string" &&
      (error.message.includes("fetch failed") || error.message.includes("network"));
    return Response.json(
      {
        error: isNetwork
          ? "Could not reach Supabase from the server. Check NEXT_PUBLIC_SUPABASE_URL, firewall/DNS, or try again."
          : "Could not load reviews.",
      },
      { status: 500 },
    );
  }

  const reviews =
    (data as ReviewDbRow[] | null)
      ?.map((r) => dbRowToStored(r))
      .filter((r): r is NonNullable<typeof r> => r !== null) ?? [];
  return Response.json({ reviews });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = checkReviewPostRateLimit(ip);
  if (!limited.ok) {
    return Response.json(
      { error: "Too many reviews from this network. Try again later.", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ errors: { form: "Invalid JSON body." } }, { status: 400 });
  }

  const parsed = validateReviewInput(body);
  if (!parsed.ok) {
    return Response.json({ errors: parsed.errors }, { status: 400 });
  }

  const { name, message, stars } = parsed.value;

  if (isMongoReviewsConfigured()) {
    try {
      await connectMongoReviews();
      const Review = getReviewModel();
      const doc = await Review.create({
        name,
        comment: message,
        rating: stars,
      });
      const review = mongoLeanToStored({
        _id: doc._id,
        name: doc.name,
        comment: doc.comment,
        rating: doc.rating,
        createdAt: doc.createdAt,
      });
      return Response.json({ review }, { status: 201 });
    } catch (e) {
      console.error("[reviews POST mongo]", e);
      return Response.json({ error: "Could not save your review." }, { status: 500 });
    }
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json({ error: REVIEWS_NOT_CONFIGURED }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      name,
      review: message,
      rating: stars,
    })
    .select("id, name, review, rating, created_at")
    .single();

  if (error) {
    const detail =
      error && typeof error === "object" && "cause" in error && error.cause != null
        ? ` cause=${String((error as { cause: unknown }).cause)}`
        : "";
    console.error("[reviews POST]", error.message, detail);
    const isNetwork =
      typeof error.message === "string" &&
      (error.message.includes("fetch failed") || error.message.includes("network"));
    return Response.json(
      {
        error: isNetwork
          ? "Could not reach Supabase from the server. Check URL/network and try again."
          : "Could not save your review.",
      },
      { status: 500 },
    );
  }

  const review = dbRowToStored(data as ReviewDbRow);
  if (!review) {
    return Response.json({ error: "Could not save your review." }, { status: 500 });
  }
  return Response.json({ review }, { status: 201 });
}
