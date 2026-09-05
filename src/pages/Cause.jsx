import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import NotFound from "./NotFound.jsx";
import EvidenceCard from "../components/EvidenceCard.jsx";
import Illustration from "../components/Illustration.jsx";
import GivingPanel from "../components/GivingPanel.jsx";
import LearnMore from "../components/LearnMore.jsx";
import SameDollar from "../components/SameDollar.jsx";
import { getCharityById, resolveCauseId } from "../data/charities.js";
import { usePageMeta } from "../lib/usePageMeta.js";

export default function Cause() {
  const { causeId } = useParams();
  const charity = getCharityById(causeId);

  // Two collapsed panels under the gift. Owned here so a cause change closes
  // them: moving between causes only changes the route param, and React would
  // otherwise keep the last cause's panel open.
  const [whyOpen, setWhyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // What the reader has currently chosen, reported up by GivingPanel so the
  // strip below can show that same figure in other causes.
  const [selection, setSelection] = useState(null);
  // Stable identity, or the effect that reports it would fire every render.
  const onSelectionChange = useCallback((next) => setSelection(next), []);

  useEffect(() => {
    setWhyOpen(false);
    setAboutOpen(false);
    // Deliberately not clearing `selection` here. Child effects run before
    // parent ones, so GivingPanel — which is keyed by charity.id and therefore
    // remounts on every cause change — has already reported the new cause's
    // default by the time this runs. Resetting it threw that away, and the
    // strip only appeared once the reader touched a tier.
  }, [causeId]);

  usePageMeta(
    charity ? `${charity.seoTitle}: ${charity.name}` : null,
    charity ? `${charity.headline} ${charity.subhead}` : undefined,
  );

  // A retired or mistyped slug gets the not-found page, not a silent bounce
  // to the home page. GitHub Pages serves the 404 shell for any unknown path,
  // React boots, and this is what it lands on: a page that says what happened
  // and points back at the grid.
  if (!charity) return <NotFound />;
  if (charity.id !== causeId) {
    return <Navigate to={`/cause/${resolveCauseId(causeId)}`} replace />;
  }

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
              <h1>{charity.headline}</h1>
              <p className="causeHero__sub">{charity.subhead}</p>
            </div>

            <Illustration causeId={charity.id} className="causeHero__art" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap wrap--narrow">
          <GivingPanel
            charity={charity}
            key={charity.id}
            onSelectionChange={onSelectionChange}
          />

          <div className="panels">
            <LearnMore
              charity={charity}
              open={aboutOpen}
              onToggle={() => setAboutOpen((v) => !v)}
            />
            <EvidenceCard
              charity={charity}
              open={whyOpen}
              onToggle={() => setWhyOpen((v) => !v)}
            />
          </div>
        </div>
      </section>

      {/* The same figure, read across a few of the other causes. A sample
          rather than all nine: enough to show the number means something
          different in each place, not so many that the page becomes a
          league table. */}
      {selection && (
        <section className="section section--gray">
          <div className="wrap wrap--narrow">
            <SameDollar
              amount={selection.amount}
              monthly={selection.monthly}
              currentId={charity.id}
              limit={3}
            />
          </div>
        </section>
      )}
    </>
  );
}
