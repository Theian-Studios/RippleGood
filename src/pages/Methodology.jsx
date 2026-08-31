import { Link } from "react-router-dom";
import { CalendarClock, ExternalLink, Scale } from "lucide-react";
import { AVERAGE_COST_DISCLAIMER, charities, evaluators } from "../data/charities.js";
import { longDate } from "../lib/format.js";
import { usePageMeta } from "../lib/usePageMeta.js";

/**
 * The most recent verification date across all causes, shown as the freshness
 * mark. Unchecked causes carry a null lastVerified and are filtered out first —
 * a default sort stringifies, so "null" would sort above every real date and
 * become the answer.
 */
function lastReview() {
  return charities
    .map((c) => c.lastVerified)
    .filter(Boolean)
    .sort()
    .at(-1);
}

export default function Methodology() {
  usePageMeta(
    "Methodology",
    "How Ripple Good picks one charity per cause, which evaluators we rely on, what our dollar figures do and don't mean, and how often we re-check them.",
  );

  return (
    <>
      <section className="pageHead">
        <div className="wrap wrap--narrow">
          <p className="eyebrow">Methodology</p>
          <h1>
            How we pick, and <span className="mark">what we don't do.</span>
          </h1>
          <p>
            Ripple Good is a translation layer, not a research institute. Everything below is
            meant to let you check us — or skip us entirely and go straight to the
            people whose work this rests on.
          </p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap wrap--narrow prose">
          <h2>How a pick gets made</h2>
          <div className="steps">
            <div className="step">
              <h3>Start from the cause, not the charity</h3>
              <p>
                Most effective-giving sites ask you to reorder your values, then hand
                you a global health charity. We don't. You already care about
                something. The question we answer is which organization inside{" "}
                <em>that</em> cause has the strongest evidence behind it.
              </p>
            </div>
            <div className="step">
              <h3>Defer to the specialist evaluator</h3>
              <p>
                For each cause we identify the organization doing the most rigorous
                public cost-effectiveness research in that domain, and we take their
                current recommendation. We do not run our own charity evaluations, and
                we would be worse at it than they are.
              </p>
            </div>
            <div className="step">
              <h3>Name one, not a shortlist</h3>
              <p>
                A list of twelve options is a way of avoiding the decision. We publish a
                single pick per cause, with the evaluator's name attached, so the
                recommendation can be argued with. If we're wrong, we're wrong
                specifically.
              </p>
            </div>
            <div className="step">
              <h3>Translate the number into an outcome</h3>
              <p>
                We take the evaluator's published cost figures and phrase them as what
                actually happens: nets hung, seasons covered, hens out of cages. The
                dollar amount stays on the page, in smaller type, next to the source it
                came from.
              </p>
            </div>
          </div>

          <h2 id="the-100x-claim">The "~100x" on our front page</h2>
          <p>
            It's the biggest claim on this site, so it gets a source like every other
            one. The best evidence comes from global health, where cost-effectiveness
            has been measured across hundreds of interventions: in the Disease Control
            Priorities data, the spread between the least and most effective
            interventions covered roughly <strong>four orders of magnitude</strong>,
            and the best interventions were on the order of{" "}
            <strong>100x more cost-effective than the median</strong>. Toby Ord's
            essay{" "}
            <a
              href="https://www.cgdev.org/publication/moral-imperative-toward-cost-effectiveness-global-health"
              target="_blank"
              rel="noopener noreferrer"
            >
              "The Moral Imperative toward Cost-Effectiveness in Global Health"
            </a>{" "}
            {/* VERIFY: re-read the essay and confirm this link and the "~100x vs
                median" characterisation before launch — don't let the summary
                drift stronger than the source. */}
            is the classic treatment of that data, and it's where our framing comes
            from.
          </p>
          <p>
            Two honest limits. First, that spread is measured across{" "}
            <em>interventions</em>, not charity ratings — we use it as evidence about
            how wide the distribution is, and rely on the evaluators to find the
            organizations at its top end. Second, the measurement is sharpest in
            global health; for causes like animal welfare and climate, "the best is
            roughly 100x the typical" is an extrapolation from thinner data, not a
            replicated result. We think the direction and rough scale hold — it's why
            this site exists — but the number is an order-of-magnitude claim, not a
            constant of nature.
          </p>

          <h2>Who we rely on</h2>
          <p>
            These organizations do the work. We aggregate it, credit it, and link
            straight to it. If you only take one thing from this site, take their names.
          </p>
          <div className="evaluatorList">
            {evaluators.map((e) => (
              <div className="evaluatorCard" key={e.id}>
                <div className="evaluatorCard__top">
                  <span className="evaluatorCard__name">{e.name}</span>
                  <span className="evaluatorCard__focus">{e.focus}</span>
                </div>
                <p>{e.description}</p>
                <a href={e.url} target="_blank" rel="noopener noreferrer">
                  Visit {e.name}
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>

          <h2 id="language">What our dollar figures mean</h2>
          <div className="note">
            <Scale size={19} aria-hidden="true" />
            <span>
              <strong>These are average program costs, not price tags.</strong>{" "}
              {AVERAGE_COST_DISCLAIMER.replace(
                "These are average program costs, not price tags. ",
                "",
              )}
            </span>
          </div>
          <p className="u-mt-5">
            That's why the language on this site is careful in a specific way. We write{" "}
            <strong>"provides"</strong>, <strong>"funds"</strong>, and{" "}
            <strong>"delivers"</strong>. We never write "buys this exact pill" or "your
            $6 sent this net to this child," because no honest accounting can trace one
            donation to one item. Charities that talk that way are describing a feeling,
            not a transaction.
          </p>
          <p>
            Cost-effectiveness estimates are also <strong>ranges with error bars</strong>,
            not settled facts. Where an evaluator publishes a range, we show the range.
            Where a figure is the charity's own estimate rather than an independent one
            — as with The Humane League's hens-per-dollar number — we say so on the page.
          </p>

          <h2>How often we re-check</h2>
          <p>
            Every figure on this site carries the date it was last checked against its
            source, shown inside each cause's "How we know" panel. Our commitment:
          </p>
          <ul>
            <li>
              <strong>Quarterly:</strong> we re-check every cost figure and every
              recommendation against the evaluator's current published research.
            </li>
            <li>
              <strong>Within 30 days:</strong> if an evaluator drops or replaces a
              recommendation, we change the pick or take the cause down.
            </li>
            <li>
              <strong>Immediately:</strong> if a figure turns out to be wrong, we correct
              it and note that we did — rather than quietly editing the page.
            </li>
          </ul>
          <p className="handoff u-mt-5">
            <CalendarClock size={16} aria-hidden="true" />
            <span>Figures across the site last reviewed {longDate(lastReview())}.</span>
          </p>

          <h2>What we don't do</h2>
          {/* The mark as a list marker: these are the crossings-out. */}
          <ul className="xlist">
            <li>
              <strong>We never handle your money.</strong> No payment is processed on
              this site. Every donate button is an outbound link — either to the
              charity's own donation page, or to{" "}
              <a href="https://www.every.org/" target="_blank" rel="noopener noreferrer">
                Every.org
              </a>
              , a nonprofit that receives the donation and grants it on to the
              charity. Every cause page offers both routes, and says which is which.
              We take no cut from either, and we never see the transaction.
            </li>
            <li>
              <strong>We don't originate research.</strong> Every claim here traces to a
              published evaluation by someone else, linked on the page.
            </li>
            <li>
              <strong>We don't take money from the charities we list.</strong> A
              recommendation cannot be bought here.
            </li>
            <li>
              <strong>We don't pretend the hard comparisons are easy.</strong> Weighing
              a hen against a child, or a policy campaign against a bed net, requires
              value judgments that no spreadsheet settles. We show our reasoning and let
              you disagree with it.
            </li>
          </ul>

          <h2>Common questions</h2>

          <h3>Is my donation tax-deductible?</h3>
          <p>
            Often, but it depends on the charity and on where you pay tax — several of
            these organizations are registered charities in multiple countries, with
            different entities for different donors. The charity's own donation page
            is the authoritative answer, and since you give there directly, nothing
            about using Ripple Good changes your tax situation in either direction.
            {/* VERIFY: keep this generic — do not name specific 501(c)(3) statuses
                here without checking each charity's current registrations. */}
          </p>

          <h3>Can I give monthly?</h3>
          <p>
            Yes — set it up on the charity's donation page when you land there.
            {/* VERIFY: confirm every donate page actually offers a recurring
                option before promising this. */}{" "}
            Steady monthly funding is genuinely worth more to these organizations than
            the same total in one-off spikes: it's what lets them sign contracts for
            next year's distributions.
          </p>

          <h3>Why isn't my favorite charity here?</h3>
          <p>
            One of two honest reasons: either no rigorous public evaluation of it
            exists, or its evaluator's numbers put another organization ahead within
            the same cause. Neither means your charity does no good — this site ranks
            by measured cost-effectiveness, which is a narrower question than whether
            an organization is worthwhile. If you think we've missed an evaluation
            that should change a pick, tell us below.
          </p>

          <h3>Do you earn anything when I give?</h3>
          <p>
            No. No referral fees, no affiliate links, no payments from the charities,
            no cut of any donation — the donate buttons are plain links. Nobody can
            pay to be listed here, and nobody pays us when you give.
          </p>

          <h3>What is Every.org, and why is it an option?</h3>
          <p>
            Every.org is a US nonprofit that processes donations for other nonprofits
            free of charge. Sending you there lets us carry the amount you picked
            across, so you don't have to retype it, and it accepts bank transfer,
            PayPal, Apple Pay and donor-advised funds as well as cards.
          </p>
          <p>
            The trade-offs, plainly: the money goes to Every.org first and is granted
            on to the charity, your tax receipt comes from Every.org rather than the
            charity, and at checkout Every.org suggests an optional contribution to
            itself on top of your gift — <strong>which you can set to zero</strong>.
            Some employer matching schemes also decline gifts made through an
            intermediary. That's why every cause page keeps the charity's own donation
            page as an equally visible second option, and why we've left our{" "}
            <Link to="/cause/climate">climate pick</Link> as direct-only: the entity
            listed on Every.org there is Giving Green's research organization, not the
            regranting fund we actually recommend.
          </p>

          <h2>Think we got one wrong?</h2>
          <p>
            Good — tell us. The point of naming a single pick and showing the arithmetic
            is that both can be challenged. Email{" "}
            <a href="mailto:hello@ripple-good.org">hello@ripple-good.org</a>{" "}
            {/* VERIFY: set up this mailbox, or swap in a real contact address, before launch. */}
            with the cause and what you think we've missed.
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
