import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, ChevronDown, ExternalLink, FlaskConical, Info, Scale } from "lucide-react";
import FreshnessBadge from "./FreshnessBadge.jsx";
import { charities } from "../data/charities.js";
import { money } from "../lib/format.js";

/**
 * The rigorous half of "feeling on the surface, math underneath."
 *
 * A disclosure rather than an always-open block: the emotional claim leads, and
 * the reader who wants the arithmetic is one click from all of it — the actual
 * cost figures, who produced them, how the estimate is built, and what could be
 * wrong with it. The caveats are not softened; a claim you can't check is just
 * an advertisement.
 *
 * Open state is owned by the page so the "How we know" footnote next to the
 * headline can open this and scroll to it.
 */
/**
 * A range drawn instead of written. "$1,000-$8,500" is a pair of numbers most
 * readers slide past; the same thing as a bar shows how wide the uncertainty
 * is at a glance, with the average marked on it.
 */
function RangeBar({ range, point }) {
  const span = range.high - range.low;
  const at = point ? ((point - range.low) / span) * 100 : null;
  return (
    <div className="rangeBar">
      <div className="rangeBar__track">
        <div className="rangeBar__span" />
        {at !== null && (
          <div className="rangeBar__point" style={{ left: `${at}%` }} />
        )}
      </div>
      <div className="rangeBar__ends">
        <span>{money(range.low)}</span>
        <span>{money(range.high)}</span>
      </div>
    </div>
  );
}

const EvidenceCard = forwardRef(function EvidenceCard({ charity, open, onToggle }, ref) {
  const panelId = `evidence-${charity.id}`;

  // Every cause whose evaluator publishes the same figure on the same scale.
  const siblings = charities
    .map((c) => {
      const f = c.costFigures.find((x) => x.comparable);
      return f ? { id: c.id, category: c.category, figure: f.comparable } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.figure - b.figure);
  const widest = Math.max(...siblings.map((s) => s.figure), 1);
  const isSibling = siblings.some((s) => s.id === charity.id);

  return (
    <section className="evidence" ref={ref} aria-labelledby={`${panelId}-title`}>
      <button
        type="button"
        className="evidence__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="evidence__title" id={`${panelId}-title`}>
          <FlaskConical size={21} aria-hidden="true" />
          Why this charity
        </span>
        <ChevronDown className="evidence__chevron" size={22} aria-hidden="true" />
      </button>

      <div id={panelId} className="evidence__body" hidden={!open}>
        {/* Who made the call, first. It used to sit on the page between the
            button and this panel as a line on its own. */}
        <a
          className="evaluatorChip"
          href={charity.evaluatorUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <BadgeCheck size={18} aria-hidden="true" />
          <span>
            <strong>{charity.evaluator}</strong>: {charity.evaluatorNote}
          </span>
        </a>

        {/* The caveat about the figures sits with the figures. It used to sit
            between the tiers and the button, where it was the only thing on
            the giving block that wasn't a choice or an action. */}
        {charity.estimateNote && (
          <p className="evidence__note">
            <Info size={15} aria-hidden="true" />
            <span>{charity.estimateNote}</span>
          </p>
        )}

        <div className="evidence__block">
          <h3 className="evidence__h">The figures</h3>
          <div className="figures">
            {charity.costFigures.map((f) => (
              <div className="figure" key={f.label}>
                <div className="figure__value">{f.value}</div>
                <div className="figure__label">{f.label}</div>
                {f.range && <RangeBar range={f.range} point={f.comparable} />}
                <div className="figure__source">{f.source}</div>
              </div>
            ))}
          </div>
        </div>

        {isSibling && siblings.length > 1 && (
          <div className="evidence__block">
            <h3 className="evidence__h">The same figure, across GiveWell's picks</h3>
            {/* Not a ranking, and not a shortlist to choose from — the pick on
                this page is still the pick. It is the one comparison GiveWell
                publishes on a single scale, and seeing it makes the number
                above mean something instead of floating on its own. */}
            <ul className="compare" role="list">
              {siblings.map((sib) => (
                <li
                  className={`compare__row${sib.id === charity.id ? " is-self" : ""}`}
                  key={sib.id}
                >
                  <span className="compare__name">{sib.category}</span>
                  <span className="compare__track" aria-hidden="true">
                    <span
                      className="compare__fill"
                      style={{ width: `${(sib.figure / widest) * 100}%` }}
                    />
                  </span>
                  <span className="compare__value">{money(sib.figure)}</span>
                </li>
              ))}
            </ul>
            <p className="compare__note">
              Lower is cheaper per life saved. All of them sit far inside
              GiveWell's funding bar; the spread between them is small next to
              the spread between any of them and an unevaluated charity.
            </p>
          </div>
        )}

        <div className="evidence__block">
          <h3 className="evidence__h">What {charity.name} does</h3>
          <p>{charity.evidenceNotes.whatTheyDo}</p>
        </div>

        <div className="evidence__block">
          <h3 className="evidence__h">How {charity.evaluator} gets there</h3>
          <p>{charity.evidenceNotes.method}</p>
        </div>

        <div className="evidence__block">
          <h3 className="evidence__h">What could be wrong</h3>
          <ul className="caveats">
            {charity.evidenceNotes.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>

        <p className="evidence__disclaimer">
          <Scale size={16} aria-hidden="true" />
          <span>
            Every figure is an average program cost, not a receipt.{" "}
            <Link to="/methodology">How we phrase things</Link>.
          </span>
        </p>

        <div className="evidence__foot">
          <a href={charity.evaluatorUrl} target="_blank" rel="noopener noreferrer">
            Read {charity.evaluator}'s full review
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          {/* No freshness date on a provisional entry. Its banner says the
              figures have not been checked against the evaluator's research, and
              lastVerified there is a placeholder — rendering it as "Checked
              Aug 2026" contradicted the warning directly above it. */}
          {!charity.provisional && <FreshnessBadge iso={charity.lastVerified} />}
        </div>
      </div>
    </section>
  );
});

export default EvidenceCard;
