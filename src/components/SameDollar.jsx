import { Link } from "react-router-dom";
import { charities } from "../data/charities.js";
import { approxOutcome, money } from "../lib/format.js";
import { iconFor } from "../lib/icons.js";

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
export default function SameDollar({ amount, monthly, currentId }) {
  const annual = monthly ? amount * 12 : amount;

  const rows = charities
    .filter((c) => c.id !== currentId && c.custom)
    .map((c) => ({ charity: c, outcome: approxOutcome(annual, c.custom) }))
    .filter((r) => r.outcome);

  if (rows.length < 2) return null;

  return (
    <section className="sameDollar" aria-labelledby="sameDollar-title">
      <h2 className="sameDollar__title" id="sameDollar-title">
        {money(amount)}
        {monthly ? " a month" : ""} somewhere else
      </h2>
      <p className="sameDollar__lead">
        The same {monthly ? "year of giving" : "gift"}, in each of the other
        causes. Not a ranking — just what it buys there.
      </p>

      <ul className="sameDollar__list" role="list">
        {rows.map(({ charity, outcome }) => {
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
