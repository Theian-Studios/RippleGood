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
 * Step one is written for someone who has already scrolled past the grid,
 * because they have: the causes come first now, and being told to "choose your
 * cause" after choosing one reads as a page that isn't watching.
 */
const STEPS = [
  {
    title: "Start from the cause you already care about",
    body: "The eight above. Effective giving shouldn't ask you to swap your values for someone else's.",
  },
  {
    title: "See what your gift does",
    body: "Nets, medicine, vitamin A, cash, each with its cost figure and the evaluator behind it.",
  },
  {
    title: "Give, and keep going",
    body: "The money moves on the charity's own site, or through Every.org. We never touch it.",
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
            <p className="eyebrow">The most good for every dollar.</p>
            <h1>
              Don't just donate.
              <br />
              <span className="hero__accent">Make the biggest ripple.</span>
            </h1>
            {/* This line was buried on the methodology page and is the sharpest
                thing the site says about itself. The old one — "charities
                proven to create the most impact" — claimed more certainty than
                any page underneath it does. */}
            <p className="hero__sub">
              Most effective-giving sites ask you to reorder your values, then
              hand you a global health charity. We don't. You pick the cause;
              we name the strongest evidence inside it.
            </p>

            <div className="hero__actions">
              <Link to="/#causes" className="btn btn--primary btn--lg">
                Pick your cause
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
        <HeroCurve />
      </section>

      {/* The product, immediately. The argument used to sit here — 400 words
          before anyone could see what the site actually offered, which the
          hero button then jumped straight past. If the button has to skip your
          copy, the copy is in the wrong place. */}
      <section className="section section--tight" id="causes">
        <div className="wrap">
          <div className="sectionHead sectionHead--centered">
            <h2>Pick your cause</h2>
          </div>

          <div className="causeGrid" ref={gridRef}>
            {charities.map((charity) => (
              <CauseCard charity={charity} key={charity.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap wrap--narrow aboutIntro">
          <div className="sectionHead sectionHead--centered">
            <h2>Why the choice matters more than the amount</h2>
          </div>

          <p>
            Not all charities are created equal. Two organizations working on
            the same problem can differ enormously in how much good they do with
            the same dollar, and the difference is rarely the thing people look
            at.
          </p>

          <p>Every donation is really three numbers multiplied together:</p>

          {/* list-style is off, so role="list" keeps the semantics VoiceOver
              would otherwise drop. The numerals come from a counter and stay
              visible: the copy below refers to the factors by number. */}
          <ol className="factors" role="list">
            <li>
              <strong>Amount</strong>
              How much you give. This one is obvious, and it's the only one most
              people think about.
            </li>
            <li>
              {/* Named Efficiency, not Effectiveness. Every other page on this
                  site — and the share description — uses "effective" to mean
                  impact, so using it here for the overhead ratio we're telling
                  people to stop trusting inverted the word twice on one site. */}
              <strong>Efficiency</strong>
              How tightly the organization runs: program spending versus
              overhead, the cost to raise $100. This is what Charity Navigator
              and CharityWatch largely measure. It answers a real question, but
              says nothing about whether the programs work.
            </li>
            <li>
              <strong>Impact</strong>
              What a dollar actually buys: lives saved, children protected,
              years of schooling gained. This is what GiveWell, Animal Charity
              Evaluators and Giving Green measure through randomized trials and
              outcome research, and it is where the differences get enormous.
            </li>
          </ol>

          <p>
            The public conversation is dominated by the second one. Nearly all
            the real-world good comes from the third, where the best options can
            be on the order of{" "}
            <Link to="/methodology#the-100x-claim">100x the median</Link>, an
            order-of-magnitude claim that is sourced and qualified on the
            methodology page.
          </p>
          <p>
            That gap is why Ripple Good exists. Rigorous impact research is
            scattered across separate evaluators, each covering its own corner
            of the world, and almost none of it reaches the person deciding
            where to send $50 at the end of the year. We pull the best
            evidence-backed picks together across every major cause: global
            health, extreme poverty, climate, animal welfare.
          </p>
          <p>
            {/* The name, explained once. It was used as a noun and a verb
                across four surfaces and never defined on any of them. */}
            The ripple is the part you don't see: the child who doesn't get
            malaria doesn't miss school, and the effect keeps spreading long
            after the gift.
          </p>

          <p className="aboutIntro__cta">
            <Link to="/about" className="btn btn--primary">
              More about why we built this
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>

      <section className="section section--steps">
        <div className="wrap wrap--narrow">
          <div className="sectionHead sectionHead--centered">
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
              Charity Evaluators, Giving Green and Founders Pledge spend years
              on questions we could never answer alone, so every pick here names
              the evaluator behind it, shows the real cost figures, and says
              what could be wrong with them.
            </p>
            <p>
              Every dollar figure is an <strong>average program cost</strong>,
              not a promise about your particular gift. Charities pool
              donations; the figure is what it has cost, on average, to produce
              that outcome.
            </p>
          </HomePanel>
        </div>
      </section>

      {/* Renders itself only once there is a figure worth showing. */}
      <VerifiedTotal />
    </>
  );
}
