# Ripple Good

**Don't just donate. Make the biggest ripple.**

An effective-giving directory: the most effective charity within the cause you
already care about. Twelve causes, one evidence-backed pick each, with the
arithmetic shown underneath.

Built with React 18 + Vite, `react-router-dom` (HashRouter) and `lucide-react`.
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
| `id` | URL slug — `/#/cause/<id>` |
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

### 1. Set the base path

[`vite.config.js`](vite.config.js) has a `BASE` constant at the top:

```js
const BASE = "/ripple/"; // must match the GitHub repo name, or be "/" on ripple-good.org
```

- **Project page** (`https://<user>.github.io/ripple/`) → leave it as `/ripple/`,
  renamed to match your repo if the repo isn't called `ripple`.
- **Custom domain** (`ripple-good.org`) or a `<user>.github.io` repo → set it to `"/"`.
  A subpath prefix on a custom domain breaks every asset.

One-off override without editing the file:

```bash
SITE_BASE=/ npm run build
```

### 2. Push the repo

```bash
git init && git add -A && git commit -m "Ripple Good" && git branch -M main
```

```bash
git remote add origin https://github.com/<user>/ripple.git && git push -u origin main
```

### 3. Deploy

```bash
npm run deploy
```

That runs `npm run build` (via `predeploy`) and pushes `dist/` to the
`gh-pages` branch. Then in the repo on GitHub: **Settings → Pages → Source →
Deploy from a branch → `gh-pages` / `(root)`**. First deploy takes a minute or
two to appear.

Redeploying later is just `npm run deploy` again.

### 4. Custom domain (ripple-good.org)

1. Set `BASE = "/"` in `vite.config.js`.
2. Create `public/CNAME` containing one line: `ripple-good.org`
3. At your DNS provider, point the apex `A` records at GitHub Pages'
   IPs and add a `CNAME` for `www` → `<user>.github.io`. (GitHub's Pages
   settings page shows the current IPs — use those, they change rarely but do
   change.)
4. `npm run deploy`, then enable **Enforce HTTPS** in Settings → Pages once the
   certificate is issued.

`public/.nojekyll` is already committed, which stops GitHub from running Jekyll
over the build output.

### Why HashRouter?

GitHub Pages serves static files with no rewrite rule, so a hard refresh on
`/cause/climate` would 404. The hash keeps every route on `index.html`. URLs
look like `ripple-good.org/#/cause/climate`.

`public/404.html` covers the remaining gap: if someone shares a hashless link
(`ripple-good.org/cause/climate`), GitHub serves the 404 page, whose script forwards
them to the matching `/#/` route — on both project pages and custom domains.

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

The site is a HashRouter SPA, so crawlers never see past the `#` and can't read
per-route meta tags. `scripts/build-og-images.mjs` solves that by emitting a
real static page per cause:

- **Share `ripple-good.org/share/global-health`** — a crawler reads that cause's own
  title, description, and 1200×630 card; a person is forwarded straight to
  `#/cause/global-health`.
- **Nothing in the app links to these.** The "Share this cause" button was
  removed, so `/share/<id>` is an author-facing URL now: paste it when you want
  a per-cause preview, rather than the hash route, which previews identically
  for all twelve causes.
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
2. **The charity's own page** (always shown) — no intermediary, but the amount
   can't be carried across.

Three things to keep in mind if you change this:

- **Every.org suggests a contribution to itself at checkout, defaulting to 15%
  on top of the gift.** It's optional and the donor can zero it, but there is
  no URL parameter to preset it — which is why the panel says so *before* the
  reader clicks. Don't remove that sentence.
- **Climate is deliberately direct-only.** The entity on Every.org is "Giving
  Green Research Group Inc", which funds their research; our pick is the Giving
  Green *Fund*, which regrants to top climate nonprofits. Different products.
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
| `partner_metadata` | Base64 `{cause}` — how a donation is attributed to a cause page |
| `success_url` | Returns the donor to `/thanks` — hashless, so the redirect cannot be truncated at the `#`; 404.html restores the route |
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

The only thing the browser stores is a short-lived pending-donation record
(`ripple.pending.v1`) — a random id, a cause slug and an amount — written when
you click donate and consumed by `/thanks`. It never leaves the browser and is
never joined to the database.

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
