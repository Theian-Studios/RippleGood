import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gift,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import CauseCard from "../components/CauseCard.jsx";
import HeroCurve from "../components/HeroCurve.jsx";
import VerifiedTotal from "../components/VerifiedTotal.jsx";
import { charities } from "../data/charities.js";
import { money } from "../lib/format.js";
import { useTally } from "../lib/tally.js";
import { usePageMeta } from "../lib/usePageMeta.js";
import { useReveal } from "../lib/useReveal.js";

/** The three tools, shown under the cause grid. */
const TOOLS = [
  {
    to: "/quiz",
    icon: Sparkles,
    title: "Don't know where to start",
    body: "Four questions about what you value. It ends at a cause, not a lecture.",
    cta: "Answer four questions",
  },
  {
    to: "/plan",
    icon: SlidersHorizontal,
    title: "You care about more than one",
    body: "Split a budget across causes and watch the whole plan add up.",
    cta: "Build a plan",
  },
  {
    to: "/honor",
    icon: Gift,
    title: "A gift for someone else",
    body: "Birthdays, memorials, thank-yous — a card that says what the gift actually did.",
    cta: "Make a card",
  },
];

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
  const { total, entries } = useTally();
  const gridRef = useReveal();

  usePageMeta(
    null,
    "The most effective charities are roughly 100x more impactful than typical ones. Find the best-evidenced one in the cause you already care about.",
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
          <div className="sectionHead">
            <h2>Pick Your Cause</h2>
          </div>

          <div className="causeGrid" ref={gridRef}>
            {charities.map((charity) => (
              <CauseCard charity={charity} key={charity.id} />
            ))}
          </div>

          <div className="tools">
            {TOOLS.map(({ to, icon: Icon, title, body, cta }) => (
              <Link to={to} className="tool" key={to}>
                <span className="tile tile--sm">
                  <Icon size={21} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="tool__title">{title}</span>
                <span className="tool__body">{body}</span>
                <span className="causeCard__go">
                  {cta}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
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

      {/* Only appears once you've logged something — an empty tally strip on a
          first visit would be clutter advertising a feature you can't use yet. */}
      {entries.length > 0 && (
        <section className="section section--tight">
          <div className="wrap">
            <Link to="/my-impact" className="tallyStrip">
              <span>
                You've logged <strong>{money(total)}</strong> across {entries.length}{" "}
                {entries.length === 1 ? "gift" : "gifts"} — privately, in this browser.
              </span>
              <span className="causeCard__go">
                See your impact
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* The public counterpart to the private strip above: renders itself only
          once there is a figure worth showing. */}
      <VerifiedTotal />

      <section className="section section--mist">
        <div className="wrap wrap--narrow" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.1rem)" }}>
            Feeling on the surface. Math underneath.
          </h2>
          <p style={{ marginTop: 16, color: "var(--ink-soft)" }}>
            We don't run the research. We translate it. GiveWell, Animal Charity
            Evaluators, Giving Green and Founders Pledge spend years on questions we
            could never answer alone — so every pick here names the evaluator behind
            it, shows the real cost figures, and says what could be wrong with them.
          </p>
          <Link
            to="/methodology"
            className="btn btn--primary"
            style={{ marginTop: 26 }}
          >
            Read our methodology
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
