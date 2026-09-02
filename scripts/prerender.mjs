/**
 * Writes a real index.html for every route, after `vite build`.
 *
 * A client-rendered SPA hands every URL the same empty shell and the same
 * default meta tags. Titles and descriptions set from JavaScript are invisible
 * to link scrapers, which never run it — so sharing a cause page produced the
 * generic card, and per-cause OG images sat at /share/<id> where nothing linked
 * to them.
 *
 * Each route now gets its own file with its own <head>: title, description,
 * canonical, and the cause's own Open Graph image. GitHub Pages serves those
 * directly, which is also what makes BrowserRouter safe.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = (p) => resolve(dirname(fileURLToPath(import.meta.url)), p);
const DIST = here("../dist");
const SITE = process.env.SITE_URL || "https://ripple-good.org";
const BASE = process.env.SITE_BASE || "/";

const { render, charities } = await import(here("../dist-ssr/entry-server.js"));

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** One entry per prerendered route. `og` is a filename in /og. */
const routes = [
  {
    path: "/",
    title: "Ripple Good — make the biggest ripple.",
    description:
      "One evidence-backed charity per cause, with the cost figures and the evaluator behind every claim. Start from the cause you already care about.",
    og: "default.png",
  },
  {
    path: "/about",
    title: "Where you give matters more than how much — Ripple Good",
    description:
      "Ripple Good exists to close the gap between wanting to help and knowing where to send it. One evidence-backed pick per cause, with the math shown.",
    og: "default.png",
  },
  {
    path: "/methodology",
    title: "How we pick, and what we don't do — Ripple Good",
    description:
      "How Ripple Good picks one charity per cause, which evaluators we rely on, what our dollar figures do and don't mean, and how often we re-check them.",
    og: "default.png",
  },
  {
    path: "/plan",
    title: "Split it across everything you care about — Ripple Good",
    description:
      "Build a giving plan across several causes at once, with what each share buys shown as you go.",
    og: "default.png",
  },
  {
    path: "/thanks",
    title: "Thank you — Ripple Good",
    description: "Where Every.org returns a donor after a completed gift.",
    og: "default.png",
    noindex: true,
  },
  ...charities.map((c) => ({
    path: `/cause/${c.id}`,
    // The query first, the organisation second. Nobody searches for a filing
    // label, and "Against Malaria Foundation · Global Health" was one.
    title: `${c.seoTitle}: ${c.name} — Ripple Good`,
    description: `${c.headline} ${c.subhead}`,
    og: `${c.id}.png`,
  })),
];

const shell = await readFile(`${DIST}/index.html`, "utf8");

/**
 * Everything we regenerate per route, stripped from the shell first.
 *
 * Patching these in place with a regex looked simpler until you notice the
 * shell writes them across several lines, and has no canonical link at all.
 * Removing the whole set and emitting a fresh block is both shorter and the
 * only version that can't silently half-match.
 */
const MANAGED = [
  'name="description"',
  'property="og:type"',
  'property="og:site_name"',
  'property="og:title"',
  'property="og:description"',
  'property="og:url"',
  'property="og:image"',
  'property="og:image:width"',
  'property="og:image:height"',
  'name="twitter:card"',
  'name="twitter:image"',
];

function stripManaged(html) {
  let out = html.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
  out = out.replace(/<link\s[^>]*rel="canonical"[^>]*>\s*/gi, "");
  // Meta tags in this shell span multiple lines, so match the whole element
  // and test its attributes rather than assuming they sit on one.
  out = out.replace(/<meta\b[\s\S]*?>\s*/gi, (tag) =>
    MANAGED.some((attr) => tag.includes(attr)) ? "" : tag,
  );
  return out;
}

function headBlock({ title, description, url, ogUrl, noindex }) {
  return `<title>${esc(title)}</title>
    <link rel="canonical" href="${esc(url)}" />
    <meta name="description" content="${esc(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Ripple Good" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(ogUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${esc(ogUrl)}" />
${noindex ? '    <meta name="robots" content="noindex" />\n' : ""}`;
}

const stripped = stripManaged(shell);
const prefix = BASE.replace(/\/$/, "");

let written = 0;
for (const route of routes) {
  const app = render(route.path);
  const url = `${SITE}${prefix}${route.path}`;
  const ogUrl = `${SITE}${prefix}/og/${route.og}`;

  const html = stripped
    .replace("</head>", `  ${headBlock({ ...route, url, ogUrl })}  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${app}</div>`);

  const outDir = route.path === "/" ? DIST : `${DIST}${route.path}`;
  await mkdir(outDir, { recursive: true });
  await writeFile(`${outDir}/index.html`, html);
  written += 1;
}

// GitHub Pages serves this for any path with no file behind it. It has to boot
// the app rather than dead-end: BrowserRouter reads the real pathname, so a
// mistyped URL renders NotFound, and a route added later still works before
// anyone remembers to add it to the list above.
const fallback = stripped
  .replace("</head>", `  ${headBlock({
    title: "Ripple Good — make the biggest ripple.",
    description: "One evidence-backed charity per cause.",
    url: `${SITE}${prefix}/`,
    ogUrl: `${SITE}${prefix}/og/default.png`,
    noindex: true,
  })}  </head>`);
await writeFile(`${DIST}/404.html`, fallback);

console.log(`prerendered ${written} routes + 404 fallback`);
