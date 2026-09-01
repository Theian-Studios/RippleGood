/**
 * Every.org partner webhook receiver.
 *
 * Every.org POSTs here when a donation completes through a link this site
 * generated. GitHub Pages serves static files and cannot accept a POST, which
 * is the whole reason this function exists.
 *
 * ── How this endpoint is secured, and why it is built this way ──────────────
 *
 * Every.org documents no signature header, and its `webhook_token` is a
 * *donate-link query parameter* — it rides in the client-side URL, so anyone
 * who inspects a donate button can read it. It is therefore NOT a secret and
 * cannot be the authentication. Four layers instead:
 *
 *   1. A secret in the endpoint URL (`?k=`). This is the real credential. It
 *      exists only in Every.org's developer dashboard and in this function's
 *      environment — never in the frontend bundle, never in a donate link.
 *   2. Idempotency on Every.org's chargeId. A replayed or duplicated delivery
 *      collides on the primary key and changes nothing, so a captured request
 *      cannot be replayed to inflate a total.
 *   3. An allow-list of nonprofit slugs. A payload naming an organisation this
 *      site doesn't recommend is rejected outright.
 *   4. Bounds checks on the amount, so a malformed or hostile payload cannot
 *      write an absurd figure into a public total.
 *
 * We still treat the resulting numbers as indicative rather than as an
 * accounting record — see the note on refunds below.
 *
 * ── Refunds ────────────────────────────────────────────────────────────────
 * Every.org's documented payload has no refund or chargeback event. If a
 * donation is reversed we will not hear about it, so totals drift upward over
 * time and are labelled narrowly wherever they are shown.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendDonationAlert } from "./notify.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const URL_SECRET = Deno.env.get("EVERYORG_URL_SECRET") ?? "";
const LINK_TOKEN = Deno.env.get("EVERYORG_WEBHOOK_TOKEN") ?? "";

/** Slugs this site actually routes to. Keep in sync with src/data/charities.js. */
const ALLOWED_SLUGS = new Set([
  "againstmalaria",
  "hki",
  "malaria-consortium",
  "thehumaneleague",
  "givedirectly",
  "evidence-action",
  "leep",
]);

/** Nobody donates ten million dollars through a static site by accident. */
const MAX_CENTS = 10_000_000_00;
const MAX_BODY_BYTES = 32_000;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

/** "42.00" → 4200. Never parse money into a float and keep it there. */
function toCents(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  const cents = Math.round(n * 100);
  return cents > MAX_CENTS ? null : cents;
}

/** partner_metadata arrives base64-encoded JSON, or not at all. */
function decodeMetadata(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  try {
    if (typeof raw === "object") return raw as Record<string, unknown>;
    return JSON.parse(atob(String(raw)));
  } catch {
    return {}; // malformed metadata loses the attribution, not the donation
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  // Layer 1: the secret that actually guards this endpoint.
  const provided = new URL(req.url).searchParams.get("k") ?? "";
  if (!URL_SECRET || provided !== URL_SECRET) {
    return json(401, { error: "unauthorized" });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: "payload_too_large" });

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const chargeId = payload.chargeId;
  if (typeof chargeId !== "string" || !chargeId) {
    return json(400, { error: "missing_charge_id" });
  }

  const nonprofit = (payload.toNonprofit ?? {}) as Record<string, unknown>;
  const slug = String(nonprofit.slug ?? "");
  if (!ALLOWED_SLUGS.has(slug)) {
    // Not one of ours. Acknowledge so Every.org stops retrying, but store nothing.
    return json(202, { ignored: "unknown_nonprofit" });
  }

  const amountCents = toCents(payload.amount);
  if (amountCents === null) return json(400, { error: "invalid_amount" });

  const metadata = decodeMetadata(payload.partnerMetadata);

  // Layer 2 (weak, and logged as such): the link token. Public by construction,
  // so a mismatch is a signal worth noting rather than grounds to reject.
  if (LINK_TOKEN && metadata.t && metadata.t !== LINK_TOKEN) {
    console.warn("link token mismatch", { chargeId });
  }

  const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // Deliberately constructed field by field. Spreading the payload would carry
  // firstName / lastName / email straight into the database, which is exactly
  // what this design refuses to do.
  const row = {
    charge_id: chargeId,
    cause_id: typeof metadata.cause === "string" ? metadata.cause : null,
    nonprofit_slug: slug,
    nonprofit_ein: typeof nonprofit.ein === "string" ? nonprofit.ein : null,
    amount_cents: amountCents,
    net_cents: toCents(payload.netAmount),
    currency: typeof payload.currency === "string" ? payload.currency : "USD",
    frequency: typeof payload.frequency === "string" ? payload.frequency : "One-time",
    payment_method:
      typeof payload.paymentMethod === "string" ? payload.paymentMethod : null,
    partner_donation_id:
      typeof payload.partnerDonationId === "string" ? payload.partnerDonationId : null,
    donated_at:
      typeof payload.donationDate === "string"
        ? payload.donationDate
        : new Date().toISOString(),
  };

  // Layer 3: idempotency. A repeat delivery of the same charge is a no-op.
  //
  // A plain insert, not an upsert, so that "was this the first delivery?" is
  // answered by Postgres itself: 23505 is unique_violation on the charge_id
  // primary key, and it is the one signal here that cannot drift. The obvious
  // alternative — upsert(ignoreDuplicates).select() and count the rows — hangs
  // the alert on how PostgREST chooses to represent ON CONFLICT DO NOTHING,
  // and getting that wrong fails silently in both directions: no alerts ever,
  // or one alert per Every.org retry.
  const { error } = await db.from("donation_events").insert(row);

  const isDuplicate = error?.code === "23505";

  if (error && !isDuplicate) {
    // 5xx so Every.org retries — a dropped donation is worse than a duplicate,
    // and duplicates cannot hurt us.
    console.error("insert failed", error);
    return json(500, { error: "storage_failed" });
  }

  const isNew = !isDuplicate;

  if (isNew) {
    // Built from the row we just stored, not from the payload, so the alert
    // cannot carry a field the database refused to hold.
    const alert = sendDonationAlert({
      amountCents: row.amount_cents,
      causeId: row.cause_id,
      nonprofitSlug: row.nonprofit_slug,
      frequency: row.frequency,
      donatedAt: row.donated_at,
    });

    // Acknowledge Every.org now and deliver the alert after the response.
    // waitUntil keeps the isolate alive for it; awaiting instead would put a
    // third-party API on the critical path of recording a donation.
    const runtime = (globalThis as { EdgeRuntime?: { waitUntil(p: Promise<unknown>): void } })
      .EdgeRuntime;
    if (runtime?.waitUntil) runtime.waitUntil(alert);
    else await alert;
  }

  return json(200, { ok: true, recorded: isNew });
});
