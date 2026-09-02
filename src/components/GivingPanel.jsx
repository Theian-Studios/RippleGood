import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpRight, Check, CircleAlert, Info } from "lucide-react";
import { getDefaultLevel } from "../data/charities.js";
import { causeUrl, everyOrgUrl, thanksUrl } from "../lib/donate.js";
import { newDonationRef, rememberDonation } from "../lib/donationRef.js";
import { approxOutcome, displayHost, money, unitsFor } from "../lib/format.js";
import Pictogram from "./Pictogram.jsx";

/**
 * Giving levels phrased as outcomes, a free-amount field that translates any
 * number into the same language, and a one-time/monthly switch. The dollar
 * figure is the small second line on purpose — you are choosing a result, not
 * a price.
 *
 * Nothing here moves money or changes the outbound link. We deliberately don't
 * push an amount into the charity's URL: those parameters differ per charity,
 * break silently when a charity redesigns its form, and would imply we are
 * involved in the transaction. We are not — the donor enters the amount, and
 * chooses one-time or monthly, on the charity's own page.
 */
export default function GivingPanel({ charity, onSelectionChange }) {
  // Restored from the exit URL when someone cancelled out of Every.org, so the
  // panel they come back to is the one they left. Read once, at mount: this is
  // an initial value, not a binding, or typing in the custom field would fight
  // the query string still sitting in the address bar.
  const [params] = useSearchParams();
  const restored = Number(params.get("amount"));
  const restoredAmount = Number.isFinite(restored) && restored >= 1 ? Math.floor(restored) : null;
  const restoredLevel =
    restoredAmount === null
      ? null
      : charity.givingLevels.find((l) => l.amount === restoredAmount);

  const [level, setLevel] = useState(() => restoredLevel ?? getDefaultLevel(charity));
  // A restored amount that isn't one of the tiers belongs in the custom field.
  const [customText, setCustomText] = useState(() =>
    restoredAmount !== null && !restoredLevel ? String(restoredAmount) : "",
  );
  const [monthly, setMonthly] = useState(() => params.get("monthly") === "1");

  const host = displayHost(charity.donateUrl);
  const inputId = `custom-amount-${charity.id}`;

  /**
   * Every.org ignores a prefilled amount under $10 and hands the donor an empty
   * field instead, with no error — so on causes routed through it, $10 is the
   * lowest amount we can actually carry across. Direct-only causes never send
   * an amount anywhere, so a dollar is fine there.
   */
  const minAmount = charity.everyOrg ? 10 : 1;

  // Whole dollars only; anything unparseable or below the minimum falls back to
  // the selected level rather than producing a "Give $NaN" button.
  const parsed = Math.floor(Number(customText));
  const customAmount =
    Number.isFinite(parsed) && parsed >= minAmount ? parsed : null;
  const amount = customAmount ?? level.amount;

  // Typed something real, but under what Every.org will carry. Say so, rather
  // than silently ignoring it and sending a different number than they read.
  // Phrased as a minimum rather than as Every.org's behavior: the reader is
  // choosing an amount, not debugging our handoff.
  const belowMin =
    Number.isFinite(parsed) && parsed >= 1 && parsed < minAmount;

  // A monthly gift's honest unit is the year it adds up to.
  const outcomeFor = (perGift) =>
    approxOutcome(monthly ? perGift * 12 : perGift, charity.custom);

  const priceLabel = (n) => (monthly ? `${money(n)}/month` : money(n));
  const customOutcome = customAmount === null ? null : outcomeFor(customAmount);

  // Reported up rather than lifted out: the widget still owns its state, and
  // the page only needs to read the result to show the same figure elsewhere.
  useEffect(() => {
    onSelectionChange?.({ amount, monthly });
  }, [amount, monthly, onSelectionChange]);

  /**
   * Minted during render, not on click, so the attribution is already in the
   * href. A donor who cmd-clicks or opens the button in a new tab never fires
   * the click handler — if the reference were added there, their gift would
   * reach Every.org with no webhook_token and never be counted at all.
   *
   * A new id per amount or cadence change, so the id that travels always
   * describes the gift actually being made.
   */
  const ref = useMemo(
    () => newDonationRef(),
    [charity.id, amount, monthly],
  );

  // Complete before any JS runs, and identical to what the click handler would
  // have produced — the handler now only records, it no longer rewrites.
  const everyUrl = everyOrgUrl(charity, {
    amount,
    monthly,
    ref,
    returnUrl: thanksUrl({ causeId: charity.id, amount, monthly }),
    exitUrl: causeUrl(charity.id, { amount, monthly }),
  });

  /** The one thing that genuinely belongs in the gesture: the local record. */
  function openEveryOrg() {
    rememberDonation({ id: ref, causeId: charity.id, amount, monthly });
    // The browser follows the href as rendered; no preventDefault needed.
  }

  function pickLevel(next) {
    setLevel(next);
    setCustomText(""); // a card click is a decision — clear the free field
  }

  return (
    <div className={`give${charity.provisional ? " give--provisional" : ""}`}>
      {/* First thing inside the widget, not a banner floating above it. An
          unchecked figure has to be read before an amount is chosen, and a
          caveat further up the page is one the eye skips on the way down. */}
      {charity.provisional && (
        <p className="give__provisional">
          <CircleAlert size={17} aria-hidden="true" />
          <span>
            <strong>Figures not yet checked.</strong> We've drafted this cause
            but haven't verified its numbers against {charity.evaluator}'s
            published research. Treat the amounts below as illustrative, and
            read {charity.evaluator}'s own page before giving.
          </span>
        </p>
      )}

      <div className="give__head">
        <p className="give__label">Choose a result</p>

        <div
          className="cadence"
          data-cadence={monthly ? "monthly" : "once"}
          role="group"
          aria-label="Giving frequency"
        >
          <button
            type="button"
            className={`cadence__opt${monthly ? "" : " is-on"}`}
            aria-pressed={!monthly}
            onClick={() => setMonthly(false)}
          >
            One-time
          </button>
          <button
            type="button"
            className={`cadence__opt${monthly ? " is-on" : ""}`}
            aria-pressed={monthly}
            onClick={() => setMonthly(true)}
          >
            Monthly
          </button>
        </div>
      </div>

      {monthly && (
        <p className="cadence__note">
          Steady funding is worth more than the same total in one-off spikes: it's
          what lets these organizations commit to next year's work. Outcomes below
          show what a year of giving adds up to.
        </p>
      )}

      <div className="levels">
        {charity.givingLevels.map((l) => {
          const isSelected = customAmount === null && l.amount === level.amount;
          // In monthly mode the preset text ("Hangs two nets") describes the
          // wrong quantity, so use the annual figure where we can compute one.
          const annual = monthly ? outcomeFor(l.amount) : null;
          return (
            <button
              type="button"
              key={l.amount}
              onClick={() => pickLevel(l)}
              aria-pressed={isSelected}
              className={[
                "level",
                isSelected ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="level__outcome">{annual || l.outcomeText}</span>
              {/* The price and the check share a row, so the check sits on the
                  price's own centre line and inside the same text column. It
                  used to be positioned absolutely against the tier's corner,
                  which put it below the figure it marks. */}
              <span className="level__foot">
                {/* In monthly mode the figure that matters is the year, not the
                    instalment, so the year is the one set large. The toggle used
                    to change almost nothing you could see. */}
                {monthly ? (
                  <span className="level__amount level__amount--annual">
                    <span className="level__annual">{money(l.amount * 12)} a year</span>
                    <span className="level__per">{money(l.amount)} a month</span>
                  </span>
                ) : (
                  <span className="level__amount">{money(l.amount)}</span>
                )}
                {/* All three tiers look alike; .is-selected is the only thing
                    that marks the chosen one. */}
                <Check className="level__check" size={18} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Hidden for causes with no verified per-dollar figure: a live outcome
          sentence there would be precision we haven't earned. */}
      {charity.custom && (
        <div className="customAmount">
          <label className="customAmount__label" htmlFor={inputId}>
            Custom amount
          </label>
          <div className="customAmount__row">
            <span className="customAmount__prefix" aria-hidden="true">
              $
            </span>
            <input
              id={inputId}
              className="customAmount__input"
              type="number"
              min={minAmount}
              step="1"
              inputMode="numeric"
              placeholder="25"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
            />
            {monthly && <span className="customAmount__suffix">/month</span>}
          </div>
          {/* Always rendered so the live region exists before it first speaks. */}
          <p className="customAmount__outcome" aria-live="polite">
            {belowMin
              ? `The minimum donation is ${money(minAmount)}.`
              : customOutcome
                ? monthly
                  ? `Each year: ${customOutcome}`
                  : customOutcome
                : " "}
          </p>

        </div>
      )}

      {/* The chosen quantity, drawn — for the selected tier as well as a typed
          amount. This used to render only for custom amounts, so the one part
          of the widget that makes a number feel like something was invisible
          to anyone who just pressed a tier. Only for units you can count;
          charity.custom.pictogram is absent where that isn't true. */}
      {charity.custom?.pictogram && (
        <Pictogram
          units={unitsFor(monthly ? amount * 12 : amount, charity.custom)}
          pictogram={charity.custom.pictogram}
        />
      )}

      {/* One caveat, above the button, for the causes whose figures need it. */}
      {charity.estimateNote && (
        <p className="estimateNote">
          <Info size={15} aria-hidden="true" />
          <span>{charity.estimateNote}</span>
        </p>
      )}

      <div className="give__foot">
        {/* Above the button, because these are the facts that change the
            decision: where the money actually goes, and that the total on the
            next screen will be higher than the figure just chosen unless the
            donor changes it. The privacy line doesn't change any decision, so
            it stays underneath. */}
        {everyUrl ? (
          <p className="routeNote">
            <Info size={16} aria-hidden="true" />
            <span>
              Goes via <strong>Every.org</strong>, a nonprofit that passes your
              gift to {charity.name} and issues the receipt. It suggests a tip
              for itself at checkout. That tip is{" "}
              <strong>optional, and you can set it to zero.</strong>
            </span>
          </p>
        ) : (
          <p className="routeNote">
            <Info size={16} aria-hidden="true" />
            <span>
              {charity.directOnlyReason ? (
                <>{charity.directOnlyReason} </>
              ) : (
                <>
                  Goes straight to <strong>{host}</strong>.{" "}
                </>
              )}
              You enter the amount
              {monthly ? " and set it to repeat" : ""} on their form.
            </span>
          </p>
        )}

        {/* Two routes, two buttons. The charity's own page was a text link
            under a large button while the FAQ called it an "equally visible
            second option", which it plainly wasn't. Both now say where they
            go, so the label never hides the destination.

            Same tab for Every.org: giving is what the reader came to do, and
            success_url brings them back to /thanks. The direct route opens
            beside the page instead, because it drops the amount and cadence
            they just picked and they'll want this panel still on screen to
            copy from. */}
        <div className="routes">
          <a
            className="donate"
            href={everyUrl || charity.donateUrl}
            rel="noreferrer"
            onClick={everyUrl ? openEveryOrg : undefined}
          >
            Give {priceLabel(amount)} {everyUrl ? "via Every.org" : `on ${host}`}
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>

          {everyUrl && (
            <a
              className="donate donate--alt"
              href={charity.donateUrl}
              target="_blank"
              rel="noreferrer"
            >
              Give on {host}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          )}
        </div>

        {everyUrl && (
          <p className="handoff">
            <span>
              {priceLabel(amount)} is carried across for you. Giving on{" "}
              {host} opens in a new tab and starts from an empty form.
              Ripple Good never sees your money or your details either way.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
