/** $6 and $1,000 — no trailing cents, since every giving level is a whole dollar. */
export function money(amount) {
  return `$${amount.toLocaleString("en-US")}`;
}

/** "2026-08-14" → "August 14, 2026". Parsed as UTC so the date can't slip a day. */
export function longDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** againstmalaria.com — the bare host, for showing where a link actually goes. */
export function displayHost(url) {
  return new URL(url).hostname.replace(/^www\./, "");
}

/**
 * A typed dollar amount → one outcome sentence, from a charity's `custom`
 * config. Whole units only — "~4 nets", never "~4.17 nets" — because the "~"
 * carries the honesty and false precision would undercut it. Floor, not round:
 * $3 is half a net, and claiming "one net" for it is the overstatement this
 * site exists to avoid. Understating by a fraction is the safe direction.
 * Amounts below one whole unit get the charity's `tooSmall` line, not "~0".
 */
/**
 * Whole units a gift buys — the one place the floor rule lives, so the
 * sentence and the pictogram can never disagree about the count.
 */
export function unitsFor(amount, custom) {
  if (!custom) return 0;
  return Math.floor(amount * custom.perDollar);
}

export function approxOutcome(amount, custom) {
  if (!custom) return null;
  const units = unitsFor(amount, custom);
  if (units < 1) return custom.tooSmall || null;

  const shown =
    custom.style === "money"
      ? `$${units.toLocaleString("en-US")}`
      : units.toLocaleString("en-US");
  const template = units === 1 && custom.one ? custom.one : custom.many;
  return template.replace("{n}", shown);
}
