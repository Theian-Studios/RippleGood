import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EvidenceCard from "../components/EvidenceCard.jsx";
import Illustration from "../components/Illustration.jsx";
import GivingPanel from "../components/GivingPanel.jsx";
import LearnMore from "../components/LearnMore.jsx";
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
  useEffect(() => {
    setWhyOpen(false);
    setAboutOpen(false);
  }, [causeId]);

  usePageMeta(
    charity ? `${charity.seoTitle}: ${charity.name}` : null,
    charity ? `${charity.headline} ${charity.subhead}` : undefined,
  );

  if (!charity) return <Navigate to="/" replace />;
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
          <GivingPanel charity={charity} key={charity.id} />

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
    </>
  );
}
