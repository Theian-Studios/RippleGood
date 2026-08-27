/**
 * Building the outbound donation link.
 *
 * Two routes, and the reader picks:
 *
 *   1. Every.org — a nonprofit donation processor. We can pass the amount and
 *      the frequency, so the figure the reader chose here is already filled in
 *      when they arrive. Money goes to Every.org, which grants it on to the
 *      charity; the tax receipt comes from Every.org.
 *   2. The charity's own donation page — no intermediary at all, but no way to
 *      carry an amount across, because each charity's form differs and none of
 *      them promise a stable parameter.
 *
 * We never process a payment either way, and take nothing from either.
 *
 * Note there is no parameter to suppress the contribution Every.org suggests
 * to itself at checkout (it defaults to 15% on top). The donor can set it to
 * zero, so we say so before they click rather than letting the total surprise
 * them — see GivingPanel.
 *
 * ── On what we deliberately do NOT ask for ─────────────────────────────────
 * `require_share_info` is never set, and we never pass first_name / last_name /
 * email. Every.org will then send us a donation with those fields undefined,
 * which is the point: the webhook has nothing personal to drop and the database
 * has nowhere to put it. We learn that a gift happened and which cause sent it,
 * and nothing about who gave it.
 */
const EVERY_ORG = "https://www.every.org";

/** Base64 for a small ASCII JSON object, safe in a URL parameter. */
function encodeMetadata(obj) {
  try {
    return btoa(JSON.stringify(obj));
  } catch {
    return null;
  }
}

/**
 * Prefilled Every.org link, or null for causes routed direct-only.
 *
 * `ref` is the partner donation id minted by donationRef.newDonationRef() — pass
 * it when you want this donation attributable to this site; omit it and the
 * link still works, just anonymously to us as well as to Every.org.
 */
export function everyOrgUrl(charity, { amount, monthly, ref, returnUrl } = {}) {
  if (!charity.everyOrg) return null;

  const params = new URLSearchParams({
    amount: String(amount),
    frequency: monthly ? "MONTHLY" : "ONCE",
  });

  if (ref) {
    params.set("partner_donation_id", ref);

    // Comes back on the webhook, and is how a donation is attributed to a
    // cause. `t` is the link token: public by construction (it rides in this
    // URL), so it is a correlator we log, never a credential we trust.
    const meta = encodeMetadata({
      cause: charity.id,
      t: import.meta.env.VITE_EVERYORG_LINK_TOKEN || undefined,
    });
    if (meta) params.set("partner_metadata", meta);

    const token = import.meta.env.VITE_EVERYORG_LINK_TOKEN;
    if (token) params.set("webhook_token", token);
  }

  // Where Every.org sends the donor afterwards. Absolute, and carrying only
  // the cause and the amount — enough for a thank-you page, nothing private.
  if (returnUrl) params.set("success_url", returnUrl);

  return `${EVERY_ORG}/${charity.everyOrg.slug}/donate?${params.toString()}`;
}

/** The absolute /thanks URL for this deployment, wherever it is hosted. */
export function thanksUrl({ causeId, amount, monthly }) {
  const { origin } = window.location;
  const base = import.meta.env.BASE_URL || "/";
  const q = new URLSearchParams({
    cause: causeId,
    amount: String(amount),
    ...(monthly ? { monthly: "1" } : {}),
  });
  return `${origin}${base}#/thanks?${q.toString()}`;
}
