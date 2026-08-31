import { useMemo, useState } from "react";
import { ArrowUpRight, ClipboardCopy, Check, RotateCcw } from "lucide-react";
import { charities } from "../data/charities.js";
import { approxOutcome, money } from "../lib/format.js";
import { iconFor } from "../lib/icons.js";
import { usePageMeta } from "../lib/usePageMeta.js";

/**
 * Sliders are *weights*, not dollar amounts. Each cause's share is its weight
 * over the sum of all weights, so the split always adds to exactly the budget —
 * no unallocated remainder to reconcile, no clamping, no arithmetic the reader
 * has to do. Set every weight to zero and the plan is simply empty.
 */
const START_WEIGHT = 1;
const BUDGET_DEFAULT = 100;

export default function Split() {
  usePageMeta(
    "Build a giving plan",
    "Divide a budget across the causes you care about and see the combined outcome, then give to each charity directly.",
  );

  const [budget, setBudget] = useState(String(BUDGET_DEFAULT));
  const [weights, setWeights] = useState(() =>
    Object.fromEntries(charities.map((c) => [c.id, START_WEIGHT])),
  );
  const [copied, setCopied] = useState(false);

  const budgetValue = Math.max(0, Math.floor(Number(budget)) || 0);
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const plan = useMemo(() => {
    if (!totalWeight || !budgetValue) return [];

    // Largest-remainder apportionment. Rounding each share independently
    // overshoots — eight causes splitting $100 each round $12.50 up to $13 and
    // the "plan" quietly asks for $104. Instead: floor everything, then hand
    // the leftover dollars to the largest fractions, so the rows always sum to
    // exactly the budget the reader typed.
    const exact = charities.map((c) => {
      const share = (weights[c.id] / totalWeight) * budgetValue;
      return { charity: c, floor: Math.floor(share), remainder: share % 1 };
    });

    let leftover = budgetValue - exact.reduce((sum, r) => sum + r.floor, 0);
    const order = [...exact].sort((a, b) => b.remainder - a.remainder);
    for (const row of order) {
      if (leftover <= 0) break;
      // Never conjure a dollar for a cause the reader slid to zero.
      if (weights[row.charity.id] === 0) continue;
      row.floor += 1;
      leftover -= 1;
    }

    return exact
      .filter((row) => row.floor > 0)
      .map(({ charity, floor }) => ({
        charity,
        amount: floor,
        outcome: approxOutcome(floor, charity.custom),
      }));
  }, [weights, totalWeight, budgetValue]);

  const planned = plan.reduce((sum, r) => sum + r.amount, 0);

  function setWeight(id, value) {
    setWeights((w) => ({ ...w, [id]: Number(value) }));
    setCopied(false);
  }

  function reset() {
    setWeights(Object.fromEntries(charities.map((c) => [c.id, START_WEIGHT])));
    setBudget(String(BUDGET_DEFAULT));
    setCopied(false);
  }

  async function copyPlan() {
    const lines = plan.map(
      (r) =>
        `${money(r.amount)} — ${r.charity.name} (${r.charity.category})\n  ${
          r.outcome || r.charity.headline
        }\n  ${r.charity.donateUrl}`,
    );
    const text = `My giving plan — ${money(planned)} total\n\n${lines.join("\n\n")}\n\nBuilt with ripple-good.org`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false); // clipboard blocked; the list is on screen to copy by hand
    }
  }

  return (
    <>
      <section className="pageHead">
        <div className="wrap wrap--narrow">
          <p className="eyebrow">Giving plan</p>
          <h1>
            Split it across <span className="mark">everything</span> you care about.
          </h1>
          <p>
            Nobody cares about exactly one thing. Set a budget, weight the causes,
            and we'll work out the split and what it adds up to — then you give to
            each charity directly, as always.
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap wrap--narrow">
          <div className="give">
            <div className="splitBudget">
              <label className="customAmount__label" htmlFor="split-budget">
                Your total budget
              </label>
              <div className="customAmount__row">
                <span className="customAmount__prefix" aria-hidden="true">
                  $
                </span>
                <input
                  id="split-budget"
                  className="customAmount__input"
                  type="number"
                  min="0"
                  step="10"
                  inputMode="numeric"
                  value={budget}
                  onChange={(e) => {
                    setBudget(e.target.value);
                    setCopied(false);
                  }}
                />
              </div>
            </div>

            <div className="sliders">
              {charities.map((c) => {
                const Icon = iconFor(c.icon);
                const row = plan.find((r) => r.charity.id === c.id);
                return (
                  <div
                    className={`slider${weights[c.id] === 0 ? " is-zero" : ""}`}
                    key={c.id}
                  >
                    <label className="slider__head" htmlFor={`w-${c.id}`}>
                      <span className="tile tile--xs" data-cause={c.id}>
                        <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="slider__name">{c.category}</span>
                      <span className="slider__amount">
                        {row ? money(row.amount) : "—"}
                      </span>
                    </label>
                    <input
                      id={`w-${c.id}`}
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={weights[c.id]}
                      onChange={(e) => setWeight(c.id, e.target.value)}
                      aria-describedby={`w-${c.id}-out`}
                      // WebKit can't paint a filled track on its own; this feeds
                      // the gradient stop in styles.css.
                      style={{ "--fill": `${(weights[c.id] / 5) * 100}%` }}
                    />
                    <span className="slider__outcome" id={`w-${c.id}-out`}>
                      {row?.outcome || (row ? c.headline : "Not in this plan")}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="splitFoot">
              <button type="button" className="btn btn--outline" onClick={reset}>
                <RotateCcw size={16} aria-hidden="true" />
                Reset
              </button>
              {plan.length > 0 && (
                <button type="button" className="btn btn--primary" onClick={copyPlan}>
                  {copied ? (
                    <Check size={17} aria-hidden="true" />
                  ) : (
                    <ClipboardCopy size={17} aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy plan"}
                </button>
              )}
            </div>
          </div>

          {plan.length > 0 && (
            <>
              <h2 className="splitPlan__h">
                Your plan: {money(planned)} across {plan.length}{" "}
                {plan.length === 1 ? "cause" : "causes"}
              </h2>
              <p className="splitPlan__sub">
                Give to each one on its own site. There's no order to follow and no
                step you can miss — these are just {plan.length} ordinary donations.
              </p>

              <ol className="planList">
                {plan.map((r) => (
                  <li className="planRow" key={r.charity.id}>
                    <div>
                      <span className="planRow__amount">{money(r.amount)}</span>
                      <span className="planRow__name">{r.charity.name}</span>
                      <span className="planRow__outcome">
                        {r.outcome || r.charity.headline}
                      </span>
                    </div>
                    <a
                      className="btn btn--primary planRow__go"
                      href={r.charity.donateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Give
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ol>

              <p className="handoff u-mt-5">
                <span>
                  Whole dollars, adding up to exactly your budget. Every link goes to
                  the charity's own donation page — Ripple Good never handles any of it.
                </span>
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
