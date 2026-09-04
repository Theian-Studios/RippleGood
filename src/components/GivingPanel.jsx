import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpRight, Check, CircleAlert } from "lucide-react";
import { getDefaultLevel } from "../data/charities.js";
import {
  causeUrl,
  directCarriesAmount,
  directDonateUrl,
  everyOrgUrl,
  thanksUrl,
} from "../lib/donate.js";
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
export default function GivingPanel({ charity }) {
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
  // Which of the four cards is the live one. Without this, clicking into the
  // custom field left a tier looking selected until a valid number had been
  // typed, so two cards read as chosen at once.
  const [mode, setMode] = useState(() =>
    restoredAmount !== null && !restoredLevel ? "custom" : "tier",
  );

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
  const typedAmount =
    Number.isFinite(parsed) && parsed >= minAmount ? parsed : null;
  // Only counts while the custom card is the live one; a tier click clears the
  // field anyway, but this makes the rule explicit rather than incidental.
  const customAmount = mode === "custom" ? typedAmount : null;
  const amount = customAmount ?? level.amount;

  // Typed something real, but under what Every.org will carry. Say so, rather
  // than silently ignoring it and sending a different number than they read.
  // Phrased as a minimum rather than as Every.org's behavior: the reader is
  // choosing an amount, not debugging our handoff.
  const belowMin =
    mode === "custom" && Number.isFinite(parsed) && parsed >= 1 && parsed < minAmount;

  // A monthly gift's honest unit is the year it adds up to.
  const outcomeFor = (perGift) =>
    approxOutcome(monthly ? perGift * 12 : perGift, charity.custom);

  const priceLabel = (n) => (monthly ? `${money(n)}/month` : money(n));
  const customOutcome = customAmount === null ? null : outcomeFor(customAmount);

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

  // The charity's own page, carrying the amount where its platform accepts
  // one. The host is read off the resulting link rather than off donateUrl, so
  // the button never names a destination it isn't sending you to.
  const directUrl = directDonateUrl(charity, { amount, monthly });
  const directPrefilled = directCarriesAmount(charity, { monthly });
  const host = displayHost(directUrl);

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
    setMode("tier");
    setCustomText(""); // a card click is a decision — clear the free field
  }

  const units = unitsFor(monthly ? amount * 12 : amount, charity.custom);
  // Drawn at any count. Past Pictogram's own cap it switches to a multiplier
  // beside one glyph, so a large number never becomes a wall of icons.
  const showPictogram = Boolean(charity.custom?.pictogram) && units >= 1;

  return (
    <div className="give">
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
          Monthly gifts let these organizations plan next year's work. Outcomes
          below show a year of giving.
        </p>
      )}

      {/* The tiers, and "Other" as a fourth tier rather than a separate block
          under them: it is one more answer to the same question. */}
      <div className={`levels${charity.custom ? " levels--other" : ""}`}>
        {charity.givingLevels.map((l) => {
          // Keyed off the mode, not off whether a number has been typed:
          // clicking into the custom field has to deselect the tier straight
          // away, before the field holds anything valid.
          const isSelected = mode === "tier" && l.amount === level.amount;
          const annual = monthly ? outcomeFor(l.amount) : null;
          return (
            <button
              type="button"
              key={l.amount}
              onClick={() => pickLevel(l)}
              aria-pressed={isSelected}
              className={`level${isSelected ? " is-selected" : ""}`}
            >
              <span className="level__outcome">{annual || l.outcomeText}</span>
              <span className="level__foot">
                {monthly ? (
                  <span className="level__amount level__amount--annual">
                    <span className="level__annual">{money(l.amount * 12)} a year</span>
                    <span className="level__per">{money(l.amount)} a month</span>
                  </span>
                ) : (
                  <span className="level__amount">{money(l.amount)}</span>
                )}
                <Check className="level__check" size={18} aria-hidden="true" />
              </span>
            </button>
          );
        })}

        {charity.custom && (
          <label
            className={`level level--other${mode === "custom" ? " is-selected" : ""}`}
            htmlFor={inputId}
          >
            {/* Same skeleton as the three tiers: the outcome on top, the
                amount at the foot. The field is plain text sitting where the
                price sits, not a bordered control of its own. */}
            <span className="level__outcome" aria-live="polite">
              {belowMin
                ? `The minimum is ${money(minAmount)}.`
                : customOutcome
                  ? monthly
                    ? `Each year: ${customOutcome}`
                    : customOutcome
                  : "Other amount"}
            </span>
            <span className="level__foot">
              <span className="level__amount level__amount--input">
                <span aria-hidden="true">$</span>
                <input
                  id={inputId}
                  type="number"
                  min={minAmount}
                  step="1"
                  inputMode="numeric"
                  placeholder="25"
                  aria-label="Other amount"
                  value={customText}
                  onFocus={() => setMode("custom")}
                  onChange={(e) => {
                    setMode("custom");
                    setCustomText(e.target.value);
                  }}
                />
                {monthly && <span aria-hidden="true">/mo</span>}
              </span>
            </span>
          </label>
        )}
      </div>

      {showPictogram && (
        <Pictogram units={units} pictogram={charity.custom.pictogram} />
      )}

      <div className="give__foot">
        <a
          className="donate"
          href={everyUrl || directUrl}
          rel="noreferrer"
          onClick={everyUrl ? openEveryOrg : undefined}
        >
          Give {priceLabel(amount)} to {charity.name}
          <ArrowUpRight size={20} aria-hidden="true" />
        </a>

        {/* One sentence for the plumbing: where the money goes, the tip, the
            other route, and that we never touch any of it. */}
        <p className="give__note">
          {everyUrl ? (
            <>
              Every.org passes your gift to {charity.name} and sends the
              receipt; it suggests a tip you can set to zero. Or{" "}
              <a href={directUrl} target="_blank" rel="noreferrer">
                give on {host}
              </a>
              {directPrefilled ? " with the amount filled in" : ""}. We never
              see your money or your details.
            </>
          ) : (
            <>
              {charity.directOnlyReason ?? `Goes straight to ${host}.`}{" "}
              {directPrefilled
                ? `${priceLabel(amount)} is filled in.`
                : "You enter the amount on their form."}{" "}
              We never see your money or your details.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
