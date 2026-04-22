import path from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { connectDb } from "./config/db.js";
import reviewsRouter from "./routes/reviews.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(__dirname, "..");
const repoRoot = path.join(backendDir, "..");

dotenv.config({ path: path.join(backendDir, ".env") });
dotenv.config({ path: path.join(repoRoot, ".env.local"), override: true });

const PORT = Number(process.env.PORT) || 4000;

/** Public reviews: allow any site to GET/POST unless CORS_ORIGIN is set (comma list or *). */
function corsOriginOption() {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw || raw === "*") return true;
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return true;
  return list.length === 1 ? list[0] : list;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  await connectDb(uri);

  const app = express();
  app.use(
    cors({
      origin: corsOriginOption(),
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    }),
  );
  app.use(express.json({ limit: "32kb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/reviews", reviewsRouter);

  app.listen(PORT, () => {
    console.log(`Reviews API listening on http://127.0.0.1:${PORT}`);
    console.log(`  GET/POST http://127.0.0.1:${PORT}/reviews`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
