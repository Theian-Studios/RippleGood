/**
 * Renders the site's 1200×630 Open Graph card into public/og/default.png, plus
 * one card per cause and a matching crawler-readable page under
 * public/share/<id>/.
 *
 * A pasted cause link should preview as "≈$6 → one net over a sleeping family",
 * not a generic logo — the outcome is the whole product, and it should survive
 * being shared.
 *
 * Why the share pages exist: this site is a HashRouter SPA, so every route
 * lives after a "#". Crawlers don't execute JavaScript and never see past the
 * hash, which means per-route meta tags set by React are invisible to them —
 * every shared link would preview identically. Each share page is therefore a
 * real, static HTML file carrying that cause's Open Graph tags, which bounces a
 * human visitor straight on to the app.
 *
 *   Share this:  ripple-good.org/share/malaria-nets
 *   Reader gets: ripple-good.org/cause/malaria-nets
 *
 * NOTE: nothing in the app links to these any more. The "Share this cause"
 * button was removed, so /share/<id> is now an author-facing URL — paste it
 * when you want a per-cause preview somewhere, rather than the hash route,
 * which previews identically for all eight causes. Delete this whole block and
 * public/share/ if that stops being worth the build step.
 *
 * Runs as part of `npm run build`. Output is committed: regenerate whenever a
 * headline, category, or cost figure changes.
 *
 *   npm run build:og
 *
 * Poppins is vendored under scripts/fonts (SIL Open Font License, see OFL.txt)
 * because the renderer can't reach the webfont the site loads in a browser.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { charities, CAUSE_ALIASES } from "../src/data/charities.js";

const W = 1200;
const H = 630;
const NAVY = "#0a1b33";
const SKY = "#86c5f0";
const WHITE = "#ffffff";
const MUTED = "rgba(255,255,255,0.62)";

/** The Ripple heart, drawn at (x, y) with the given height. Two ripple bands
 *  are cut out by painting them in the background color, which is fine here
 *  because both cards have a known solid navy ground. */
function drawMark(ctx, x, y, h, bg) {
  const s = h / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  const grad = ctx.createLinearGradient(8, 10, 92, 86);
  grad.addColorStop(0, "#9ccbf6");
  grad.addColorStop(1, "#4d95e8");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(50, 90);
  ctx.bezierCurveTo(50, 90, 6, 62, 6, 34);
  ctx.bezierCurveTo(6, 17, 19, 6, 33, 6);
  ctx.bezierCurveTo(42, 6, 49, 11, 50, 19);
  ctx.bezierCurveTo(51, 11, 58, 6, 67, 6);
  ctx.bezierCurveTo(81, 6, 94, 17, 94, 34);
  ctx.bezierCurveTo(94, 62, 50, 90, 50, 90);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = bg;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(2, 60);
  ctx.bezierCurveTo(28, 42, 72, 42, 98, 62);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18, 77);
  ctx.bezierCurveTo(36, 63, 64, 63, 84, 78);
  ctx.stroke();

  ctx.restore();
}


const here = (p) => fileURLToPath(new URL(p, import.meta.url));

GlobalFonts.registerFromPath(here("fonts/Poppins-Bold.ttf"), "PoppinsBold");
GlobalFonts.registerFromPath(here("fonts/Poppins-SemiBold.ttf"), "PoppinsSemi");
GlobalFonts.registerFromPath(here("fonts/Poppins-Regular.ttf"), "PoppinsRegular");
// The script half of the wordmark (SIL OFL, vendored alongside Poppins).
GlobalFonts.registerFromPath(here("fonts/DancingScript-Bold.ttf"), "ScriptBold");

/** Greedy wrap; returns the y just past the last line drawn. */
function wrap(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = next;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);

  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

/** The headline cost figure, if the cause has one worth leading with. */
function costLine(charity) {
  const figure = charity.costFigures?.[0];
  if (!figure || /pending/i.test(figure.value)) return null;
  return `${figure.value} ${figure.label.toLowerCase()}`;
}

