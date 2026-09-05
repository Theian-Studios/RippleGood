/**
 * Where a visit came from, when someone arrives on a link we handed out.
 *
 *   https://ripple-good.org/?ref=garage-sale-center
 *
 * The tag rides into Every.org on `partner_metadata` and comes back on the
 * donation webhook, so a gift can be counted against the place that sent the
 * donor without anyone having to identify the donor. It is a source label, not
 * a person: no id, no fingerprint, nothing that survives the tab.
 *
 * ── What this cannot see ────────────────────────────────────────────────────
 * Only donations routed through Every.org fire a webhook. Two causes are
 * direct-only (safe water and syphilis in pregnancy), and every cause page also
 * offers the charity's own donation page as a second route. Gifts made either
 * way reach the charity and are invisible here. A referral total is therefore a
 * floor, never a total, and should be read as "at least this much".
 */

/**
 * Deliberately strict. This string ends up in a URL we build, in metadata a
 * third party stores, and in a database column — so it is a short slug or it
 * is nothing at all. Anything else is dropped rather than sanitised, because a
 * half-cleaned tag is a tag that quietly attributes to the wrong place.
 */
const VALID = /^[a-z0-9][a-z0-9_-]{0,31}$/;

const KEY = "ripple.ref.v1";

/**
 * sessionStorage, not localStorage: this answers "how did you get here", which
 * is true of a visit, not of a browser. In localStorage the tag would still be
 * sitting there in March, quietly crediting a January link for a gift someone
 * made after typing the address themselves.
 */
function store() {
  try {
    return window.sessionStorage;
  } catch {
    return null; // private mode, storage disabled — referral just goes uncounted
  }
}

/**
 * Read `?ref=` off the current URL and remember it for the rest of the visit.
 * Safe to call on every route change: a page without the parameter leaves an
 * already-captured tag alone, so it survives the walk from the home page to a
 * cause page to the donate button.
 */
export function captureReferral(search) {
  const s = store();
  if (!s) return null;
  try {
    const raw = new URLSearchParams(search || "").get("ref");
    if (raw) {
      const tag = raw.trim().toLowerCase();
      // First one wins. If a visitor bounces through a second tagged link
      // mid-visit, the source that actually brought them here is the first.
      if (VALID.test(tag) && !s.getItem(KEY)) s.setItem(KEY, tag);
    }
    return s.getItem(KEY);
  } catch {
    return null;
  }
}

/** The tag for this visit, or null. */
export function getReferral() {
  const s = store();
  if (!s) return null;
  try {
    const tag = s.getItem(KEY);
    return tag && VALID.test(tag) ? tag : null;
  } catch {
    return null;
  }
}
