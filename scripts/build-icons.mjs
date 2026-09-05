/**
 * Renders the home-screen icons: apple-touch-icon.png plus the two PNG sizes
 * the web manifest points at.
 *
 * These have to be raster. favicon.svg is enough for a browser tab, but iOS
 * ignores SVG for "Add to Home Screen" and falls back to a screenshot of the
 * page, which is how a bookmark ends up looking like a thumbnail of the hero
 * instead of a logo. Android reads the manifest and wants PNGs too.
 *
 * The artwork is the favicon's, redrawn with the canvas API rather than
 * rasterised from the SVG file, because nothing in this toolchain renders SVG.
 * That means the two can drift: if favicon.svg changes, change HEART and BANDS
 * below to match.
 *
 * The heart is drawn at 62% of the canvas and centred, which keeps it inside
 * the 80% safe circle a maskable icon has to survive — Android crops these to
 * whatever shape the launcher uses, and a full-bleed mark loses its edges.
 *
 * Runs as part of `npm run build`. Output is committed.
 *
 *   npm run build:icons
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createCanvas, Path2D } from "@napi-rs/canvas";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

/* The same geometry as public/favicon.svg, on its 100×100 box. */
const HEART =
  "M50 82 C 50 82 17 60 17 39 C 17 26 27 18 37 18 C 44 18 49 22 50 28 C 51 22 56 18 63 18 C 73 18 83 26 83 39 C 83 60 50 82 50 82 Z";
const BANDS = [
  [14, 58, 33, 45, 67, 45, 86, 60],
  [27, 72, 39, 63, 61, 63, 73, 73],
];
const BAND_WIDTH = 7;

/** The heart as its own layer: white, with the ripple bands punched through. */
function heartLayer(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const s = size / 100;
  ctx.scale(s, s);

  ctx.fillStyle = "#ffffff";
  ctx.fill(new Path2D(HEART));

  // destination-out on this layer alone, so the bands become transparent and
  // the gradient behind shows through once the layer is composited. Painting
  // them in a flat colour instead would leave two solid stripes that only
  // matched the background at one point of the gradient.
  ctx.globalCompositeOperation = "destination-out";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = BAND_WIDTH;
  ctx.lineCap = "round";
  for (const [mx, my, c1x, c1y, c2x, c2y, ex, ey] of BANDS) {
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
    ctx.stroke();
  }
  return canvas;
}

function icon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Full bleed, no rounded corners: iOS and Android both apply their own mask,
  // and a corner radius baked in here shows as a dark rim inside theirs.
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#5aa8ea");
  grad.addColorStop(1, "#1f6fd4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const heart = Math.round(size * 0.62);
  const offset = Math.round((size - heart) / 2);
  ctx.drawImage(heartLayer(heart), offset, offset);

  return canvas.toBuffer("image/png");
}

const out = here("../public/icons");
await mkdir(out, { recursive: true });

const sizes = [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
];

for (const [name, size] of sizes) {
  await writeFile(`${out}/${name}`, icon(size));
  console.log(`icons: ${name} (${size}×${size})`);
}