function render(charity) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, H);

  // Same heart geometry as the site logo.
  drawMark(ctx, 74, 50, 62, NAVY);

  ctx.fillStyle = WHITE;
  ctx.font = "40px PoppinsBold";
  ctx.textBaseline = "middle";
  ctx.fillText("Ripple", 150, 84);
  const rippleW = ctx.measureText("Ripple").width;
  ctx.font = "48px ScriptBold";
  ctx.fillStyle = SKY;
  ctx.fillText("Good", 150 + rippleW + 10, 84);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = SKY;
  ctx.font = "22px PoppinsSemi";
  ctx.fillText(charity.category.toUpperCase(), 80, 214);

  ctx.fillStyle = WHITE;
  ctx.font = "62px PoppinsBold";
  const afterHeadline = wrap(ctx, charity.headline, 80, 292, W - 160, 74, 3);

  ctx.fillStyle = SKY;
  ctx.fillRect(80, afterHeadline + 16, 84, 5);

  const cost = costLine(charity);
  ctx.fillStyle = MUTED;
  ctx.font = "25px PoppinsRegular";
  wrap(
    ctx,
    cost
      ? `${cost} · ${charity.name} · ${charity.evaluator}`
      : `${charity.name} · ${charity.evaluator}`,
    80,
    Math.min(afterHeadline + 74, H - 56),
    W - 160,
    34,
    2,
  );

  return canvas.toBuffer("image/png");
}

/** Absolute URLs are the safest form for Open Graph consumers. */
// VERIFY: must match where the site actually lives, or previews will 404.
// Override per build with: SITE_URL=https://ian.github.io/ripple npm run build
const SITE_URL = (process.env.SITE_URL || "https://ripple-good.org").replace(/\/$/, "");

const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

function sharePage(charity) {
  const title = `${charity.category}: ${charity.headline} · Ripple Good`;
  const description = charity.provisional
    ? `${charity.subhead} (Provisional entry. Figures not yet verified.)`
    : charity.subhead;
  // Relative, so the bounce works on a custom domain and a project page alike:
  // /share/<id>/ -> ../../ -> the site root that owns index.html.
  const appUrl = `../../cause/${charity.id}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escape(title)}</title>
    <meta name="description" content="${escape(description)}" />
    <link rel="canonical" href="${SITE_URL}/cause/${charity.id}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Ripple Good" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:image" content="${SITE_URL}/og/${charity.id}.png" />
    <meta property="og:image:width" content="${W}" />
    <meta property="og:image:height" content="${H}" />
    <meta property="og:url" content="${SITE_URL}/share/${charity.id}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(title)}" />
    <meta name="twitter:description" content="${escape(description)}" />
    <meta name="twitter:image" content="${SITE_URL}/og/${charity.id}.png" />

    <!-- A crawler stops at the tags above; a person goes straight through. -->
    <script>
      location.replace(${JSON.stringify(appUrl)});
    </script>
  </head>
  <body>
    <p>Taking you to <a href="${appUrl}">${escape(charity.category)} on Ripple Good</a>…</p>
  </body>
</html>
`;
}

const ogDir = here("../public/og");
const shareDir = here("../public/share");
await mkdir(ogDir, { recursive: true });

for (const charity of charities) {
  await writeFile(`${ogDir}/${charity.id}.png`, render(charity));
  await mkdir(`${shareDir}/${charity.id}`, { recursive: true });
  await writeFile(`${shareDir}/${charity.id}/index.html`, sharePage(charity));

  // Retired ids get the same card and the same redirect. A link posted before
  // a rename keeps its preview image and still lands on the right cause; the
  // app then forwards the old slug to the current one. Regenerated every
  // build, so these can't rot into stale copies of an old design.
  for (const [oldId, currentId] of Object.entries(CAUSE_ALIASES)) {
    if (currentId !== charity.id) continue;
    await writeFile(`${ogDir}/${oldId}.png`, render(charity));
    await mkdir(`${shareDir}/${oldId}`, { recursive: true });
    await writeFile(`${shareDir}/${oldId}/index.html`, sharePage(charity));
  }
  console.log(`og+share: ${charity.id}`);
}

// The card any non-cause link falls back to (home, methodology, about).
await writeFile(
  `${ogDir}/default.png`,
  render({
    category: "Don't just donate",
    headline: "Make the biggest ripple.",
    name: "Ripple Good",
    evaluator: "GiveWell · ACE · Giving Green · Founders Pledge",
    costFigures: [],
  }),
);

console.log(
  `Rendered ${charities.length} cause cards + default, and ${charities.length} share pages (site: ${SITE_URL})`,
);
