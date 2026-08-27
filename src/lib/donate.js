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

/**
 * Tints Every.org's modal to our interactive blue, so the handoff doesn't look
 * like it landed on an unrelated site. Bare hex, no "#": a literal # would end
 * the query string, and while URLSearchParams escapes it to %23, there is no
 * documented promise that Every.org unescapes it. The AA-safe blue, matching
 * --blue-ink in styles.css.
 *
 * Verified against the live modal rather than the docs, which don't give the
 * format: with this parameter set, 35 elements of Every.org's own UI render in
 * rgb(26, 96, 207). Bare hex is right; don't "fix" it by adding the #.
 */
const THEME_COLOR = "1A60CF";

/* ── Two documented parameters we deliberately do NOT send ──────────────────
 *
 * `suggestedAmounts` renders as +6/+12/+60 buttons under the amount field —
 * but only when `amount` is absent. We always prefill an amount, because the
 * whole cause page is about choosing a result first, so Every.org skips the
 * amount step and those buttons can never appear. Confirmed both ways against
 * the live modal.
 *
 * `no_exit` is documented as hiding the background behind the donation modal.
 * Sending it changed nothing we could measure on the /donate path — identical
 * scroll height, identical text, same nonprofit profile behind the modal, with
 * and without. The /donate deep link already opens the modal on its own.
 *
 * Both are omitted because they do nothing here, not because they're unknown.
 */

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
export function everyOrgUrl(
  charity,
  { amount, monthly, ref, returnUrl, exitUrl } = {},
) {
  if (!charity.everyOrg) return null;

  const params = new URLSearchParams({
    amount: String(amount),
    frequency: monthly ? "MONTHLY" : "ONCE",
    theme_color: THEME_COLOR,
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

  // Where the exit button goes, if the modal shows one — a text and aria-label
  // search of the live page found no close control, so this may never fire.
  // Kept because it costs one parameter and the alternative, if an exit does
  // exist, is dropping a reader who was still deciding at the site root.
  if (exitUrl) params.set("exit_url", exitUrl);

  return `${EVERY_ORG}/${charity.everyOrg.slug}/donate?${params.toString()}`;
}

/** The absolute cause-page URL for this deployment, for exit_url. */
export function causeUrl(causeId) {
  const { origin } = window.location;
  const base = import.meta.env.BASE_URL || "/";
  return `${origin}${base}#/cause/${causeId}`;
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
