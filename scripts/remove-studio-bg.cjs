/**
 * Removes light neutral studio backgrounds (grey / off-white) via edge flood fill.
 * Stricter than ecommerce script so white subjects stay opaque. Usage:
 *   node scripts/remove-studio-bg.cjs <input.png> <output.png>
 */
const sharp = require("sharp");
const path = require("path");

const input = path.resolve(process.argv[2] || path.join(__dirname, "../public/images/projects/ai-analytics-card.png"));
const output = path.resolve(process.argv[3] || path.join(__dirname, "../public/images/projects/ai-analytics-card-nobg.png"));

function getPixel(data, w, c, x, y) {
  const i = (y * w + x) * c;
  return [data[i], data[i + 1], data[i + 2]];
}

function manhattan(r, g, b, br, bg, bb) {
  return Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
}

/** True for wall/floor: grey-ish, low chroma, close to sampled border color. */
function isStudioBackgroundLike(r, g, b, bgR, bgG, bgB) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const spread = mx - mn;
  const dEdge = manhattan(r, g, b, bgR, bgG, bgB);

  if (spread > 26) return false;
  if (dEdge < 44) return true;
  if (spread < 16 && dEdge < 62 && r + g + b > 600) return true;
  return false;
}

async function main() {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const channels = info.channels;
  if (channels !== 4) throw new Error("Expected RGBA");

  const samples = [];
  const step = Math.max(1, Math.floor(Math.min(w, h) / 24));
  for (let x = 0; x < w; x += step) {
    samples.push(getPixel(data, w, channels, x, 0));
    samples.push(getPixel(data, w, channels, x, h - 1));
  }
  for (let y = 0; y < h; y += step) {
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
    if (isStudioBackgroundLike(r, g, b, bgR, bgG, bgB)) push(x, 0);
    const [r2, g2, b2] = getPixel(data, w, channels, x, h - 1);
    if (isStudioBackgroundLike(r2, g2, b2, bgR, bgG, bgB)) push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    const [r, g, b] = getPixel(data, w, channels, 0, y);
    if (isStudioBackgroundLike(r, g, b, bgR, bgG, bgB)) push(0, y);
    const [r2, g2, b2] = getPixel(data, w, channels, w - 1, y);
    if (isStudioBackgroundLike(r2, g2, b2, bgR, bgG, bgB)) push(w - 1, y);
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
      if (!isStudioBackgroundLike(r, g, b, bgR, bgG, bgB)) continue;
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

  // Soften hard cut-out edges (reduces jagged white fringes on dark backgrounds)
  const alphaTmp = new Uint8Array(w * h);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        let cnt = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            sum += data[(ny * w + nx) * channels + 3];
            cnt++;
          }
        }
        alphaTmp[y * w + x] = Math.round(sum / cnt);
      }
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        data[(y * w + x) * channels + 3] = alphaTmp[y * w + x];
      }
    }
  }

  await sharp(Buffer.from(data), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(output);

  console.log("Wrote:", output);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
