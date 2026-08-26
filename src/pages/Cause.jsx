import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, ChevronDown, CircleAlert, Scale } from "lucide-react";
import EvidenceCard from "../components/EvidenceCard.jsx";
import FreshnessBadge from "../components/FreshnessBadge.jsx";
import Illustration from "../components/Illustration.jsx";
import GivingPanel from "../components/GivingPanel.jsx";
import OtherCauses from "../components/OtherCauses.jsx";
import ShareCause from "../components/ShareCause.jsx";
import { getCharityById, getOtherCharities } from "../data/charities.js";
import { iconFor } from "../lib/icons.js";
import { usePageMeta } from "../lib/usePageMeta.js";

export default function Cause() {
  const { causeId } = useParams();
  const charity = getCharityById(causeId);

  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const evidenceRef = useRef(null);

  // Moving between causes only changes the route param, so React keeps this
  // component mounted and its state alive. Without this the evidence panel
  // stays open from the last cause you read. (The giving panel is keyed below
  // for the same reason — otherwise its selected amount carries over too.)
  useEffect(() => {
    setEvidenceOpen(false);
  }, [causeId]);

  usePageMeta(
    charity ? `${charity.name} · ${charity.category}` : null,
    charity ? `${charity.headline} ${charity.subhead}` : undefined,
  );

  // An unknown slug is a bad link, not a page. Send it home rather than
  // rendering a dead end.
  if (!charity) return <Navigate to="/" replace />;

  const Icon = iconFor(charity.icon);

  /** The small footnote under the headline opens the evidence and goes to it. */
  function revealEvidence() {
    setEvidenceOpen(true);
    requestAnimationFrame(() => {
      evidenceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      // Move focus with the scroll, or keyboard and screen-reader users are
      // left on a button whose target just opened somewhere below them.
      evidenceRef.current
        ?.querySelector("button")
        ?.focus({ preventScroll: true });
    });
  }

  return (
    <>
      <section className="causeHero">
        <div className="wrap wrap--narrow">
          <Link to="/#causes" className="crumb">
            <ArrowLeft size={16} aria-hidden="true" />
            All causes
          </Link>

          <div className="causeHero__layout">
            <div>
              <div className="causeHero__top">
                <span className="tile">
                  <Icon size={23} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span>
                  <span className="causeHero__category" style={{ display: "block" }}>
                    {charity.category}
                  </span>
                  <span className="causeHero__charity">Our pick: {charity.name}</span>
                </span>
              </div>

              <h1>{charity.headline}</h1>
              <p className="causeHero__sub">{charity.subhead}</p>
            </div>

            <Illustration causeId={charity.id} className="causeHero__art" />
          </div>

          {charity.provisional && (
            <div className="note note--warn" style={{ marginTop: 22 }}>
              <CircleAlert size={19} aria-hidden="true" />
              <span>
                <strong>Provisional entry.</strong> We've drafted this cause but have
                not yet checked its figures against {charity.evaluator}'s published
                research. Treat the numbers below as illustrative, and read{" "}
                {charity.evaluator}'s own page before giving. This banner stays until
                the check is done.
              </span>
            </div>
          )}

          <div className="causeHero__actions">
            <button type="button" className="howLink" onClick={revealEvidence}>
              How we know
              <ChevronDown size={15} aria-hidden="true" />
            </button>
            <ShareCause charity={charity} />
            <FreshnessBadge iso={charity.lastVerified} />
          </div>

          <div>
            <a
              className="evaluatorChip"
              href={charity.evaluatorUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <BadgeCheck size={18} aria-hidden="true" />
              <span>
                <strong>{charity.evaluator}</strong> — {charity.evaluatorNote}
              </span>
            </a>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap wrap--narrow">
          <GivingPanel charity={charity} key={charity.id} />

          <EvidenceCard
            ref={evidenceRef}
            charity={charity}
            open={evidenceOpen}
            onToggle={() => setEvidenceOpen((v) => !v)}
          />

          <div className="note note--plain" style={{ marginTop: 22 }}>
            <Scale size={18} aria-hidden="true" />
            <span>
              <strong>We say "provides," not "buys."</strong> Every figure here is an
              average program cost, not a receipt for a specific item — the full
              reasoning is in the panel above.{" "}
              <Link to="/methodology">More on how we phrase things</Link>.
            </span>
          </div>
        </div>
      </section>

      <section className="section section--gray">
        <div className="wrap">
          <div className="sectionHead">
            <h2>Care about something else too?</h2>
            <p>Every cause here has one pick and the evidence behind it.</p>
          </div>
          <OtherCauses charities={getOtherCharities(charity.id)} />
        </div>
      </section>
    </>
  );
}
