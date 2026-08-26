/**
 * Reading verified donation totals back out of Supabase.
 *
 * Aggregates only. The `donation_totals()` function is the single thing the
 * anon key is allowed to call — row-level security denies anon every row of
 * donation_events, so there is nothing here that could leak an individual gift
 * even if the key were pasted in public (it is public: it ships in the bundle,
 * as Supabase intends).
 *
 * Plain fetch rather than @supabase/supabase-js: one RPC call does not justify
 * shipping the client library to every visitor.
 *
 * Everything degrades to null when the env vars are absent, so the site builds
 * and runs perfectly well with no Supabase project attached — which is how it
 * runs today, and how a fork of it should run.
 */
const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const impactConfigured = Boolean(URL_BASE && ANON_KEY);

/**
 * → { totals: {causeId: {gifts, amountCents}}, allGifts, allCents }
 * → null when unconfigured or unreachable. Callers must render without it.
 */
export async function fetchDonationTotals({ signal } = {}) {
  if (!impactConfigured) return null;

  try {
    const res = await fetch(`${URL_BASE}/rest/v1/rpc/donation_totals`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: ANON_KEY,
        authorization: `Bearer ${ANON_KEY}`,
      },
      body: "{}",
      signal,
    });
    if (!res.ok) return null;

    const rows = await res.json();
    if (!Array.isArray(rows)) return null;

    const totals = {};
    let allGifts = 0;
    let allCents = 0;

    for (const row of rows) {
      const gifts = Number(row.gifts) || 0;
      const cents = Number(row.amount_cents) || 0;
      allGifts += gifts;
      allCents += cents;
      if (row.cause_id) totals[row.cause_id] = { gifts, amountCents: cents };
    }

    return { totals, allGifts, allCents };
  } catch {
    // Offline, blocked, aborted — the page simply doesn't show a total.
    return null;
  }
}
