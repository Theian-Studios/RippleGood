import { Link } from "react-router-dom";
import { usePageMeta } from "../lib/usePageMeta.js";

export default function About() {
  usePageMeta(
    "About",
    "Ripple Good exists to close the gap between wanting to help and knowing where to send it. One evidence-backed pick per cause, with the math shown.",
  );

  return (
    <>
      <section className="pageHead">
        <div className="wrap wrap--narrow">
          <p className="eyebrow">About</p>
          <h1>
            Don't just donate. <span className="mark">Make the biggest ripple.</span>
          </h1>
          <p>
            We connect your generosity to the charities proven to create the most
            impact — backed by evidence, focused on outcomes, and driven by the
            simple idea that where you give matters as much as whether you do.
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap wrap--narrow prose">
          <h2>The gap we're trying to close</h2>
          <p>
            Almost everyone wants to help. Far fewer know where to send the money — and
            the honest reason is that finding out is years of work, across dozens of
            causes. So most giving goes to whoever asked most recently.
          </p>
          <p>
            Meanwhile, the research is unambiguous about one thing: the difference
            between an average charity and the best-evidenced one in the same cause is
            not marginal. It can be a factor of a hundred. That gap is the whole reason
            this site exists.
          </p>

          <h2>What we do about it</h2>
          <p>
            We read the evaluators — <Link to="/methodology">GiveWell, Animal Charity
            Evaluators, Giving Green</Link> — and translate their research into one
            clear pick per cause, phrased as what actually happens rather than what it
            costs. The feeling is on the surface. The math is one click underneath, in
            full, including what could be wrong with it.
          </p>
          <p>
            We start from the cause <em>you</em> already care about, because effective
            giving shouldn't require you to abandon what moves you. It should just point
            you at the strongest option inside it.
          </p>

          <h2>
            What we are <span className="mark">not</span>
          </h2>
          <p>
            We are not a charity evaluator, and we're not a payment processor. We don't
            originate research, and we never touch your money — every donate button on
            this site is a plain outbound link to the charity's own donation page. If
            Ripple Good disappeared tomorrow, every organization we recommend would still be
            there, and the research behind them would still be public. That's by design.
          </p>

          {/* VERIFY: replace this section with your real name, affiliation, funding
              situation, and a contact address before launch. A site asking people to
              redirect their giving should say plainly who is behind it — the "who runs
              this" question is the first thing a skeptical reader looks for. */}
          <h2>Who's behind this</h2>
          <p>
            Ripple Good is an independent project. We take no money from the charities listed
            here, and no recommendation on this site can be bought or sponsored.
          </p>
          <p>
            Questions, corrections, or a cause you think we should cover:{" "}
            <a href="mailto:hello@ripple-good.org">hello@ripple-good.org</a>.
          </p>

          <p style={{ marginTop: 30 }}>
            <Link to="/#causes" className="btn btn--primary">
              Pick your cause
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
