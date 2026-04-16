/**
 * Removes solid / near-solid purple backdrop via edge flood fill.
 * Seeds from top + upper sides only so a bottom "floor" that touches the lower edge can stay.
 * Run: npm run process:fullstack-image
 */
const sharp = require("sharp");
const path = require("path");

const input = path.join(__dirname, "../public/images/projects/fullstack-card.png");
const output = path.join(__dirname, "../public/images/projects/fullstack-card-nobg.png");

function getPixel(data, w, c, x, y) {
  const i = (y * w + x) * c;
  return [data[i], data[i + 1], data[i + 2]];
}

function manhattan(r, g, b, br, bg, bb) {
  return Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
}

/** True for backdrop purples similar to sampled edge (not the illustration). */
function isPurpleBackdropLike(r, g, b, bgR, bgG, bgB) {
  const d = manhattan(r, g, b, bgR, bgG, bgB);
  if (d < 96) return true;

  // Slightly lighter / desaturated variants of the same hue family
  if (d < 130 && b > 40 && r < 160 && g < 150 && b >= g - 30 && b >= r - 40) return true;

  return false;
}

async function main() {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const channels = info.channels;
  if (channels !== 4) throw new Error("Expected RGBA");

  const samples = [];
  const step = Math.max(1, Math.floor(Math.min(w, h) / 36));
  const sideCutoff = Math.floor(h * 0.82);

  for (let x = 0; x < w; x += step) {
    samples.push(getPixel(data, w, channels, x, 0));
  }
  for (let y = 0; y < sideCutoff; y += step) {
    samples.push(getPixel(data, w, channels, 0, y));
    samples.push(getPixel(data, w, channels, w - 1, y));
  }

  let br = 0,
    bg = 0,
    bb = 0;
  for (const [r, g, b] of samples) {
    br += r;
    bg += g;
    bb += b;
  }
  const n = samples.length;
  const bgR = Math.round(br / n);
  const bgG = Math.round(bg / n);
  const bgB = Math.round(bb / n);

  const mask = new Uint8Array(w * h);
  const queue = [];

  function push(x, y) {
    const k = y * w + x;
    if (mask[k]) return;
    mask[k] = 1;
    queue.push(k);
  }

  for (let x = 0; x < w; x++) {
    const [r, g, b] = getPixel(data, w, channels, x, 0);
    if (isPurpleBackdropLike(r, g, b, bgR, bgG, bgB)) push(x, 0);
  }
  for (let y = 0; y < sideCutoff; y++) {
    const [r, g, b] = getPixel(data, w, channels, 0, y);
    if (isPurpleBackdropLike(r, g, b, bgR, bgG, bgB)) push(0, y);
    const [r2, g2, b2] = getPixel(data, w, channels, w - 1, y);
    if (isPurpleBackdropLike(r2, g2, b2, bgR, bgG, bgB)) push(w - 1, y);
  }

  const neigh = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (queue.length) {
    const k = queue.pop();
    const y = Math.floor(k / w);
    const x = k - y * w;
    for (const [dx, dy] of neigh) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const nk = ny * w + nx;
      if (mask[nk]) continue;
      const [r, g, b] = getPixel(data, w, channels, nx, ny);
      if (!isPurpleBackdropLike(r, g, b, bgR, bgG, bgB)) continue;
      mask[nk] = 1;
      queue.push(nk);
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      const i = k * channels;
      if (mask[k]) data[i + 3] = 0;
    }
  }

  await sharp(Buffer.from(data), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(output);

  console.log("Wrote transparent PNG:", output);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
