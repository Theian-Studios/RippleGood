import { Link } from "react-router-dom";
import { charities } from "../data/charities.js";
import { approxOutcome, money } from "../lib/format.js";
import { iconFor } from "../lib/icons.jsx";

/**
 * A sample rather than the whole list. Nine rows sitting under the gift turned
 * the cause page into a comparison table, which is the opposite of what it is
 * for — three is enough to show the figure means something different in each
 * place without inviting a ranking out of it.
 *
 * The pick is derived from the cause you are on rather than from Math.random,
 * for two reasons: it must not reshuffle under the reader while they type an
 * amount, and it must not differ between the prerendered HTML and the render
 * that replaces it. Striding through the list rather than taking the first
 * three keeps the sample spread across cause areas.
 */
function sampleOf(rows, limit, seedId) {
  if (!limit || rows.length <= limit) return rows;
  // A multiply-accumulate hash rather than a sum of char codes: summing made
  // ids of similar letters collide, and four causes ended up showing the
  // identical three neighbours.
  const seed = [...seedId].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const start = seed % rows.length;
  // floor(len/limit) >= 1 here, since len > limit, so the offsets stay inside
  // one pass of the list and can't land on the same row twice.
  const stride = Math.floor(rows.length / limit);
  return Array.from(
    { length: limit },
    (_, i) => rows[(start + i * stride) % rows.length],
  );
}

/**
 * The same amount, read across the other causes.
 *
 * Deliberately not a ranking and not an exchange rate. There is no ordering
 * here, no "better", and no arithmetic between a hen and a child — just what
 * this figure happens to buy in each place, which is a fact about each program
 * rather than a comparison between them. Weighing them is the reader's job, and
 * the methodology page says why we won't do it for them.
 *
 * Causes without a per-dollar figure are skipped rather than guessed at.
 */

export default function SameDollar({
  amount,
  monthly = false,
  currentId = null,
  limit = null,
}) {
  const annual = monthly ? amount * 12 : amount;

  const rows = charities
    .filter((c) => c.id !== currentId && c.custom)
    .map((c) => ({ charity: c, outcome: approxOutcome(annual, c.custom) }))
    .filter((r) => r.outcome);

  if (rows.length < 2) return null;

  const shown = sampleOf(rows, limit, currentId ?? "");
  const sampled = shown.length < rows.length;

  return (
    <section className="sameDollar" aria-labelledby="sameDollar-title">
      <h2 className="sameDollar__title" id="sameDollar-title">
        {money(amount)}
        {monthly ? " a month" : ""} {currentId ? "somewhere else" : "in one cause"}
      </h2>
      <p className="sameDollar__lead">
        {currentId
          ? sampled
            ? "The same gift, in a few of the other causes."
            : "The same gift, in each of the other causes."
          : "Your whole budget sent to a single cause, for comparison."}{" "}
        Not a ranking, just what it buys there.
      </p>

      <ul className="sameDollar__list" role="list">
        {shown.map(({ charity, outcome }) => {
          const Icon = iconFor(charity.icon);
          return (
            <li key={charity.id}>
              <Link to={`/cause/${charity.id}`} className="sameDollar__row">
                <span className="tile tile--xs" data-cause={charity.id}>
                  <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="sameDollar__cause">{charity.category}</span>
                <span className="sameDollar__outcome">{outcome}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
