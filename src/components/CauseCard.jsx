import { Link } from "react-router-dom";
import { iconFor } from "../lib/icons.js";

/**
 * One cause on the home grid. The whole card is the link — the primary act.
 *
 * No "See the evidence" line and no "Provisional" chip: the card carries the
 * cause, the pick and the evaluator, and nothing else. The provisional warning
 * itself is not gone — `provisional: true` still stands in the data and still
 * renders the full banner at the top of the cause page, which is where a reader
 * meets the figures it applies to.
 */
export default function CauseCard({ charity }) {
  const Icon = iconFor(charity.icon);

  return (
    <Link to={`/cause/${charity.id}`} className="causeCard">
      <span className="tile">
        <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
      </span>

      <h3 className="causeCard__name">{charity.category}</h3>
      <p className="causeCard__tagline">{charity.tagline}</p>

      <span className="causeCard__pick">
        Our pick
        <strong>{charity.name}</strong>
        {charity.evaluator}
      </span>
    </Link>
  );
}
