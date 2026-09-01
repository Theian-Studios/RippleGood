import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, CircleAlert, Scale } from "lucide-react";
import EvidenceCard from "../components/EvidenceCard.jsx";
import Illustration from "../components/Illustration.jsx";
import GivingPanel from "../components/GivingPanel.jsx";
import OtherCauses from "../components/OtherCauses.jsx";
import Wallpaper from "../components/Wallpaper.jsx";
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
                <span className="tile" data-cause={charity.id}>
                  <Icon size={23} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="causeHero__label">
                  <span className="causeHero__category">
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
            <div className="note note--warn u-mt-6">
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

        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap wrap--narrow">
          <GivingPanel charity={charity} key={charity.id} />

          {/* Under the panel, not above it: the evaluator is what backs the ask
              up, so it reads better as the answer to "says who?" than as a
              credential presented before anyone has been asked for anything. */}
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

          <EvidenceCard
            ref={evidenceRef}
            charity={charity}
            open={evidenceOpen}
            onToggle={() => setEvidenceOpen((v) => !v)}
          />

          <div className="note note--plain u-mt-6">
            <Scale size={18} aria-hidden="true" />
            <span>
              Every figure is an average program cost, not a receipt.{" "}
              <Link to="/methodology">How we phrase things</Link>.
            </span>
          </div>
        </div>
      </section>

      <section className="section section--gray section--textured">
        <Wallpaper />
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
