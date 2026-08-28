import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CauseCard from "../components/CauseCard.jsx";
import HeroCurve from "../components/HeroCurve.jsx";
import HomePanel from "../components/HomePanel.jsx";
import VerifiedTotal from "../components/VerifiedTotal.jsx";
import { charities } from "../data/charities.js";
import { usePageMeta } from "../lib/usePageMeta.js";
import { useReveal } from "../lib/useReveal.js";

/**
 * The brand sheet's three steps. Step two is reworded: the original reads
 * "Donate life changing gifts", and we don't take donations — the gift happens
 * on the charity's own site. Everything else is theirs.
 */
const STEPS = [
  {
    title: "Choose your cause",
    body: "Explore evidence-backed picks and find the cause you care about most.",
  },
  {
    title: "See what your gift does",
    body: "Clean water, meals, medicine, school — with the cost figure and the evaluator behind every claim.",
  },
  {
    title: "Create a ripple",
    body: "Give on the charity's own site. Your generosity keeps working long after the click.",
  },
];

export default function Home() {
  const gridRef = useReveal();

  usePageMeta(
    null,
    "One evidence-backed charity per cause, with the cost figures and the evaluator behind every claim. Start from the cause you already care about.",
  );

  return (
    <>
      <section className="hero hero--dark onDark">
        <div className="wrap">
          <div className="hero__inner">
            {/* VERIFY: the brand sheet's tagline is "Dozens of charities. One
                biggest ripple." We list eight causes, so "dozens" would be the
                one overstatement on a site built to avoid them. Swap it back the
                day the count earns it. */}
            <p className="eyebrow">The most good for every dollar.</p>
            <h1>
              Don't just donate.
              <br />
              Make the <span className="hero__accent">biggest ripple.</span>
            </h1>
            <p className="hero__sub">
              We connect your generosity to the charities proven to create the most
              impact.
            </p>

            <div className="hero__actions">
              {/* The label is a brand phrase rather than a destination, so the
                  accessible name says where the button actually goes. */}
              <Link
                to="/#causes"
                className="btn btn--primary btn--lg"
                aria-label="Choose your ripple — pick your cause"
              >
                Choose Your Ripple
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
            </div>

          </div>
        </div>
        <HeroCurve />
      </section>

      <section className="section section--tight" id="causes">
        <div className="wrap">
          <div className="sectionHead sectionHead--centred">
            <h2>Pick Your Cause</h2>
          </div>

          <div className="causeGrid" ref={gridRef}>
            {charities.map((charity) => (
              <CauseCard charity={charity} key={charity.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--steps">
        <div className="wrap wrap--narrow">
          <div className="sectionHead" style={{ textAlign: "center", margin: "0 auto 34px" }}>
            <h2>How it works</h2>
          </div>

          <ol className="steps steps--numbered">
            {STEPS.map(({ title, body }, i) => (
              <li className="stepRow" key={title}>
                <span className="stepRow__num" aria-hidden="true">
                  {i + 1}
                </span>
                <span>
                  <span className="stepRow__title">{title}</span>
                  <span className="stepRow__body">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Both closed by default: someone who came to pick a cause shouldn't have
          to scroll past us explaining ourselves to reach one. */}
      <section className="section section--tight">
        <div className="wrap wrap--narrow">
          <HomePanel
            title="About"
            blurb="Why this site exists."
            cta={
              <Link to="/about" className="btn btn--primary">
                Learn more
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            }
          >
            <p>
              Almost everyone wants to help. Far fewer know where to send the
              money — the honest reason being that finding out is years of work
              across dozens of causes. So most giving goes to whoever asked most
              recently.
            </p>
            <p>
              The research is unambiguous about one thing: the gap between an
              average charity and the best-evidenced one in the same cause is not
              marginal. That gap is the whole reason this site exists.
            </p>
            <p>
              We read the evaluators and translate their research into one clear
              pick per cause, phrased as what actually happens rather than what it
              costs — starting from the cause <em>you</em> already care about,
              because effective giving shouldn't ask you to abandon what moves
              you.
            </p>
            <p>
              Evaluators publish deep research one cause at a time. A pioneering
              site, Ripple Good carries their strongest pick across many different
              causes at once — global health, climate, animal welfare and more in
              one place — so you can start from the thing you already care about
              rather than from a spreadsheet.
            </p>
          </HomePanel>

          <HomePanel
            title="Methodology"
            blurb="How a pick gets made, and what our figures mean."
            cta={
              <Link to="/methodology" className="btn btn--primary">
                Read the full methodology
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            }
          >
            <p>
              We don't run the research — we translate it. GiveWell, Animal
              Charity Evaluators, Giving Green and Founders Pledge spend years on
              questions we could never answer alone, so every pick here names the
              evaluator behind it, shows the real cost figures, and says what
              could be wrong with them.
            </p>
            <p>
              Every dollar figure is an <strong>average program cost</strong>, not
              a promise about your particular gift. Charities pool donations; the
              figure is what it has cost, on average, to produce that outcome.
            </p>
            <p>
              Where we haven't yet checked a cause's numbers against the
              evaluator's published research, the cause page says so in a banner
              at the top, and keeps saying so until the check is done.
            </p>
          </HomePanel>
        </div>
      </section>

      {/* Renders itself only once there is a figure worth showing. */}
      <VerifiedTotal />
    </>
  );
}
