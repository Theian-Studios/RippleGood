import { Link } from "react-router-dom";
import { iconFor } from "../lib/icons.js";

/** The five causes you aren't looking at, at the foot of a cause page. */
export default function OtherCauses({ charities }) {
  return (
    <div className="otherGrid">
      {charities.map((c) => {
        const Icon = iconFor(c.icon);
        return (
          <Link to={`/cause/${c.id}`} className="otherCard" key={c.id}>
            <span className="tile tile--sm">
              <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span>
              <span className="otherCard__label">{c.category}</span>
              <span className="otherCard__name" style={{ display: "block" }}>
                {c.name}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
