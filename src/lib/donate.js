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
 * `require_share_info` is never set, we never pass first_name / last_name /
 * email, and `share_info=false` unticks the box Every.org would otherwise tick
 * for the donor.
 *
 * That makes sharing opt-in, not impossible: a donor who ticks it anyway sends
 * us their name and email on the webhook. So the guarantee cannot live in this
 * file. It lives at the other end — the function builds its row field by field
 * and never spreads the payload, and the table has no columns for any of it.
 * Either half alone would be fragile; together we learn that a gift happened
 * and which cause sent it, and keep nothing about who gave it.
 */
const EVERY_ORG = "https://www.every.org";

/**
 * The origin these links point back to.
 *
 * Read from the browser wherever there is one, so a preview deployment sends
 * donors back to itself rather than to production. The fallback exists because
 * these run during prerender too, in Node, where there is no window — and a
 * bare `window.location` there would crash the whole build.
 */
function siteOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return import.meta.env.VITE_SITE_ORIGIN || "https://ripple-good.org";
}

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
    // Every.org shows "Your contact info will be shared with Ripple Good" and
    // ticks the box for you. We can't remove the offer, but we can stop it
    // being the default: verified against the live modal, this flips it to
    // unticked, so a donor opts in rather than out.
    //
    // It stays honest either way — the webhook drops firstName, lastName and
    // email on arrival and the table has no columns for them — but a ticked
    // box contradicts what the cause page just told the reader, at the exact
    // moment they're deciding to trust it.
    share_info: "false",
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

  // Where cancelling goes. This was dropped once as broken, on a test done
  // while it was still a "/#/cause/..." URL — the same hash that success_url
  // was losing. Hashless, it has a chance the first version never had, and
  // matters more now that giving happens in the tab the reader is already in:
  // without it, cancelling leaves them on Every.org with nothing to close.
  if (exitUrl) params.set("exit_url", exitUrl);

  return `${EVERY_ORG}/${charity.everyOrg.slug}/donate?${params.toString()}`;
}


/**
 * The absolute /thanks URL for this deployment, wherever it is hosted.
 *
 * Deliberately hashless — "/thanks?…", not "/#/thanks?…". Truncating a
 * redirect target at the # is a common bug, and Every.org's `exit_url` already
 * doesn't work, so this is not a hypothetical failure mode for their redirects.
 * A hashless path can't be truncated that way: GitHub Pages serves 404.html for
 * it, which puts the hash back and preserves the query string. Verified against
 * the live site.
 *
 * The donation itself is unaffected either way — this only decides whether the
 * donor lands on the thank-you page or on the home page.
 */
export function thanksUrl({ causeId, amount, monthly }) {
  const origin = siteOrigin();
  const base = import.meta.env.BASE_URL || "/";
  const q = new URLSearchParams({
    cause: causeId,
    amount: String(amount),
    ...(monthly ? { monthly: "1" } : {}),
  });
  return `${origin}${base}thanks?${q.toString()}`;
}

/**
 * The absolute cause-page URL, for exit_url. Hashless for the same reason
 * thanksUrl is: 404.html puts the hash back, and a redirect target that has
 * no "#" in it cannot be truncated at one. Verified against the live site.
 */
export function causeUrl(causeId) {
  const origin = siteOrigin();
  const base = import.meta.env.BASE_URL || "/";
  return `${origin}${base}cause/${causeId}`;
}
