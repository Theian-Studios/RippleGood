/**
 * Reading the referral and donation numbers back for the private dashboard.
 *
 * Both calls are the same aggregate RPCs the site already exposes to the anon
 * key. Nothing here reaches a donor: the schema has no columns for one.
 *
 * referral_report() arrives with migration 0003. Until that is pushed the RPC
 * 404s, which is a state worth showing plainly rather than rendering an empty
 * table that looks like "nobody clicked".
 */
const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const statsConfigured = Boolean(URL_BASE && ANON_KEY);

async function rpc(name) {
  const res = await fetch(`${URL_BASE}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: ANON_KEY,
      authorization: `Bearer ${ANON_KEY}`,
    },
    body: "{}",
  });
  if (res.status === 404) return { missing: true, rows: [] };
  if (!res.ok) return { error: `HTTP ${res.status}`, rows: [] };
  const rows = await res.json();
  return { rows: Array.isArray(rows) ? rows : [] };
}

/** → { sources, causes, sourcesMissing, error } */
export async function fetchInsideStats() {
  if (!statsConfigured) return { error: "No Supabase project configured.", sources: [], causes: [] };

  const [referral, donations] = await Promise.all([
    rpc("referral_report"),
    rpc("donation_totals"),
  ]);

  return {
    sourcesMissing: Boolean(referral.missing),
    error: referral.error || donations.error || null,
    sources: referral.rows.map((r) => ({
      tag: String(r.tag ?? "—"),
      visits: Number(r.visits) || 0,
      gifts: Number(r.gifts) || 0,
      cents: Number(r.amount_cents) || 0,
    })),
    causes: donations.rows.map((r) => ({
      causeId: r.cause_id ? String(r.cause_id) : null,
      gifts: Number(r.gifts) || 0,
      cents: Number(r.amount_cents) || 0,
    })),
  };
}
