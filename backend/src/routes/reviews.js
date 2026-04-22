import { Router } from "express";
import { Review } from "../models/Review.js";

const DEFAULT_LIST_LIMIT = 1000;

function listLimit() {
  const n = Number.parseInt(process.env.REVIEWS_LIST_LIMIT ?? "", 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10_000) : DEFAULT_LIST_LIMIT;
}

const router = Router();

function toClient(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    message: doc.comment,
    stars: doc.rating,
    createdAt: doc.createdAt.toISOString(),
  };
}

function parseBody(body) {
  const errors = {};

  const name =
    typeof body?.name === "string" ? body.name.trim() : typeof body?.name === "number" ? String(body.name) : "";

  const commentRaw =
    body?.comment !== undefined && body.comment !== null
      ? body.comment
      : body?.message !== undefined && body.message !== null
        ? body.message
        : "";

  const comment = typeof commentRaw === "string" ? commentRaw.trim() : "";

  const ratingRaw =
    body?.rating !== undefined && body.rating !== null
      ? body.rating
      : body?.stars !== undefined && body.stars !== null
        ? body.stars
        : undefined;

  const rating =
    typeof ratingRaw === "number" && Number.isFinite(ratingRaw)
      ? Math.round(ratingRaw)
      : typeof ratingRaw === "string" && ratingRaw.trim() !== ""
        ? Math.round(Number(ratingRaw))
        : NaN;

  if (!name) errors.name = "Please enter your name.";
  else if (name.length > 80) errors.name = "Name must be 80 characters or fewer.";

  if (!comment) errors.message = "Please write a short review.";
  else if (comment.length > 500) errors.message = "Review must be 500 characters or fewer.";

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    errors.stars = "Please choose a star rating (1–5).";
  }

  return { errors, value: { name, comment, rating } };
}

router.get("/", async (_req, res) => {
  try {
    const docs = await Review.find()
      .sort({ createdAt: -1 })
      .limit(listLimit())
      .lean();

    const reviews = docs.map((d) => ({
      id: String(d._id),
      name: d.name,
      message: d.comment,
      stars: d.rating,
      createdAt: new Date(d.createdAt).toISOString(),
    }));

    res.json({ reviews });
  } catch (e) {
    console.error("[GET /reviews]", e);
    res.status(500).json({ error: "Could not load reviews." });
  }
});

router.post("/", async (req, res) => {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ errors: { form: "Invalid JSON body." } });
    }
  }

  const { errors, value } = parseBody(body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const doc = await Review.create({
      name: value.name.slice(0, 80),
      comment: value.comment.slice(0, 500),
      rating: Math.min(5, Math.max(1, value.rating)),
    });

    res.status(201).json({ review: toClient(doc) });
  } catch (e) {
    console.error("[POST /reviews]", e);
    res.status(500).json({ error: "Could not save your review." });
  }
});

export default router;
