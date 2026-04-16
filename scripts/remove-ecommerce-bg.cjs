/**
 * Removes background by flood-filling from image edges: any pixel connected to the
 * border through "background-like" colors becomes transparent. Tuned for orange +
 * white halos around a centered illustration. Run: npm run process:ecommerce-image
 */
const sharp = require("sharp");
const path = require("path");
const input = path.join(__dirname, "../public/images/projects/ecommerce-card.png");
const output = path.join(__dirname, "../public/images/projects/ecommerce-card-nobg.png");

function getPixel(data, w, c, x, y) {
  const i = (y * w + x) * c;
  return [data[i], data[i + 1], data[i + 2]];
}

function manhattan(r, g, b, br, bg, bb) {
  return Math.abs(r - br) + Math.abs(g - bg) + Math.abs(b - bb);
}

function isBackgroundLike(r, g, b, bgR, bgG, bgB) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const spread = mx - mn;
  const lum = r + g + b;

  // Average border color (orange)
  const dEdge = manhattan(r, g, b, bgR, bgG, bgB);
  if (dEdge < 88) return true;

  // Near-white / light gray halo
  if (lum > 708 && spread < 48) return true;

  // Light peach / cream bokeh
  const peach =
    r > 200 &&
    g > 138 &&
    g < 252 &&
    b > 65 &&
    b < 218 &&
    r - b > 12 &&
    spread < 125;
  if (peach) return true;

  return false;
}

async function main() {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const channels = info.channels;
  if (channels !== 4) throw new Error("Expected RGBA");

  const samples = [];
  const step = Math.max(1, Math.floor(Math.min(w, h) / 40));
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
    if (isBackgroundLike(r, g, b, bgR, bgG, bgB)) push(x, 0);
    const [r2, g2, b2] = getPixel(data, w, channels, x, h - 1);
    if (isBackgroundLike(r2, g2, b2, bgR, bgG, bgB)) push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    const [r, g, b] = getPixel(data, w, channels, 0, y);
    if (isBackgroundLike(r, g, b, bgR, bgG, bgB)) push(0, y);
    const [r2, g2, b2] = getPixel(data, w, channels, w - 1, y);
    if (isBackgroundLike(r2, g2, b2, bgR, bgG, bgB)) push(w - 1, y);
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
      if (!isBackgroundLike(r, g, b, bgR, bgG, bgB)) continue;
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
