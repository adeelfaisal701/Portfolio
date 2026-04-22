#!/usr/bin/env node
/**
 * Validates .env.local for browser-only Supabase reviews (NEXT_PUBLIC_* anon key).
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envLocal = path.join(root, ".env.local");

const REQUIRED = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

const PLACEHOLDER_HINTS = ["YOUR_PROJECT_REF", "your_anon_public_key_here", "your_service_role_key_here"];

function parseDotenv(content) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function main() {
  if (!fs.existsSync(envLocal)) {
    console.error("Missing .env.local — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    process.exit(1);
  }

  const raw = fs.readFileSync(envLocal, "utf8");
  const env = parseDotenv(raw);
  const missing = REQUIRED.filter((k) => !env[k]?.length);
  if (missing.length) {
    console.error("Missing env keys in .env.local:", missing.join(", "));
    process.exit(1);
  }

  const bad = [];
  for (const key of REQUIRED) {
    const v = env[key];
    if (PLACEHOLDER_HINTS.some((h) => v.includes(h))) bad.push(key);
  }
  if (bad.length) {
    console.error(
      "Replace placeholder values in .env.local for:",
      bad.join(", "),
      "\n(Source keys from Supabase → Project Settings → API.)",
    );
    process.exit(1);
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://")) {
    console.error("NEXT_PUBLIC_SUPABASE_URL should start with https://");
    process.exit(1);
  }

  console.log("Reviews env check passed: NEXT_PUBLIC_SUPABASE_URL and anon key are set (non-placeholder).");
  process.exit(0);
}

main();
