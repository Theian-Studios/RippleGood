import { Link } from "react-router-dom";
import { iconFor } from "../lib/icons.js";

/**
 * One cause on the home grid. The whole card is the link — the primary act.
 *
 * Cause, tagline, and nothing else — no "See the evidence" line, no
 * "Provisional" chip, no "Our pick" block. The charity and its evaluator are
 * named on the cause page the card opens, which is where the reader is
 * deciding rather than browsing.
 *
 * The provisional warning is not gone: `provisional: true` still stands in the
 * data and still renders the full banner at the top of the cause page, which is
 * where a reader meets the figures it applies to.
 */
export default function CauseCard({ charity }) {
  const Icon = iconFor(charity.icon);

  return (
    <Link to={`/cause/${charity.id}`} className="causeCard">
      <span className="tile" data-cause={charity.id}>
        <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
      </span>

      <h3 className="causeCard__name">{charity.category}</h3>
      <p className="causeCard__tagline">{charity.tagline}</p>
    </Link>
  );
}
