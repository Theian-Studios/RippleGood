/**
 * Renders a numbered specimen sheet of "Ripple Good" wordmark options, as a
 * PDF you can read a number off and hand back.
 *
 * Why this exists: the wordmark has been tuned by description — smaller,
 * bolder, up a pixel, left a pixel — and a pixel is hard to ask for in
 * words. This draws the options side by side instead.
 *
 * Everything is drawn with the same fonts and the same heart geometry the
 * site and the Open Graph cards use, at 3× so a page prints at actual size.
 * The numbers under each lockup are the real CSS values, so a choice can be
 * applied directly.
 *
 *   node scripts/logo-variants.mjs [outfile.pdf]
 *
 * The PDF is written by hand: there is no PDF library in this project, and a
 * page here is a single image, so the format needed is a catalog, a page and
 * a Flate-compressed RGB image apiece. Raw pixels are deflated directly
 * rather than embedding the PNG, which avoids PNG's predictor bytes and
 * keeps it lossless — a JPEG page would soften exactly the hairlines this
 * sheet exists to compare.
 */
import { writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { createCanvas, GlobalFonts, Path2D } from "@napi-rs/canvas";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

GlobalFonts.registerFromPath(here("fonts/Poppins-Bold.ttf"), "PoppinsBold");
GlobalFonts.registerFromPath(here("fonts/Poppins-Regular.ttf"), "PoppinsRegular");
GlobalFonts.registerFromPath(here("fonts/Poppins-SemiBold.ttf"), "PoppinsSemi");
GlobalFonts.registerFromPath(here("fonts/DancingScript-Bold.ttf"), "ScriptBold");

/* Brand values, read off src/styles.css. */
const NAVY = "#0a1b33";
const BLUE = "#2472ec";
const BLUE600 = "#1a60cf";
const SKY = "#86c5f0";
const INK_SOFT = "#475569";
const INK_FAINT = "#78869b";
const RULE = "#e2e8f1";

/* US Letter at 3×: the page prints at actual size, so a 1px difference on
   the sheet is the 1px difference in the browser. */
const S = 3;
const PAGE_W = 612 * S;
const PAGE_H = 792 * S;

/** The heart, same path as public/favicon.svg and the site logo. */
const HEART =
  "M50 90 C 50 90 6 62 6 34 C 6 17 19 6 33 6 C 42 6 49 11 50 19 C 51 11 58 6 67 6 C 81 6 94 17 94 34 C 94 62 50 90 50 90 Z";
const BANDS = [
  [2, 60, 28, 42, 72, 42, 98, 62],
  [18, 77, 36, 63, 64, 63, 84, 78],
];

function heartLayer(size) {
  const c = createCanvas(size, size);
  const x = c.getContext("2d");
  x.scale(size / 100, size / 100);
  const g = x.createLinearGradient(8, 10, 92, 86);
  g.addColorStop(0, "#6fb0ec");
  g.addColorStop(1, BLUE600);
  x.fillStyle = g;
  x.fill(new Path2D(HEART));
  x.globalCompositeOperation = "destination-out";
  x.lineWidth = 9;
  x.lineCap = "round";
  x.strokeStyle = "#000";
  for (const [a, b, c1, d1, c2, d2, e, f] of BANDS) {
    x.beginPath();
    x.moveTo(a, b);
    x.bezierCurveTo(c1, d1, c2, d2, e, f);
    x.stroke();
  }
  return c;
}

/**
 * One lockup. `v` carries the CSS values a variant changes; everything else
 * matches the site's medium logo (44px heart, 25px "Ripple", 8px flex gap).
 */
function drawLockup(ctx, x, baseline, v) {
  const nameSize = (v.nameSize ?? 25) * S;
  const scriptSize = v.size * S;
  const heart = 44 * S;

  ctx.drawImage(heartLayer(heart), x, baseline - heart * 0.86);

  const textX = x + heart + 10 * S;
  ctx.textBaseline = "alphabetic";

  ctx.font = `${nameSize}px PoppinsBold`;
  ctx.fillStyle = v.nameColor ?? NAVY;
  ctx.fillText("Ripple", textX, baseline);
  const nameW = ctx.measureText("Ripple").width;

  const gap = (8 + (v.dx ?? 0)) * S;
  const gx = textX + nameW + gap;
  const gy = baseline + (v.dy ?? 0) * S;

  ctx.font = v.sans
    ? `${scriptSize}px ${v.sans}`
    : `${scriptSize}px ScriptBold`;
  ctx.fillStyle = v.color ?? BLUE;
  ctx.fillText(v.word ?? "Good", gx, gy);

  if (v.stroke) {
    ctx.strokeStyle = v.color ?? BLUE;
    ctx.lineWidth = v.stroke * S;
    ctx.strokeText(v.word ?? "Good", gx, gy);
  }
  return ctx.measureText(v.word ?? "Good").width + (gx - x);
}

/** Human-readable spec, so a chosen number maps onto real CSS. */
function specOf(v) {
  if (v.spec) return v.spec;
  const bits = [`${v.size}px`];
  bits.push(v.stroke ? `stroke ${v.stroke}px` : "no stroke");
  bits.push(`top ${v.dy ?? 0}px`);
  bits.push(`gap ${8 + (v.dx ?? 0)}px`);
  return bits.join("  ·  ");
}

/* ------------------------------------------------------------------ pages */

const CURRENT = { size: 27, stroke: 0.4, dy: -1, dx: -1 };

const groups = [
  {
    title: "Size and weight",
    blurb:
      "Dancing Script stops at weight 700 and the wordmark is already there, so extra weight comes from stroking the letterforms. Past about 0.8px the counters start to close.",
    variants: [31, 29, 27, 25].flatMap((size) =>
      [0, 0.4, 0.8].map((stroke) => ({ size, stroke, dy: -1, dx: -1 })),
    ),
  },
  {
    title: "Position",
    blurb:
      "All at 27px with a 0.4px stroke. `top` raises the script off the shared baseline; `gap` is the space between the two words.",
    variants: [0, -1, -2, -3].flatMap((dy) =>
      [1, -1, -3].map((dx) => ({ size: 27, stroke: 0.4, dy, dx })),
    ),
  },
  {
    title: "Other directions",
    blurb:
      "Changes of kind rather than degree. The footer version differs from these only in that “Ripple” is white.",
    variants: [
      { size: 27, stroke: 0.4, dy: -1, dx: -1, color: BLUE600, spec: "deeper blue (--blue-600)" },
      { size: 27, stroke: 0.4, dy: -1, dx: -1, color: SKY, spec: "sky (--sky)" },
      { size: 27, stroke: 0.4, dy: -1, dx: -1, color: NAVY, spec: "navy — one colour throughout" },
      { size: 27, stroke: 0, dy: -1, dx: 4, spec: "27px, no stroke, wide gap (12px)" },
      { size: 33, stroke: 0.4, dy: -1, dx: -1, spec: "33px — script leads the lockup" },
      { size: 23, stroke: 0, dy: -1, dx: -1, spec: "23px, no stroke — script recedes" },
      { size: 25, stroke: 0, dy: 0, dx: 0, sans: "PoppinsBold", spec: "no script: both words in the sans" },
      { size: 25, stroke: 0, dy: 0, dx: 0, sans: "PoppinsRegular", spec: "sans, regular weight — lighter second word" },
      { size: 27, stroke: 0.4, dy: -1, dx: -1, word: "good", spec: "lowercase “good”" },
      { size: 25, stroke: 0, dy: 0, dx: 0, sans: "PoppinsSemi", color: BLUE, spec: "sans semibold, in blue" },
    ],
  },
];

/* Number every variant across the whole document, so a number is unambiguous. */
let n = 0;
for (const g of groups) for (const v of g.variants) v.n = ++n;

const PER_PAGE = 6; // rows; two columns
const pages = [];

for (const g of groups) {
  for (let i = 0; i < g.variants.length; i += PER_PAGE * 2) {
    pages.push({ group: g, slice: g.variants.slice(i, i + PER_PAGE * 2) });
  }
}

function renderPage({ group, slice }, pageNo, pageCount) {
  const c = createCanvas(PAGE_W, PAGE_H);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  const M = 46 * S;
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = NAVY;
  ctx.font = `${20 * S}px PoppinsBold`;
  ctx.fillText(group.title, M, M + 22 * S);

  ctx.fillStyle = INK_SOFT;
  ctx.font = `${8.5 * S}px PoppinsRegular`;
  wrap(ctx, group.blurb, M, M + 40 * S, PAGE_W - M * 2, 12 * S);

  ctx.strokeStyle = RULE;
  ctx.lineWidth = 1 * S;
  ctx.beginPath();
  ctx.moveTo(M, M + 66 * S);
  ctx.lineTo(PAGE_W - M, M + 66 * S);
  ctx.stroke();

  const top = M + 96 * S;
  const colW = (PAGE_W - M * 2) / 2;
  const rowH = (PAGE_H - top - M - 20 * S) / PER_PAGE;

  slice.forEach((v, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * colW;
    const y = top + row * rowH;

    ctx.fillStyle = INK_FAINT;
    ctx.font = `${11 * S}px PoppinsBold`;
    ctx.fillText(String(v.n), x, y + 20 * S);

    drawLockup(ctx, x + 26 * S, y + 34 * S, v);

    const specX = x + 26 * S;
    const specY = y + 58 * S;
    ctx.fillStyle = INK_SOFT;
    ctx.font = `${7.5 * S}px PoppinsRegular`;
    const spec = specOf(v);
    ctx.fillText(spec, specX, specY);

    const isCurrent =
      !v.spec &&
      v.size === CURRENT.size &&
      v.stroke === CURRENT.stroke &&
      (v.dy ?? 0) === CURRENT.dy &&
      (v.dx ?? 0) === CURRENT.dx;
    if (isCurrent) {
      // Trailing the spec it belongs to, measured rather than guessed — a
      // fixed offset put this on top of the next column. The dot is drawn,
      // not typed: the vendored Poppins has no arrow or bullet glyph and
      // rendered a tofu box for one.
      const markX = specX + ctx.measureText(spec).width + 10 * S;
      ctx.fillStyle = BLUE;
      ctx.beginPath();
      ctx.arc(markX + 2.5 * S, specY - 2.5 * S, 2.5 * S, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${7.5 * S}px PoppinsSemi`;
      ctx.fillText("live now", markX + 9 * S, specY);
    }
  });

  ctx.fillStyle = INK_FAINT;
  ctx.font = `${7.5 * S}px PoppinsRegular`;
  ctx.fillText(
    `Ripple Good — wordmark options — page ${pageNo} of ${pageCount} — printed at actual size`,
    M,
    PAGE_H - M + 6 * S,
  );

  return c;
}

function wrap(ctx, text, x, y, maxW, lh) {
  let line = "";
  let yy = y;
  for (const word of String(text).split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy);
      yy += lh;
      line = word;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

/* --------------------------------------------------------------- pdf out */

function pdf(canvases) {
  const chunks = [];
  const offsets = [];
  let pos = 0;
  const put = (buf) => {
    const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf, "latin1");
    chunks.push(b);
    pos += b.length;
  };
  const obj = (id, body, stream) => {
    offsets[id] = pos;
    put(`${id} 0 obj\n${body}\n`);
    if (stream) {
      put("stream\n");
      put(stream);
      put("\nendstream\n");
    }
    put("endobj\n");
  };

  put("%PDF-1.4\n");

  const kids = canvases.map((_, i) => `${3 + i * 3} 0 R`).join(" ");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, `<< /Type /Pages /Kids [${kids}] /Count ${canvases.length} >>`);

  canvases.forEach((c, i) => {
    const pageId = 3 + i * 3;
    const contentId = pageId + 1;
    const imgId = pageId + 2;
    const w = c.width;
    const h = c.height;
    const ptW = w / S;
    const ptH = h / S;

    obj(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW} ${ptH}] ` +
        `/Resources << /XObject << /Im0 ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );

    const content = `q ${ptW} 0 0 ${ptH} 0 0 cm /Im0 Do Q`;
    obj(contentId, `<< /Length ${content.length} >>`, Buffer.from(content, "latin1"));

    // Raw RGB, alpha dropped: the pages are opaque, and DeviceRGB has no
    // fourth channel to put it in.
    const rgba = c.getContext("2d").getImageData(0, 0, w, h).data;
    const rgb = Buffer.allocUnsafe(w * h * 3);
    for (let p = 0, q = 0; p < rgba.length; p += 4, q += 3) {
      rgb[q] = rgba[p];
      rgb[q + 1] = rgba[p + 1];
      rgb[q + 2] = rgba[p + 2];
    }
    const data = deflateSync(rgb, { level: 9 });
    obj(
      imgId,
      `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${data.length} >>`,
      data,
    );
  });

  const xrefAt = pos;
  const count = offsets.length;
  let xref = `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let i = 1; i < count; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  put(xref);
  put(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`);

  return Buffer.concat(chunks);
}

const out = process.argv[2] || here("../ripple-good-wordmark-options.pdf");
const canvases = pages.map((p, i) => renderPage(p, i + 1, pages.length));
await writeFile(out, pdf(canvases));
console.log(`${n} options across ${pages.length} pages -> ${out}`);
