import { BookOpen, ChevronDown, ExternalLink } from "lucide-react";

/**
 * "Learn more": a few sentences on the disease or harm itself, then three
 * places to read more. Collapsed by default, like the evidence panel beside
 * it, so the page asks one question at a time and a reader who wants the
 * background is one click from it.
 *
 * It sits above "Why this charity" because the problem comes before the pick.
 *
 * Open state is owned by the page, so a cause change closes it.
 */
export default function LearnMore({ charity, open, onToggle }) {
  const items = charity.learnMore ?? [];
  if (!items.length && !charity.learnMoreIntro) return null;
  const panelId = `about-${charity.id}`;

  return (
    <section className="evidence" aria-labelledby={`${panelId}-title`}>
      <button
        type="button"
        className="evidence__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="evidence__title" id={`${panelId}-title`}>
          <BookOpen size={21} aria-hidden="true" />
          Learn more
        </span>
        <ChevronDown className="evidence__chevron" size={22} aria-hidden="true" />
      </button>

      <div id={panelId} className="evidence__body learnMore" hidden={!open}>
        {charity.learnMoreIntro && (
          <p className="learnMore__intro">{charity.learnMoreIntro}</p>
        )}

        <ul className="learnMore__list" role="list">
          {items.map((l) => (
            <li key={l.url}>
              <a
                className="learnMore__row"
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="learnMore__head">
                  <span className="learnMore__name">{l.title}</span>
                  <span className="learnMore__source">{l.source}</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </span>
                <span className="learnMore__note">{l.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
