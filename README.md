# Ripple Good

**Don't just donate. Make the biggest ripple.**

An effective-giving directory: the most effective charity within the cause you
already care about. Twelve causes, one evidence-backed pick each, with the
arithmetic shown underneath.

Built with React 18 + Vite, `react-router-dom` (real paths, every route
prerendered to a static file) and `lucide-react`.
No payment processing — every donate button is a plain outbound link, either to
the charity's own page or to Every.org.

---

## Run it locally

```bash
npm install
```

```bash
npm run dev
```

Vite prints a local URL (usually `http://localhost:5173`).

---

## Editing the content

**Every charity figure, URL, and outcome line lives in one file:
[`src/data/charities.js`](src/data/charities.js).** No component hard-codes a
number. To change a cost figure, a giving level, or a donate link, edit that
file and nothing else.

Each cause object:

| Field | What it is |
| --- | --- |
| `id` | URL slug — `/cause/<id>` |
| `category` | The cause label shown to readers |
| `icon` | A `lucide-react` icon name, mapped in [`src/lib/icons.js`](src/lib/icons.js) |
| `tagline` | One line for the home-page card |
| `name` | Charity name |
| `evaluator` / `evaluatorUrl` / `evaluatorNote` | Who made the call, and where to read it |
| `headline` / `subhead` | The big outcome statement on the cause page |
| `costFigures[]` | `{label, value, source}` — the math shown in "How we know" |
| `outcomeFramings[]` | Short outcome sentences reused in copy |
| `givingLevels[]` | `{amount, outcomeText, emphasis}` — mark one `emphasis: true` and it renders larger, in mist blue, with a "Suggested" badge |
| `custom` | `{perDollar, one, many, tooSmall, style}` — powers the custom-amount field and the giving plan. **`perDollar` must stay in sync with the cost figure it derives from** (both carry paired `VERIFY:` comments). **Omit it entirely** when there's no verified per-dollar figure: every live-outcome UI hides itself rather than inventing precision (see Lead Exposure) |
| `evidenceNotes` | `{whatTheyDo, method, caveats[]}` |
| `provisional` | Optional `true`. Renders an amber "provisional entry" banner on the cause page and a chip on its home card, saying the figures aren't yet checked. **Delete it only when you've actually verified the numbers** — never to make the banner go away |
| `donateUrl` | The charity's own donation page — always shown, as the no-intermediary route |
| `everyOrg` | `{slug, ein}` for a prefilled [Every.org](https://www.every.org/) link, or `null` for direct-only. **Never guess a slug** — load `every.org/<slug>`, confirm the organisation name and EIN match, and record the date in the comment. A wrong slug sends someone's money to the wrong charity |
| `lastVerified` | ISO date, **rendered publicly** — set it to the date you actually checked |

Adding another cause: append an object to `charities`, then add its icon to
the registry in `src/lib/icons.js`. The home grid, the cause page, the routing,
and the "other causes" strip all pick it up automatically.

### Re-verifying figures

Every number that can drift is tagged. Before each launch and each quarterly
refresh:

```bash
grep -rn "VERIFY:" src index.html vite.config.js
```

Work through the list, update the figures, then bump each cause's
`lastVerified` date — that date is displayed to readers inside the "How we
know" panel, so it should be true.

Two entries ship as `provisional: true` (**Deworming** and **Lead Exposure**);
their figures were drafted, not verified, and the site says so on the page
until you check them.

`lastVerified` also drives a freshness chip on every cause page that turns
**amber after six months** and **red after a year**, computed in the reader's
browser. That's deliberate: the methodology page promises a quarterly re-check,
and this makes the promise checkable by the person reading it. Regenerate the
share cards after any figure change:

```bash
npm run build:og
```

---

## Deploying to GitHub Pages

Push to `main`. That's the deploy.

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds the site
and publishes it to Pages on every push to `main` (or by hand from the Actions
tab). It takes about two minutes. One deploy runs at a time and a superseded
push waits its turn rather than cancelling — cancelling mid-deploy once left an
orphaned deployment on Pages' side that blocked every later one.

**Base path.** Worked out by the workflow, not pinned in a file: a repo named
`<user>.github.io` or one with a `public/CNAME` is served from `/`; any other
repo from `/<repo>/`. `vite.config.js` reads it from `SITE_BASE`, defaulting to
`/` for local builds. For a one-off local build at a different base:

```bash
SITE_BASE=/ripple/ npm run build
```

**Public site URL.** Also derived — from `public/CNAME` when present — so the
absolute URLs in Open Graph tags and share cards match where the site lands.

**Environment.** The three public `VITE_*` values are read from the repo's
**Settings → Secrets and variables → Actions → Variables** (not Secrets: they
ship in the bundle by design). Leave them unset and the site builds and runs
with no verified totals and no referral counting.

**Custom domain.** `public/CNAME` holds `ripple-good.org`. Point the apex `A`
records at GitHub Pages' IPs and add a `CNAME` for `www` → `<user>.github.io`
(the Pages settings page shows the current IPs), then enable **Enforce HTTPS**
once the certificate is issued. `public/.nojekyll` stops GitHub running Jekyll
over the output.

`npm run deploy` still exists — it pushes `dist/` to a `gh-pages` branch — but
it is not how this site ships and the Pages source is not set to that branch.

### Routing

The site uses real paths (`/cause/malaria-nets`), not a hash. GitHub Pages has
no rewrite rule, so the build writes a real `index.html` for every route
(`scripts/prerender.mjs`) — that's what makes per-page titles and Open Graph
tags visible to crawlers that don't run JavaScript. For any path that isn't
prerendered, Pages serves the build's `404.html`, which is the app shell:
React boots and routes it, so unknown cause slugs get the not-found page and
unlisted routes still work.

---

## Project layout

```
src/
  data/charities.js     all content and figures — the only file most edits touch
  lib/
    icons.js            string → lucide icon registry
    format.js           money, dates, link hosts
    usePageMeta.js      per-route <title> and meta description
    impact.js           reads the donation_totals() aggregate from Supabase
    donate.js           builds the outbound Every.org link
    donationRef.js      mints the per-gift attribution id
    freshness.js        how stale a cause's figures are
  components/
    Layout.jsx          header, footer, skip link
    Logo.jsx            the Ripple heart mark + wordmark
    CauseCard.jsx       home-grid card
    HomePanel.jsx       the About and Methodology sections on the home page
    GivingPanel.jsx     three outcome-phrased levels + outbound donate button
    EvidenceCard.jsx    the "How we know" disclosure
    VerifiedTotal.jsx   webhook-confirmed totals, hidden below ten gifts
    OtherCauses.jsx     cross-links at the foot of a cause page
    ScrollToTop.jsx     scroll restoration + in-page hash targets
    FreshnessBadge.jsx  amber/red staleness chip driven by lastVerified
    Wallpaper.jsx       the tiled doodle background
    HeroCurve.jsx       the swell where the hero meets the page
    Illustration.jsx    per-cause hero artwork
    Pictogram.jsx       draws a quantity as counted icons
  pages/
    Home.jsx  Cause.jsx  Methodology.jsx  About.jsx  NotFound.jsx  Thanks.jsx
    Split.jsx           /plan  — weight sliders → an exact-sum giving plan
  styles.css            design tokens + all styling
scripts/
  build-og-images.mjs   share cards + /share/<id> pages (runs on prebuild)
  fonts/                vendored Poppins (SIL OFL) for the card renderer
```

## Sharing

Every cause page is prerendered with its own title, description and 1200×630
card, so a pasted `/cause/<id>` link previews correctly on its own.
`scripts/build-og-images.mjs` also emits a static page per cause under
`/share/<id>` — an older mechanism from when the site used a hash router and
crawlers couldn't see past the `#`:

- **`ripple-good.org/share/global-health`** — a crawler reads that cause's
  card; a person is forwarded to `/cause/global-health`. Retired slugs are kept
  here so old shared links still resolve.
- **Nothing in the app links to these.** They're author-facing now, and could
  be deleted along with the share half of the build script if that stops being
  worth keeping.
- Set the domain at build time if it isn't ripple-good.org:

```bash
SITE_URL=https://ian.github.io/ripple npm run build
```

## Donation routing

Every cause page offers two outbound routes, and no payment is ever processed
here:

1. **Every.org** (primary, where available) — `lib/donate.js` builds
   `every.org/<slug>/donate?amount=…&frequency=ONCE|MONTHLY`, so the amount the
   reader chose is already filled in. Money goes to Every.org, which grants it
   on to the charity and issues the receipt.
2. **The charity's own page** (always shown) — no intermediary. The amount is
   carried across where the charity's platform accepts it on the URL
   (Fundraise Up, Donorbox, EveryAction, Classy — each verified against the
   live form, see `lib/donate.js`), and typed by the donor otherwise.

Two things to keep in mind if you change this:

- **Every.org suggests a contribution to itself at checkout, defaulting to 15%
  on top of the gift.** It's optional and the donor can zero it, but there is
  no URL parameter to preset it — which is why the panel says so *before* the
  reader clicks. Don't remove that sentence.
- Adding a route changes site-wide claims. The footer, the Methodology "What we
  don't do" list, and the FAQ all describe how money flows. Keep them true.

---

## Donations: Every.org + Supabase

Two independent halves. **The site works with neither of them configured** —
leave the env vars unset and it behaves exactly as it did before, with plain
outbound links and no totals shown.

### 1. The outbound half (no infrastructure)

`src/lib/donate.js` builds `every.org/<slug>/donate?amount=…&frequency=…`, plus,
on click:

| Parameter | Purpose |
| --- | --- |
| `partner_donation_id` | A UUID minted per click, so the webhook can be tied to this site |
| `partner_metadata` | Base64 `{cause, r}` — the cause page, and the `?ref=` tag if the visit arrived on one |
| `success_url` | Returns the donor to `/thanks`, carrying only the cause and amount |
| `webhook_token` | Public correlator, only sent when `VITE_EVERYORG_LINK_TOKEN` is set |

**We never set `require_share_info` and never send donor name or email.** Every.org
then reports the donation with those fields undefined — which is the design.

### 2. The verified half (Supabase)

Needed for one reason: **Every.org POSTs its partner webhook to a public HTTPS
endpoint, and GitHub Pages cannot accept a POST.** Supabase supplies exactly
three things and nothing more — hosting does not move.

```
supabase/
  migrations/0001_donation_events.sql   table + RLS + donation_totals()
  functions/everyorg-webhook/index.ts   the endpoint Every.org calls
```

- **`donation_events`** — one row per gift, primary key `charge_id` so a repeat
  delivery is a no-op. There are deliberately **no columns for donor name or
  email**; the schema is the enforcement.
- **RLS is on with no anon policies**, so the public key cannot read a single
  row. The only thing it may do is call `donation_totals()`, which returns
  per-cause aggregates.

#### Deploy

```bash
npx supabase login && npx supabase projects create ripple-good --region us-east-1
```

```bash
SUPABASE_PROJECT_REF=<ref> npm run db:link && npm run db:push
```

```bash
npx supabase secrets set EVERYORG_URL_SECRET=$(openssl rand -hex 32) && npm run fn:deploy
```

`--no-verify-jwt` is deliberate and required: Every.org is an outside caller
with no Supabase JWT. The endpoint is guarded by the URL secret instead.

#### The webhook URL to paste into Every.org

Register this at [every.org/developer](https://www.every.org/developer):

```
https://<project-ref>.supabase.co/functions/v1/everyorg-webhook?k=<EVERYORG_URL_SECRET>
```

**The `?k=` secret is the actual authentication.** Every.org documents no
signature header, and its `webhook_token` is a *donate-link query parameter*
that rides in the client URL — so it is public and cannot be trusted. Four
layers guard the endpoint: the URL secret, idempotency on `charge_id`, an
allow-list of nonprofit slugs, and bounds checks on the amount.

Verify after deploying — the first must return **401**, the second **200**:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST "https://<ref>.supabase.co/functions/v1/everyorg-webhook?k=wrong" -d '{}'
```

```bash
curl -s -X POST "https://<ref>.supabase.co/functions/v1/everyorg-webhook?k=$EVERYORG_URL_SECRET" -H 'content-type: application/json' -d '{"chargeId":"test-1","toNonprofit":{"slug":"againstmalaria","ein":"20-3069841"},"amount":"12.00","netAmount":"12.00","currency":"USD","frequency":"One-time","donationDate":"2026-01-01T00:00:00Z"}'
```

Send it twice: the second is a silent no-op, which is the idempotency working.

#### Known limits, stated plainly

- **Refunds and chargebacks are not in Every.org's documented payload.** If a
  gift is reversed we will not hear, so totals drift upward. Label any public
  figure narrowly — "donated through links on this site since <date>" — never
  as a clean accounting number.
- Only donations made through *our* links are counted. Someone who reads a cause
  page and gives on the charity's own site is invisible. The number undercounts,
  which is the safe direction.
- `/thanks` reads a query string the donor could edit, so it is **not proof**.
  It says what the gift did and stores nothing. The verified figures live in
  Postgres, put there by the webhook, and are the only ones ever displayed as
  totals.

## Privacy

No analytics, no tracking, no cookies, and no third-party script — the
Every.org route is a plain link, not an embed.

There **is** now a backend, and it is worth being precise about what it holds.
The Supabase database stores donation *events* — amount, cause, nonprofit,
timestamp — and **no donor identity of any kind**: no name, no email, no address,
no IP. The site never asks Every.org for those fields and the schema has no
column to put them in. Nothing links a donation row to a person.

The browser stores two things, both without identity. A short-lived
pending-donation record (`ripple.pending.v1`) — a random id, a cause slug and
an amount — written when you click donate and consumed by `/thanks`; it never
leaves the browser. And, for the length of one visit only, the `?ref=` tag a
visitor arrived on (`ripple.ref.v1`, in sessionStorage), so a gift can be
counted against the link that brought them.

That tag is the one addition to the backend since this section was written:
`referral_visits` holds a per-tag, per-day arrival count, and `donation_events`
gained a `referrer` column. A tag is a source label like `rice-run`, never a
person. There is still no name, email, address, IP or session id anywhere in
the schema.

## Brand

| Token | Value | Use |
| --- | --- | --- |
| Navy | `#0A1B33` | Text, dark bands, the wordmark |
| Blue | `#2472EC` | Brand blue: the heart gradient, accents, highlighted words |
| Blue 600 | `#1A60CF` | **Interactive** blue — buttons and links. Clears 4.5:1 with white text, which the brand blue alone does not |
| Sky | `#86C5F0` | Accents on dark bands |
| Mist | `#E3EFFB` | Soft fills, icon tiles, the emphasised giving level |
| Gray | `#F2F5F9` | Section backgrounds |

Typefaces: **Poppins** (400/500/600/700) for everything, plus **Dancing
Script** (700) used for exactly one word — the "Good" in the wordmark. Both load
from Google Fonts in `index.html`; Dancing Script is also vendored under
`scripts/fonts/` so the share-card renderer can draw the wordmark. All tokens
live at the top of `src/styles.css`.

The mark is a heart with two ripple bands cut out by an SVG mask, so the gaps
stay transparent on any background — see [`src/components/Logo.jsx`](src/components/Logo.jsx).
