import { forwardRef } from "react";
import { ChevronDown, ExternalLink, FlaskConical } from "lucide-react";
import { AVERAGE_COST_DISCLAIMER } from "../data/charities.js";
import FreshnessBadge from "./FreshnessBadge.jsx";

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
const EvidenceCard = forwardRef(function EvidenceCard({ charity, open, onToggle }, ref) {
  const panelId = `evidence-${charity.id}`;

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
          How we know
        </span>
        <ChevronDown className="evidence__chevron" size={22} aria-hidden="true" />
      </button>

      <div id={panelId} className="evidence__body" hidden={!open}>
        <div className="evidence__block">
          <h3 className="evidence__h">The figures</h3>
          <div className="figures">
            {charity.costFigures.map((f) => (
              <div className="figure" key={f.label}>
                <div className="figure__value">{f.value}</div>
                <div className="figure__label">{f.label}</div>
                <div className="figure__source">{f.source}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="evidence__block">
          <h3 className="evidence__h">What {charity.name} does</h3>
          <p>{charity.evidenceNotes.whatTheyDo}</p>
        </div>

        <div className="evidence__block">
          <h3 className="evidence__h">How {charity.evaluator} works it out</h3>
          <p>{charity.evidenceNotes.method}</p>
        </div>

        <div className="evidence__block">
          <h3 className="evidence__h">What could be wrong with this</h3>
          <ul className="caveats">
            {charity.evidenceNotes.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>

        <div className="evidence__block">
          <h3 className="evidence__h">On the dollar figures</h3>
          <p>{AVERAGE_COST_DISCLAIMER}</p>
        </div>

        <div className="evidence__foot">
          <a href={charity.evaluatorUrl} target="_blank" rel="noopener noreferrer">
            Read {charity.evaluator}'s full review
            <ExternalLink size={14} aria-hidden="true" style={{ marginLeft: 5 }} />
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
