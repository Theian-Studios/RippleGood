import { Link } from "react-router-dom";
import { usePageMeta } from "../lib/usePageMeta.js";

export default function About() {
  usePageMeta(
    "Where you give matters more than how much",
    "Ripple Good exists to close the gap between wanting to help and knowing where to send it. One evidence-backed pick per cause, with the math shown.",
  );

  return (
    <>
      <section className="pageHead">
        <div className="wrap wrap--narrow">
          <p className="eyebrow">About</p>
          <h1>
            Where you give matters <span className="mark">more than how much.</span>
          </h1>
          <p>
            The gap between an average charity and the best-evidenced one in the
            same cause is not marginal. This site exists to close the distance
            between wanting to help and knowing where to send it.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap wrap--narrow prose">
          <h2>The gap we're trying to close</h2>
          <p>
            Almost everyone wants to help. Far fewer know where to send the money,
            because finding out is years of work across dozens of causes. So most
            giving goes to whoever asked most recently.
          </p>
          <p>
            Meanwhile, the research is unambiguous about one thing: the difference
            between an average charity and the best-evidenced one in the same cause is
            not marginal. The best options can be on the order of{" "}
            <Link to="/methodology#the-100x-claim">100x the median</Link>. That gap is
            the whole reason this site exists.
          </p>

          <h2>What we do about it</h2>
          <p>
            We read the evaluators, <Link to="/methodology">GiveWell, Animal Charity
            Evaluators and Giving Green</Link>, and translate their research into one
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
            originate research, and we never touch your money. Every donate button is
            an outbound link, either to the charity's own donation page or to
            Every.org, a nonprofit that receives the gift and grants it on; every
            cause page offers both and says which is which. If
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

          <p className="u-mt-6">
            <Link to="/#causes" className="btn btn--primary">
              Pick your cause
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
