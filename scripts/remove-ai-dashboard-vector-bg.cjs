/**
 * Removes blue gradient + black footer (e.g. VectorStock bar) from AI dashboard vectors
 * via edge flood fill. Tuned for dark blues with very low R (see border samples).
 *   node scripts/remove-ai-dashboard-vector-bg.cjs [input.png] [output.png]
 */
const sharp = require("sharp");
const path = require("path");

const input = path.resolve(
  process.argv[2] || path.join(__dirname, "../public/images/projects/ai-analytics-card.png"),
);
const output = path.resolve(
  process.argv[3] || path.join(__dirname, "../public/images/projects/ai-analytics-card-nobg.png"),
);

function getPixel(data, w, c, x, y) {
  const i = (y * w + x) * c;
  return [data[i], data[i + 1], data[i + 2]];
}

/** Pixels that belong to the stock blue gradient or black watermark strip. */
function isVectorBackgroundLike(r, g, b) {
  const sum = r + g + b;
  if (sum < 78) return true;

  // Stock gradient: consistently low red on sampled edges; strong blue vs red
  if (r > 92) return false;
  if (b < 55) return false;
  if (b < r + 28) return false;
  // Reject green-forward UI (not part of this stock gradient)
  if (g > b + 45) return false;

  return true;
}

function featherAlpha(data, w, h, channels, passes = 2) {
  const alphaTmp = new Uint8Array(w * h);
  for (let pass = 0; pass < passes; pass++) {
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
}

async function main() {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const channels = info.channels;
  if (channels !== 4) throw new Error("Expected RGBA");

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
    if (isVectorBackgroundLike(r, g, b)) push(x, 0);
    const [r2, g2, b2] = getPixel(data, w, channels, x, h - 1);
    if (isVectorBackgroundLike(r2, g2, b2)) push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    const [r, g, b] = getPixel(data, w, channels, 0, y);
    if (isVectorBackgroundLike(r, g, b)) push(0, y);
    const [r2, g2, b2] = getPixel(data, w, channels, w - 1, y);
    if (isVectorBackgroundLike(r2, g2, b2)) push(w - 1, y);
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
      if (!isVectorBackgroundLike(r, g, b)) continue;
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

  featherAlpha(data, w, h, channels, 2);

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
