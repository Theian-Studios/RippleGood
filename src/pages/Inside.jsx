import { useEffect, useState } from "react";
import { getCharityById } from "../data/charities.js";
import { fetchInsideStats, statsConfigured } from "../lib/insideStats.js";
import { usePageMeta } from "../lib/usePageMeta.js";

/**
 * The private numbers page: what each referral link brought in.
 *
 * ── The URL is the whole of the privacy ─────────────────────────────────────
 * There was a passcode here. It was removed on purpose, because on a static
 * site it was theatre: the check ran in the reader's own browser and devtools
 * walked past it. What replaced it is an unguessable path — see App.jsx — which
 * is at least honest about being obscurity rather than dressed up as a lock.
 *
 * Neither one ever protected the numbers. The figures come from RPCs the anon
 * key may call, and that key ships in the bundle by design, so anyone who reads
 * the bundle can query them without ever finding this page. The path keeps the
 * page from being stumbled onto. It does not keep the data private.
 *
 * Making it genuinely private means moving the read behind an edge function
 * holding a server-side secret and revoking the anon grants. That is the work
 * to do if these numbers ever stop being ones you'd shrug at someone seeing.
 *
 * Nothing on this page identifies a donor. There is no column for it.
 */

const money = (cents) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

const pct = (part, whole) =>
  whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : "—";

function causeLabel(id) {
  if (!id) return "Uncategorised";
  return getCharityById(id)?.category ?? `${id} (retired)`;
}

export default function Inside() {
  usePageMeta("Numbers", undefined);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keeps the page out of any index that runs JavaScript. It is not in the
  // sitemap and nothing links to it, so this is the belt to that pair of
  // braces rather than the only measure.
  useEffect(() => {
    const tag = document.createElement("meta");
    tag.name = "robots";
    tag.content = "noindex, nofollow";
    document.head.appendChild(tag);
    return () => tag.remove();
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchInsideStats()
      .then((s) => alive && setStats(s))
      .catch(() => alive && setStats({ error: "Could not reach Supabase.", sources: [], causes: [] }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const sources = stats?.sources ?? [];
  const causes = stats?.causes ?? [];
  const totalGifts = causes.reduce((n, c) => n + c.gifts, 0);
  const totalCents = causes.reduce((n, c) => n + c.cents, 0);
  const refGifts = sources.reduce((n, s) => n + s.gifts, 0);
  const refCents = sources.reduce((n, s) => n + s.cents, 0);
  const refVisits = sources.reduce((n, s) => n + s.visits, 0);

  return (
    <section className="section">
      <div className="wrap wrap--narrow inside">
        <h1>Numbers</h1>

        {loading && <p className="inside__note">Loading…</p>}
        {!statsConfigured && (
          <p className="inside__note">No Supabase project is configured for this build.</p>
        )}
        {stats?.error && <p className="inside__note">{stats.error}</p>}

        {!loading && stats && (
          <>
            <div className="inside__summary">
              <div>
                <span className="inside__big">{money(totalCents)}</span>
                <span className="inside__cap">raised, all sources</span>
              </div>
              <div>
                <span className="inside__big">{totalGifts}</span>
                <span className="inside__cap">gifts</span>
              </div>
              <div>
                <span className="inside__big">{money(refCents)}</span>
                <span className="inside__cap">from tagged links</span>
              </div>
            </div>

            <h2>By link</h2>
            {stats.sourcesMissing ? (
              <p className="inside__note">
                The visits table isn't there yet. Run <code>npm run db:push</code> in
                the project folder to apply migration 0003, then reload.
              </p>
            ) : sources.length === 0 ? (
              <p className="inside__note">
                No arrivals on a tagged link yet. Links look like{" "}
                <code>ripple-good.org/?ref=rice-run</code>.
              </p>
            ) : (
              <div className="inside__scroll">
                <table className="inside__table">
                  <thead>
                    <tr>
                      <th>Link</th>
                      <th>Arrivals</th>
                      <th>Gifts</th>
                      <th>Gave</th>
                      <th>Raised</th>
                      <th>Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((s) => (
                      <tr key={s.tag}>
                        <td>{s.tag}</td>
                        <td>{s.visits.toLocaleString("en-US")}</td>
                        <td>{s.gifts.toLocaleString("en-US")}</td>
                        <td>{pct(s.gifts, s.visits)}</td>
                        <td>{money(s.cents)}</td>
                        <td>{s.gifts ? money(s.cents / s.gifts) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>All links</td>
                      <td>{refVisits.toLocaleString("en-US")}</td>
                      <td>{refGifts.toLocaleString("en-US")}</td>
                      <td>{pct(refGifts, refVisits)}</td>
                      <td>{money(refCents)}</td>
                      <td>{refGifts ? money(refCents / refGifts) : "—"}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <h2>By cause</h2>
            {causes.length === 0 ? (
              <p className="inside__note">No donations recorded yet.</p>
            ) : (
              <div className="inside__scroll">
                <table className="inside__table">
                  <thead>
                    <tr>
                      <th>Cause</th>
                      <th>Gifts</th>
                      <th>Raised</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...causes]
                      .sort((a, b) => b.cents - a.cents)
                      .map((c) => (
                        <tr key={c.causeId ?? "none"}>
                          <td>{causeLabel(c.causeId)}</td>
                          <td>{c.gifts.toLocaleString("en-US")}</td>
                          <td>{money(c.cents)}</td>
                          <td>{pct(c.cents, totalCents)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

          </>
        )}
      </div>
    </section>
  );
}
