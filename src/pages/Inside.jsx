import { useEffect, useState } from "react";
import { getCharityById } from "../data/charities.js";
import { fetchInsideStats, statsConfigured } from "../lib/insideStats.js";
import { usePageMeta } from "../lib/usePageMeta.js";

/**
 * The private numbers page: what each referral link brought in.
 *
 * ── What the passcode is and isn't ──────────────────────────────────────────
 * It is a lock on a door in a glass wall. This is a static site, so the check
 * below runs in the reader's own browser and anyone willing to open devtools
 * is past it. Worse, it guards nothing that isn't already reachable: the
 * aggregates come from RPCs the anon key may call, and that key ships in the
 * bundle by design.
 *
 * So the passcode is here to stop the page being read by someone who wanders
 * onto the URL, and for no stronger purpose. It is written down as a hash
 * rather than as digits, which keeps it from being grep-able in the bundle —
 * though a seven-digit number falls to a laptop in seconds, so treat even that
 * as tidiness rather than defence.
 *
 * Making this genuinely private means moving the read behind an edge function
 * holding a server-side secret and revoking the anon grants, at which point
 * the passcode becomes a real credential. That is a different piece of work,
 * and it is the one to do if these numbers ever stop being ones you'd shrug at
 * someone seeing.
 *
 * Nothing on this page identifies a donor. There is no column for it.
 */
const PASS_HASH = "bcb800ff8cb7a3f9d25a44e3370151cc9e66e68e4455780618e896fb003eee49";
const UNLOCKED = "ripple.inside.v1";

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

  const [unlocked, setUnlocked] = useState(() => {
    try {
      return window.sessionStorage.getItem(UNLOCKED) === "1";
    } catch {
      return false;
    }
  });
  const [entry, setEntry] = useState("");
  const [wrong, setWrong] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (!unlocked) return;
    let alive = true;
    setLoading(true);
    fetchInsideStats()
      .then((s) => alive && setStats(s))
      .catch(() => alive && setStats({ error: "Could not reach Supabase.", sources: [], causes: [] }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [unlocked]);

  async function submit(e) {
    e.preventDefault();
    const ok = (await sha256(entry.trim())) === PASS_HASH;
    setWrong(!ok);
    if (!ok) return;
    try {
      window.sessionStorage.setItem(UNLOCKED, "1");
    } catch {
      /* the page still unlocks for this render */
    }
    setUnlocked(true);
  }

  if (!unlocked) {
    return (
      <section className="section">
        <div className="wrap wrap--narrow inside__gate">
          <h1>Numbers</h1>
          <form onSubmit={submit} className="inside__form">
            <label htmlFor="inside-pass">Passcode</label>
            <input
              id="inside-pass"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={entry}
              onChange={(e) => {
                setEntry(e.target.value);
                setWrong(false);
              }}
            />
            <button type="submit" className="btn btn--primary">
              Show
            </button>
          </form>
          {wrong && (
            <p className="inside__wrong" role="alert">
              That isn't it.
            </p>
          )}
        </div>
      </section>
    );
  }

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

            {/* The caveats belong on the page, not in a message that scrolls
                away. Every number above is a floor, and two of them are a
                different kind of number from the third. */}
            <h2>What these numbers are not</h2>
            <ul className="inside__caveats">
              <li>
                <strong>Gifts and amounts are verified.</strong> They arrive on
                Every.org's webhook with a charge id.
              </li>
              <li>
                <strong>Arrivals are not.</strong> They're counted from the
                browser through a function the public key may call, so they can
                be inflated by anyone who reads the bundle. Read them as an
                indicator, not evidence.
              </li>
              <li>
                <strong>Everything here is a floor.</strong> Only donations
                routed through Every.org report back. Safe water and syphilis in
                pregnancy are direct-only, and every cause page also offers the
                charity's own donation page — gifts made either way reach the
                charity and never appear above.
              </li>
              <li>
                An arrival is counted once per visit, not per page, so someone
                reading four causes is one arrival.
              </li>
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
