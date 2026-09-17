import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Pictogram from "../components/Pictogram.jsx";
import Ripple from "../components/Ripple.jsx";
import ShareGift from "../components/ShareGift.jsx";
import { getCharityById } from "../data/charities.js";
import { approxOutcome, money, ordinal, unitsFor } from "../lib/format.js";
import { clearPending, readPending } from "../lib/donationRef.js";
import { usePageMeta } from "../lib/usePageMeta.js";
import { recordGift } from "../lib/history.js";
import { isNative, tapSuccess } from "../lib/native.js";
import { readReminders, setMonthlyDay } from "../lib/reminders.js";

/**
 * Where Every.org returns a donor after a completed gift.
 *
 * One job: say what the gift did. Nothing is logged, but the pending record is
 * still consumed so a stale one can't describe a later visit.
 *
 * What this page is NOT is proof. The amount arrives in a query string the
 * donor could edit. The verified figure lives in the database, put there by
 * Every.org's webhook, and is never mixed with this one.
 */
export default function Thanks() {
  const [params] = useSearchParams();
  const logged = useRef(false);

  const pending = readPending();
  const causeId = params.get("cause") || pending?.causeId || null;
  const charity = causeId ? getCharityById(causeId) : null;

  const rawAmount = Number(params.get("amount") ?? pending?.amount);
  const amount = Number.isFinite(rawAmount) && rawAmount >= 1 ? Math.floor(rawAmount) : null;
  const monthly = params.get("monthly") === "1" || Boolean(pending?.monthly);

  usePageMeta("Thank you", "Your gift is on its way.");

  // App only: whether this gift went into Your ripple, and whether to offer a
  // monthly reminder (not to someone who already has one, or gave monthly).
  const [native] = useState(isNative);
  const [saved, setSaved] = useState(false);
  const [reminder, setReminder] = useState("hidden"); // hidden | offer | set | refused

  useEffect(() => {
    // The pending record is a one-shot token: it exists because this browser
    // clicked donate, and it is consumed here so a stale one cannot describe a
    // later visit. The ref guards the same within one mount, since StrictMode
    // double-invokes effects in development.
    if (logged.current || !charity || amount === null) return;
    if (!pending || pending.causeId !== charity.id) return;

    logged.current = true;
    clearPending();

    // The pending record is what proves this phone started the gift, so it is
    // also what lets the app keep it. Its id makes recording idempotent.
    if (native) {
      recordGift({ id: pending.id, causeId: charity.id, amount, monthly })
        .then((added) => {
          setSaved(true);
          if (added) tapSuccess();
        })
        .catch(() => {});
      if (!monthly) {
        readReminders()
          .then((r) => setReminder(r.monthlyDay ? "hidden" : "offer"))
          .catch(() => {});
      }
    }
  }, [charity, amount, monthly, pending, native]);

  async function remindMonthly() {
    // The day they just gave on, capped at 28 so it exists every month.
    const day = Math.min(new Date().getDate(), 28);
    const result = await setMonthlyDay(day).catch(() => null);
    setReminder(result ? "set" : "refused");
  }

  const outcome =
    charity && amount !== null
      ? approxOutcome(monthly ? amount * 12 : amount, charity.custom)
      : null;

  return (
    <section className="pageHead">
      <div className="wrap wrap--narrow u-centered">
        {/* The site is named after this and had never once drawn it. */}
        <Ripple live className="thanks__ripple" />

        <p className="eyebrow">Thank you</p>
        <h1>
          That's a <span className="mark">ripple.</span>
        </h1>

        {charity && amount !== null ? (
          <>
            <p className="u-mt-5 u-lead">
              {money(amount)}
              {monthly ? " a month" : ""} to <strong>{charity.name}</strong>.
              {outcome ? ` ${monthly ? "Each year: " : ""}${outcome}` : ""}
            </p>

            {charity.custom?.pictogram && (
              <div className="u-centre-row">
                <Pictogram
                  units={unitsFor(monthly ? amount * 12 : amount, charity.custom)}
                  pictogram={charity.custom.pictogram}
                />
              </div>
            )}

            <ShareGift charity={charity} outcome={outcome} />

            {native && (saved || reminder !== "hidden") && (
              <div className="appThanks">
                {saved && (
                  <p>
                    Saved to <Link to="/you">Your ripple</Link>, on this phone only.
                  </p>
                )}
                {reminder === "offer" && (
                  <button type="button" className="btn btn--outline" onClick={remindMonthly}>
                    Remind me next month
                  </button>
                )}
                {reminder === "set" && (
                  <p>We'll remind you on the {ordinal(Math.min(new Date().getDate(), 28))} of each month.</p>
                )}
                {reminder === "refused" && (
                  <p>Notifications are off for Ripple Good. You can turn them on in Settings.</p>
                )}
              </div>
            )}

            <p className="handoff handoff--centered u-mt-6">
              <span>Your receipt comes from Every.org by email.</span>
            </p>
          </>
        ) : (
          <p className="u-mt-5 u-lead">
            If you just gave, thank you. Your receipt comes by email from
            wherever you gave. If you landed here by accident, the causes are
            still below.
          </p>
        )}

        <div className="hero__actions hero__actions--centered u-mt-7">
          <Link to="/#causes" className="btn btn--outline">
            Pick another cause
          </Link>
        </div>
      </div>
    </section>
  );
}
