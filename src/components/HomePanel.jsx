import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * A collapsed section on the home page.
 *
 * Deliberately the same shape as the "How we know" disclosure on a cause page —
 * a full-width toggle carrying aria-expanded and aria-controls, and a body that
 * is genuinely `hidden` rather than merely transparent, so a screen reader and a
 * find-in-page agree with what the eye sees.
 *
 * Closed by default. Someone who has just picked a cause shouldn't have to
 * scroll past our explanation of ourselves to reach it; the reader who wants it
 * is one click away.
 */
export default function HomePanel({ title, blurb, children, cta }) {
  const [open, setOpen] = useState(false);
  const id = useId().replace(/:/g, "");
  const panelId = `panel-${id}`;

  return (
    <section className="homePanel">
      <button
        type="button"
        className="homePanel__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="homePanel__heading">
          <span className="homePanel__title">{title}</span>
          <span className="homePanel__blurb">{blurb}</span>
        </span>
        <ChevronDown className="homePanel__chevron" size={22} aria-hidden="true" />
      </button>

      <div id={panelId} className="homePanel__body" hidden={!open}>
        {children}
        {cta}
      </div>
    </section>
  );
}
