import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import Pictogram from "../components/Pictogram.jsx";
import { getCharityById } from "../data/charities.js";
import { approxOutcome, money, unitsFor } from "../lib/format.js";
import { clearPending, readPending } from "../lib/donationRef.js";
import { usePageMeta } from "../lib/usePageMeta.js";

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

  useEffect(() => {
    // The pending record is a one-shot token: it exists because this browser
    // clicked donate, and it is consumed here so a stale one cannot describe a
    // later visit. The ref guards the same within one mount, since StrictMode
    // double-invokes effects in development.
    if (logged.current || !charity || amount === null) return;
    if (!pending || pending.causeId !== charity.id) return;

    logged.current = true;
    clearPending();
  }, [charity, amount, monthly, pending]);

  const outcome =
    charity && amount !== null
      ? approxOutcome(monthly ? amount * 12 : amount, charity.custom)
      : null;

  return (
    <section className="pageHead">
      <div className="wrap wrap--narrow u-centered">
        <span className="tile tile--lg thanks__tile">
          <Heart size={24} strokeWidth={1.75} aria-hidden="true" />
        </span>

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

            <p className="handoff handoff--centered u-mt-6">
              <span>
                Your receipt comes from Every.org by email.
              </span>
            </p>
          </>
        ) : (
          <p className="u-mt-5 u-lead">
            If you just gave, thank you — your receipt comes by email from
            wherever you gave. If you landed here by accident, the causes are
            still below.
          </p>
        )}

        <div className="hero__actions hero__actions--centered u-mt-7">
          <Link to="/#causes" className="btn btn--outline btn--lg">
            Pick another cause
          </Link>
        </div>
      </div>
    </section>
  );
}
