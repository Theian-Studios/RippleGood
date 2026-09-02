import { Link } from "react-router-dom";
import Illustration from "./Illustration.jsx";
import { evaluatorShort } from "../data/charities.js";
import { money } from "../lib/format.js";

/**
 * One cause on the home grid. The whole card is the link — the primary act.
 *
 * The card used to be a tinted icon tile, a label and a tagline, which asked
 * for a click on faith: nothing on it said what a gift buys or who stands
 * behind the pick. It now carries the cause's own illustration on its own tint,
 * and the bottom line answers the two questions a browser actually has —
 * what do I get, and says who.
 *
 * The provisional warning is still not here. `provisional: true` renders the
 * full caveat inside the giving widget, above the amounts, which is where a
 * reader meets the figures it applies to rather than while browsing.
 */
export default function CauseCard({ charity }) {
  return (
    <Link to={`/cause/${charity.id}`} className="causeCard" data-cause={charity.id}>
      {/* The art was the best thing on the cause pages and invisible until you
          opened one. On its cause's own tint, it also gives the grid eight
          identities instead of eight copies of one component. */}
      <span className="causeCard__art">
        <Illustration causeId={charity.id} />
      </span>

      <span className="causeCard__body">
        <h3 className="causeCard__name">{charity.category}</h3>
        <p className="causeCard__tagline">{charity.tagline}</p>

        <span className="causeCard__outcome">
          <strong>{money(charity.defaultAmount)}</strong>
          <span className="causeCard__arrow" aria-hidden="true">
            →
          </span>
          {charity.cardOutcome}
          <span className="causeCard__by">{evaluatorShort(charity)}</span>
        </span>
      </span>
    </Link>
  );
}
