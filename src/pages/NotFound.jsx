import { Link } from "react-router-dom";
import { charities } from "../data/charities.js";
import { usePageMeta } from "../lib/usePageMeta.js";

export default function NotFound() {
  usePageMeta("Page not found");

  return (
    <section className="notFound">
      <div className="wrap wrap--narrow">
        <h1>That page isn't here.</h1>
        <p>
          The link may be old, or we may have moved something. All {charities.length}{" "}
          causes are one click away.
        </p>
        <Link to="/" className="btn btn--primary btn--lg">
          Back to Ripple Good
        </Link>
      </div>
    </section>
  );
}
