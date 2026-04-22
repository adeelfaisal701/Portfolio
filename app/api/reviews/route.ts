import { dbRowToStored, type ReviewDbRow } from "@/app/lib/review-db-mapper";
import { MAX_STORED_REVIEWS } from "@/app/lib/reviews-constants";
import { checkReviewPostRateLimit, getClientIp } from "@/app/lib/review-rate-limit";
import { validateReviewInput } from "@/app/lib/reviews-validation";
import { getSupabaseAdmin } from "@/app/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json(
      { error: "Reviews are not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("id, name, message, stars, created_at, approved")
    .eq("approved", true)
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
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json(
      { error: "Reviews are not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

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

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      name,
      message,
      stars,
      approved: true,
    })
    .select("id, name, message, stars, created_at, approved")
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
