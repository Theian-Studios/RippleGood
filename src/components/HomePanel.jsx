/**
 * A section on the home page: a heading, a one-line summary, and its body.
 *
 * This was a disclosure. It isn't any more — no toggle, no chevron, no hidden
 * state, so there is nothing to click and nothing to miss. Anything worth
 * putting behind a click on this page belongs on its own page instead, which is
 * what the links at the foot of each panel are for.
 */
export default function HomePanel({ title, blurb, children, cta }) {
  return (
    <section className="homePanel">
      <div className="homePanel__head">
        <h2 className="homePanel__title">{title}</h2>
        <p className="homePanel__blurb">{blurb}</p>
      </div>

      <div className="homePanel__body">
        {children}
        {cta}
      </div>
    </section>
  );
}
