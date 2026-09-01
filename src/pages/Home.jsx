import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CauseCard from "../components/CauseCard.jsx";
import HeroCurve from "../components/HeroCurve.jsx";
import HomePanel from "../components/HomePanel.jsx";
import Wallpaper from "../components/Wallpaper.jsx";
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
    body: "Clean water, meals, medicine, school, each with its cost figure and the evaluator behind it.",
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
              <span className="hero__accent">Make the biggest ripple.</span>
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

      {/* Prose, not a card. Above the cause grid a bordered panel competes with
          the eight cards below it and reads as a widget; the site's argument
          should read as an argument. The three factors are a band rather than a
          long list so it stays scannable ahead of the primary action. */}
      <section className="section section--tight">
        <div className="wrap wrap--narrow aboutIntro">
          <div className="sectionHead sectionHead--centred">
            <h2>About Ripple Good</h2>
          </div>

          <p>
            Not all charities are created equal. Two organizations working on the
            same problem can differ enormously in how much good they do with the
            same dollar — and the difference is rarely the thing people look at.
          </p>

          <p>Every donation is really three numbers multiplied together:</p>

          {/* list-style is off, so role="list" keeps the semantics VoiceOver
              would otherwise drop. The numerals come from a counter and stay
              visible: the copy below refers to "factor two" and "factor three". */}
          <ol className="factors" role="list">
            <li>
              <strong>Amount</strong>
              How much you give. This one is obvious, and it's the only one most
              people think about.
            </li>
            <li>
              <strong>Effectiveness</strong>
              How efficiently the organization runs: program spending versus
              overhead, the cost to raise $100. This is what Charity Navigator
              and CharityWatch largely measure. It answers a real question, but
              says nothing about whether the programs work.
            </li>
            <li>
              <strong>Impact</strong>
              What a dollar actually buys: lives saved, children protected, years
              of schooling gained. This is what GiveWell, Animal Charity
              Evaluators and Giving Green measure through randomized trials and
              outcome research. It is also where the differences get enormous. Two
              charities with identical 85% program ratios can differ a
              hundredfold here.
            </li>
          </ol>

          <p>
            The public conversation is dominated by factor two. Nearly all the
            real-world good comes from factor three.
          </p>
          <p>
            That gap is why Ripple Good exists. Rigorous impact research is
            scattered across separate evaluators, each covering its own corner of
            the world, and almost none of it reaches the person deciding where to
            send $50 at the end of the year. Ripple Good is among the first sites
            built to close that gap: one place that pulls the best evidence-backed
            picks together across every major cause: global health and poverty,
            education, climate, animal welfare.
          </p>
          <p>
            Pick the cause that matters to you. We'll show you the most impactful
            organization working on it, and what your money actually buys there.
          </p>

          <p className="aboutIntro__sign">
            Don't just donate. <span className="mark">Make the biggest ripple.</span>
          </p>

          <Link to="/about" className="btn btn--primary">
            Learn more
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="section section--tight section--textured" id="causes">
        <Wallpaper />
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
          <div className="sectionHead sectionHead--centred">
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
              We don't run the research. We translate it. GiveWell, Animal
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
