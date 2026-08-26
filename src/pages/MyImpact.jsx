import { Link } from "react-router-dom";
import { ArrowRight, Lock, Trash2 } from "lucide-react";
import { charities, getCharityById } from "../data/charities.js";
import { approxOutcome, longDate, money } from "../lib/format.js";
import { CountUp } from "../components/Pictogram.jsx";
import { iconFor } from "../lib/icons.js";
import { useTally } from "../lib/tally.js";
import { usePageMeta } from "../lib/usePageMeta.js";

export default function MyImpact() {
  usePageMeta(
    "Your impact",
    "A private running total of what you've given, kept in this browser and visible to nobody else.",
  );

  const { entries, remove, clear, total, hasMonthly } = useTally();

  // One row per cause: the dollars you've logged, and what that adds up to in
  // that cause's own units. Monthly entries count as a year of giving, which is
  // what the button recorded them as.
  const byCause = charities
    .map((c) => {
      const mine = entries.filter((e) => e.causeId === c.id);
      if (!mine.length) return null;
      const sum = mine.reduce(
        (acc, e) => acc + (Number(e.amount) || 0) * (e.monthly ? 12 : 1),
        0,
      );
      return { charity: c, sum, count: mine.length, outcome: approxOutcome(sum, c.custom) };
    })
    .filter(Boolean);

  return (
    <>
      <section className="pageHead">
        <div className="wrap wrap--narrow">
          <p className="eyebrow">Your impact</p>
          <h1>
            What you've <span className="mark">actually</span> done.
          </h1>
          <p>
            Giving is easy to forget you did. This is a running note to yourself —
            kept in this browser, sent nowhere, seen by nobody. Us included.
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap wrap--narrow">
          {entries.length === 0 ? (
            <div className="give" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--ink-soft)" }}>
                Nothing here yet. Give to any cause, tap the tally button at the
                bottom of its page, and it starts adding up — for your eyes only.
              </p>
              <p style={{ marginTop: 22 }}>
                <Link to="/#causes" className="btn btn--primary">
                  Pick a cause
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </p>
            </div>
          ) : (
            <>
              <div className="tallyTotal">
                <span className="tallyTotal__value">
                  <CountUp value={total} format={money} />
                </span>
                <span className="tallyTotal__label">
                  logged across {entries.length}{" "}
                  {entries.length === 1 ? "gift" : "gifts"}
                  {hasMonthly ? ", counting each monthly gift as a full year" : ""}
                </span>
              </div>

              <div className="tallyGrid">
                {byCause.map(({ charity, sum, count, outcome }) => {
                  const Icon = iconFor(charity.icon);
                  return (
                    <div className="tallyCard" key={charity.id}>
                      <span className="tile">
                        <Icon size={21} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="tallyCard__cause">{charity.category}</span>
                      <span className="tallyCard__outcome">
                        {outcome || charity.headline}
                      </span>
                      <span className="tallyCard__meta">
                        {money(sum)} · {count} {count === 1 ? "entry" : "entries"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <h2 style={{ marginTop: 46, fontSize: "1.4rem" }}>Every entry</h2>
              <ul className="tallyList">
                {entries
                  .slice()
                  .reverse()
                  .map((e) => {
                    const c = getCharityById(e.causeId);
                    return (
                      <li className="tallyRow" key={e.id}>
                        <span>
                          <strong>
                            {money(e.amount)}
                            {e.monthly ? "/month" : ""}
                          </strong>{" "}
                          — {c ? c.name : e.causeId}
                          <span className="tallyRow__date">
                            {longDate(e.at.slice(0, 10))}
                          </span>
                        </span>
                        <button
                          type="button"
                          className="tallyRow__remove"
                          onClick={() => remove(e.id)}
                          aria-label={`Remove ${money(e.amount)} entry for ${
                            c ? c.name : e.causeId
                          }`}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
              </ul>

              <div className="splitFoot">
                <button type="button" className="btn btn--outline" onClick={clear}>
                  <Trash2 size={16} aria-hidden="true" />
                  Clear everything
                </button>
              </div>
            </>
          )}

          <p className="handoff" style={{ marginTop: 28 }}>
            <Lock size={15} aria-hidden="true" />
            <span>
              These are your own notes, not verified records — we have no way to
              confirm a donation and never see one. Clearing your browser data will
              erase this, and it won't follow you to another device.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
