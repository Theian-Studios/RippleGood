/**
 * The reference that ties a click on this site to a donation Every.org later
 * tells us about.
 *
 * We mint an id per click, send it as `partner_donation_id`, and get it back
 * on the webhook. It carries no personal data — a random id and a cause slug —
 * so it can be logged and stored without any of the consequences that come
 * with holding donor identity.
 *
 * The pending record is kept in this browser only, so the /thanks page can say
 * what the gift did without us having to know who gave it.
 */
const PENDING_KEY = "ripple.pending.v1";

function newId() {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `rg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Remember what was just clicked, so the return trip can describe it. */
export function startDonation({ causeId, amount, monthly }) {
  const id = newId();
  try {
    window.localStorage.setItem(
      PENDING_KEY,
      JSON.stringify({ id, causeId, amount, monthly, at: Date.now() }),
    );
  } catch {
    // Private mode, storage disabled: the donation still works, the thank-you
    // page just falls back to the query string.
  }
  return id;
}

/** The most recent pending donation, if it's fresh enough to still be the one. */
export function readPending(maxAgeMs = 1000 * 60 * 60 * 6) {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw);
    if (!pending?.id || Date.now() - pending.at > maxAgeMs) return null;
    return pending;
  } catch {
    return null;
  }
}

export function clearPending() {
  try {
    window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* nothing to clear */
  }
}
