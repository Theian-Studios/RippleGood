import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { iconFor } from "../lib/icons.js";

/** One cause on the home grid. The whole card is the link — the primary act. */
export default function CauseCard({ charity }) {
  const Icon = iconFor(charity.icon);

  return (
    <Link to={`/cause/${charity.id}`} className="causeCard">
      <span className="tile">
        <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
      </span>

      <h3 className="causeCard__name">
        {charity.category}
        {charity.provisional && <span className="chip chip--warn">Provisional</span>}
      </h3>
      <p className="causeCard__tagline">{charity.tagline}</p>

      <span className="causeCard__pick">
        Our pick
        <strong>{charity.name}</strong>
        {charity.evaluator}
      </span>

      <span className="causeCard__go">
        See the evidence
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}
