import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Scale } from "lucide-react";
import EvidenceCard from "../components/EvidenceCard.jsx";
import Illustration from "../components/Illustration.jsx";
import GivingPanel from "../components/GivingPanel.jsx";
import SameDollar from "../components/SameDollar.jsx";
import Wallpaper from "../components/Wallpaper.jsx";
import { getCharityById, resolveCauseId } from "../data/charities.js";
import { iconFor } from "../lib/icons.js";
import { usePageMeta } from "../lib/usePageMeta.js";

export default function Cause() {
  const { causeId } = useParams();
  const charity = getCharityById(causeId);

  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [selection, setSelection] = useState(null);
  // Stable identity, or the effect that reports it would fire every render.
  const onSelectionChange = useCallback((next) => setSelection(next), []);
  const evidenceRef = useRef(null);

  // Moving between causes only changes the route param, so React keeps this
  // component mounted and its state alive. Without this the evidence panel
  // stays open from the last cause you read. (The giving panel is keyed below
  // for the same reason — otherwise its selected amount carries over too.)
  useEffect(() => {
    setEvidenceOpen(false);
    // Deliberately not clearing `selection` here. Child effects run before
    // parent ones, so GivingPanel — which is keyed by charity.id and therefore
    // remounts on every cause change — has already reported the new cause's
    // default by the time this runs. Resetting it here threw that away, and
    // the strip only appeared once the reader touched a tier.
  }, [causeId]);

  // The same title the prerender writes into the static file, so a crawler that
  // runs JavaScript doesn't see a different one from a crawler that doesn't.
  usePageMeta(
    charity ? `${charity.seoTitle}: ${charity.name}` : null,
    charity ? `${charity.headline} ${charity.subhead}` : undefined,
  );

  // An unknown slug is a bad link, not a page. Send it home rather than
  // rendering a dead end.
  if (!charity) return <Navigate to="/" replace />;

  // A retired slug still resolves, but it shouldn't stay in the address bar:
  // forward to the current URL so what gets copied, shared and indexed from
  // here is the canonical one, and the old id fades out on its own.
  if (charity.id !== causeId) {
    return <Navigate to={`/cause/${resolveCauseId(causeId)}`} replace />;
  }

  const Icon = iconFor(charity.icon);

  /** The small footnote under the headline opens the evidence and goes to it. */
  return (
    <>
      <section className="causeHero" data-cause={charity.id}>
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

        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap wrap--narrow">
          <GivingPanel
            charity={charity}
            key={charity.id}
            onSelectionChange={onSelectionChange}
          />

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

      {selection && (
        <section className="section section--gray section--textured">
          <Wallpaper />
          <div className="wrap wrap--narrow">
            <SameDollar
              amount={selection.amount}
              monthly={selection.monthly}
              currentId={charity.id}
            />
          </div>
        </section>
      )}

    </>
  );
}
