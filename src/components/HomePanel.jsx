/**
 * A section on the home page: a heading, a one-line summary, and its body.
 * Nothing is hidden behind a toggle; anything that would be belongs on its own
 * page, which is what the link at the foot is for.
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
