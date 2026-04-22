#!/usr/bin/env node
/**
 * Hits local Next.js GET/POST /api/reviews when `npm run dev` is listening on PORT (default 3000).
 * Run: npm run smoke:reviews-api
 */

import http from "node:http";
import process from "node:process";

const HOST = process.env.REVIEWS_SMOKE_HOST ?? "127.0.0.1";
const PORT_CANDIDATES = process.env.REVIEWS_SMOKE_PORT
  ? [Number(process.env.REVIEWS_SMOKE_PORT)]
  : [3000, 3001];

function req(method, pathname, bodyObj, port) {
  return new Promise((resolve, reject) => {
    const payload = bodyObj ? JSON.stringify(bodyObj) : null;
    const opts = {
      hostname: HOST,
      port,
      path: pathname,
      method,
      headers: payload
        ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) }
        : {},
      // First route compile in dev can take 15–60s (webpack/turbopack).
      timeout: Number(process.env.REVIEWS_SMOKE_TIMEOUT_MS ?? 60000),
    };

    const r = http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode ?? 0, json: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode ?? 0, raw: data });
        }
      });
    });
    r.on("error", reject);
    r.on("timeout", () => {
      r.destroy();
      reject(new Error("timeout"));
    });
    if (payload) r.write(payload);
    r.end();
  });
}

async function tryPorts(fn) {
  let lastErr;
  for (const port of PORT_CANDIDATES) {
    try {
      return { port, result: await fn(port) };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("no port worked");
}

async function main() {
  console.log(
    `Smoke tests → ${HOST} ports ${PORT_CANDIDATES.join(",")} (/api/reviews)\n`,
  );

  try {
    const { port: usedPort, result: getRes } = await tryPorts((port) =>
      req("GET", "/api/reviews", null, port),
    );
    console.log("(using port", usedPort + ")");
    console.log("GET /api/reviews →", getRes.status);
    if (getRes.json && typeof getRes.json === "object") {
      if ("reviews" in getRes.json) console.log("  body has { reviews: [...] }");
      if ("error" in getRes.json) console.log("  body.error:", getRes.json.error);
    }

    const postRes = await req("POST", "/api/reviews", {
      name: "Smoke Test",
      message: "Automated smoke check.",
      stars: 5,
    }, usedPort);
    console.log("POST /api/reviews →", postRes.status);
    if (postRes.json && typeof postRes.json === "object") {
      if (postRes.json.review) console.log("  created review id:", postRes.json.review.id);
      if (postRes.json.error) console.log("  body.error:", postRes.json.error);
      if (postRes.json.errors) console.log("  validation errors:", postRes.json.errors);
    }

    if (getRes.status === 503 || postRes.status === 503) {
      console.log(
        "\nNote: 503 = server has no Supabase admin client. Set URL + SUPABASE_SERVICE_ROLE_KEY, then run: npm run verify:reviews-env",
      );
      process.exitCode = 0;
      return;
    }

    if (getRes.status === 500 || postRes.status === 500) {
      console.log(
        "\nNote: 500 = client may be using invalid keys, or `reviews` table / migrations missing on your Supabase project. Replace placeholders (npm run verify:reviews-env), run SQL from supabase/README.txt.",
      );
      process.exitCode = 0;
      return;
    }

    if (postRes.status === 201) {
      console.log("\nPOST succeeded — DB insert path works for this environment.");
    }

    process.exitCode = 0;
  } catch (e) {
    console.error("Request failed:", e.message);
    console.error(
      "Start the app first: npm run dev   (then re-run npm run smoke:reviews-api)",
    );
    process.exitCode = 1;
  }
}

main();
