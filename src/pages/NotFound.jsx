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
          The link may be old, or the cause may have been retired. We take a
          cause down when its evaluator stops recommending it, or when the
          charity tells us it no longer needs the money. All{" "}
          {charities.length} current causes are one click away.
        </p>
        <Link to="/#causes" className="btn btn--primary btn--lg">
          See every cause
        </Link>
      </div>
    </section>
  );
}
