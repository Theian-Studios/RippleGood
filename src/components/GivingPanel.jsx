import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Info } from "lucide-react";
import { getDefaultLevel } from "../data/charities.js";
import { everyOrgUrl, thanksUrl } from "../lib/donate.js";
import { newDonationRef, rememberDonation } from "../lib/donationRef.js";
import { approxOutcome, displayHost, money, unitsFor } from "../lib/format.js";
import GaveButton from "./GaveButton.jsx";
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
  const [level, setLevel] = useState(() => getDefaultLevel(charity));
  const [customText, setCustomText] = useState("");
  const [monthly, setMonthly] = useState(false);

  const host = displayHost(charity.donateUrl);
  const inputId = `custom-amount-${charity.id}`;

  // Whole dollars only; anything unparseable or below $1 falls back to the
  // selected level rather than producing a "Give $NaN" button.
  const parsed = Math.floor(Number(customText));
  const customAmount = Number.isFinite(parsed) && parsed >= 1 ? parsed : null;
  const amount = customAmount ?? level.amount;

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

  // Complete before any JS runs, and identical to what the click handler would
  // have produced — the handler now only records, it no longer rewrites.
  const everyUrl = everyOrgUrl(charity, {
    amount,
    monthly,
    ref,
    returnUrl: thanksUrl({ causeId: charity.id, amount, monthly }),
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
    <div className="give">
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
          Steady funding is worth more than the same total in one-off spikes — it's
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
                l.emphasis ? "level--emphasis" : "",
                isSelected ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* "Suggested", not "most chosen": this site runs no analytics,
                  so we have no idea what anyone actually picks. */}
              {l.emphasis && <span className="level__badge">Suggested</span>}
              <Check className="level__check" size={18} aria-hidden="true" />
              <span className="level__outcome">{annual || l.outcomeText}</span>
              <span className="level__amount">
                {priceLabel(l.amount)}
                {annual ? " · a year of it" : ""}
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
            Or name your own amount
          </label>
          <div className="customAmount__row">
            <span className="customAmount__prefix" aria-hidden="true">
              $
            </span>
            <input
              id={inputId}
              className="customAmount__input"
              type="number"
              min="1"
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
            {customOutcome ? (monthly ? `Each year: ${customOutcome}` : customOutcome) : " "}
          </p>

          {/* The same quantity, drawn. Only for units you can actually count —
              charity.custom.pictogram is absent where that isn't true. */}
          {charity.custom.pictogram && customAmount !== null && (
            <Pictogram
              units={unitsFor(monthly ? customAmount * 12 : customAmount, charity.custom)}
              pictogram={charity.custom.pictogram}
            />
          )}
        </div>
      )}

      <div className="give__foot">
        <a
          className="donate"
          href={everyUrl || charity.donateUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={everyUrl ? openEveryOrg : undefined}
        >
          Give {priceLabel(amount)} to {charity.name}
          <ArrowUpRight size={20} aria-hidden="true" />
        </a>

        {everyUrl ? (
          <>
            {/* Everything the reader should know before the tab opens: who
                receives the money, and that the total shown there will be
                higher than the figure they just chose unless they change it. */}
            <p className="handoff">
              <Info size={15} aria-hidden="true" />
              <span>
                Opens Every.org with {priceLabel(amount)} already filled in.
                Every.org is a nonprofit that takes the donation and passes it on
                to {charity.name}, and issues your receipt. At checkout it also
                suggests a contribution to itself on top of your gift —{" "}
                <strong>that part is optional and you can set it to zero.</strong>{" "}
                Ripple never sees or handles any of it. It also offers to pass us
                your contact details; we've left that unticked, and we throw the
                name and email away even if you tick it.
              </span>
            </p>

            <p className="altRoute">
              Rather skip the middleman?{" "}
              <a href={charity.donateUrl} target="_blank" rel="noopener noreferrer">
                Give directly on {host}
              </a>{" "}
              — nothing in between, though you'll type the amount in yourself.
              Employer matching schemes often prefer this route.
            </p>
          </>
        ) : (
          <p className="handoff">
            <Info size={15} aria-hidden="true" />
            <span>
              This opens {host} in a new tab, where you'll enter the amount
              {monthly ? " and set it to repeat" : ""} yourself. Ripple never sees or
              handles your donation.
            </span>
          </p>
        )}

        <GaveButton charity={charity} amount={amount} monthly={monthly} />
      </div>
    </div>
  );
}
