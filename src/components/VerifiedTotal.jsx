import { useEffect, useState } from "react";
import { fetchDonationTotals, impactConfigured } from "../lib/impact.js";
import { money } from "../lib/format.js";

/**
 * What readers have actually given through this site, as reported by Every.org.
 *
 * The counterpart to the tally strip directly above it: that one is what *you*
 * typed into this browser, this one is what Every.org confirmed. Neither is an
 * accounting record and both say so.
 *
 * ── Why there is a floor ───────────────────────────────────────────────────
 * A brand-new site announcing "$0 moved · 0 gifts" reads as "nobody uses this",
 * which is worse than saying nothing at all. So this renders nothing until the
 * figure is worth showing — same reasoning as the tally strip hiding itself on
 * a first visit, and the same reason we never write "be the first to give".
 */
const MIN_GIFTS = 10;

export default function VerifiedTotal() {
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    if (!impactConfigured) return;
    const ac = new AbortController();
    // Failure is already folded into fetchDonationTotals — it resolves null on
    // an abort, a network error or a bad response, so there is no error state
    // to render here. The section simply doesn't appear.
    fetchDonationTotals({ signal: ac.signal }).then(setTotals);
    return () => ac.abort();
  }, []);

  if (!totals || totals.allGifts < MIN_GIFTS) return null;

  return (
    <section className="section section--tight">
      <div className="wrap">
        <div className="verifiedTotal">
          <p className="verifiedTotal__figure">
            <strong>{money(Math.round(totals.allCents / 100))}</strong> has reached
            these charities through Every.org links on this page.
          </p>
          {/* Both directions of error, stated plainly. The figure is too low
              because it cannot see the direct-to-charity route, and too high
              because Every.org sends no refund event for us to subtract. */}
          <p className="verifiedTotal__note">
            {totals.allGifts.toLocaleString("en-US")} gifts, counted by Every.org
            rather than by us. Gifts made directly on a charity's own site aren't
            included, and refunds aren't subtracted.
          </p>
        </div>
      </div>
    </section>
  );
}
