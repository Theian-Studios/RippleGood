/**
 * How stale a cause's figures are, computed in the reader's browser rather
 * than baked in at build time — so a site left untouched for a year says so
 * out loud instead of quietly presenting old numbers as current.
 *
 * This is deliberately uncomfortable: the methodology page promises a
 * quarterly re-check, and this is what makes that promise visible.
 */
const MONTH = 1000 * 60 * 60 * 24 * 30.44;

export const FRESHNESS = {
  fresh: { tone: "fresh", label: "Checked" },
  aging: { tone: "aging", label: "Checked" },
  stale: { tone: "stale", label: "Last checked" },
};

/** "2026-08-14" → { tone, label, monthsOld } */
export function freshnessOf(iso, now = Date.now()) {
  const [y, m, d] = iso.split("-").map(Number);
  const monthsOld = (now - Date.UTC(y, m - 1, d)) / MONTH;

  const state =
    monthsOld > 12 ? FRESHNESS.stale : monthsOld > 6 ? FRESHNESS.aging : FRESHNESS.fresh;

  return { ...state, monthsOld: Math.max(0, Math.round(monthsOld)) };
}

/** "Aug 2026" — a month is precise enough for a freshness chip. */
export function monthYear(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
