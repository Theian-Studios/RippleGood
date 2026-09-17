import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

import { getCharityById } from "../data/charities.js";
import { approxOutcome, money, ordinal } from "../lib/format.js";
import { readGifts, removeGift } from "../lib/history.js";
import { isNative, tapSelection } from "../lib/native.js";
import { readReminders, setMonthlyDay, setSeason } from "../lib/reminders.js";
import { usePageMeta } from "../lib/usePageMeta.js";
import NotFound from "./NotFound.jsx";

/**
 * Your ripple: what this phone's gifts add up to, and the reminders.
 *
 * App only. Everything on it is read from the phone (lib/history,
 * lib/reminders), so on the website there is nothing to show and the route is
 * an ordinary 404.
 *
 * The totals use the same outcome sentences as the cause pages, and the same
 * floor rule, so "~15 nets" here means exactly what it meant when the gift was
 * chosen. A monthly gift is shown as the gift it is, a year's worth of outcome,
 * rather than multiplied by months elapsed: we can't see whether it was since
 * cancelled, and a number that only goes up would be the overstatement this
 * site avoids.
 */
export default function You() {
  const [native] = useState(isNative);
  return native ? <YourRipple /> : <NotFound />;
}

function YourRipple() {
  const [gifts, setGifts] = useState(null);
  const [reminders, setReminders] = useState(null);
  const [refused, setRefused] = useState(false);

  usePageMeta("Your ripple", "The gifts you've made from this phone.");

  useEffect(() => {
    readGifts().then(setGifts);
    readReminders().then(setReminders);
  }, []);

  async function forget(id) {
    await removeGift(id);
    setGifts(await readGifts());
  }

  async function change(update) {
    tapSelection();
    const next = await update().catch(() => null);
    if (next) {
      setReminders(next);
      setRefused(false);
    } else {
      setRefused(true);
    }
  }

  const summary = summarize(gifts || []);

  return (
    <section className="pageHead you">
      <div className="wrap wrap--narrow">
        <p className="eyebrow">Your ripple</p>
        <h1>
          {gifts?.length ? (
            <>
              What you've <span className="mark">set in motion.</span>
            </>
          ) : (
            <>
              It starts with <span className="mark">one gift.</span>
            </>
          )}
        </h1>

        {gifts && gifts.length === 0 && (
          <>
            <p className="u-mt-5 u-lead">
              Gifts you make from this app show up here, with what they fund.
            </p>
            <div className="hero__actions u-mt-6">
              <Link to="/#causes" className="btn btn--primary">
                Pick a cause
              </Link>
            </div>
          </>
        )}

        {summary.length > 0 && (
          <ul className="you__totals">
            {summary.map((s) => (
              <li key={s.charity.id} className="you__total">
                <Link to={`/cause/${s.charity.id}`} className="you__cause">
                  {s.charity.category}
                </Link>
                {s.once > 0 && (
                  <p>
                    <strong>{money(s.once)}</strong>
                    <span>{approxOutcome(s.once, s.charity.custom) || `To ${s.charity.name}.`}</span>
                  </p>
                )}
                {s.monthly > 0 && (
                  <p>
                    <strong>{money(s.monthly)} a month</strong>
                    <span>
                      {approxOutcome(s.monthly * 12, s.charity.custom)
                        ? `Each year: ${approxOutcome(s.monthly * 12, s.charity.custom)}`
                        : `To ${s.charity.name}.`}
                    </span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {reminders && (
          <div className="you__section">
            <h2>Reminders</h2>
            <label className="you__row">
              <span>
                <strong>Monthly</strong>
                <span>A nudge on the day you pick.</span>
              </span>
              <select
                value={reminders.monthlyDay || ""}
                onChange={(e) => change(() => setMonthlyDay(Number(e.target.value) || null))}
              >
                <option value="">Off</option>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    The {ordinal(d)}
                  </option>
                ))}
              </select>
            </label>
            <label className="you__row">
              <span>
                <strong>Giving season</strong>
                <span>Giving Tuesday, and before the tax year ends.</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={reminders.season}
                onChange={(e) => change(() => setSeason(e.target.checked))}
              />
            </label>
            {refused && (
              <p className="you__note">
                Notifications are off for Ripple Good. Turn them on in Settings, then try again.
              </p>
            )}
          </div>
        )}

        {gifts?.length > 0 && (
          <div className="you__section">
            <h2>Gifts</h2>
            <ul className="you__gifts">
              {gifts.map((g) => {
                const charity = getCharityById(g.causeId);
                return (
                  <li key={g.id} className="you__gift">
                    <span>
                      <strong>
                        {money(g.amount)}
                        {g.monthly ? " a month" : ""}
                      </strong>{" "}
                      to {charity?.name ?? g.causeId}
                      <span className="you__date">
                        {new Date(g.at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="you__forget"
                      aria-label="Remove this gift"
                      onClick={() => forget(g.id)}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="you__note">
              Kept on this phone only; we never see it. A gift is added when
              Every.org sends you back after checkout, so remove any that
              didn't go through, or a monthly gift you've since cancelled.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/** One-time and monthly totals per cause, in the order first given. */
function summarize(gifts) {
  const byCause = new Map();
  for (const g of [...gifts].reverse()) {
    const charity = getCharityById(g.causeId);
    if (!charity) continue;
    const entry = byCause.get(charity.id) || { charity, once: 0, monthly: 0 };
    if (g.monthly) entry.monthly += g.amount;
    else entry.once += g.amount;
    byCause.set(charity.id, entry);
  }
  return [...byCause.values()];
}
