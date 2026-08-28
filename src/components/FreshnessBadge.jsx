import { CircleAlert, Clock } from "lucide-react";
import { freshnessOf, monthYear } from "../lib/freshness.js";

/**
 * How old a cause's figures are, judged against the clock in the reader's
 * browser. Turns amber past six months and red past a year — so the site's
 * quarterly-review promise is checkable by the person reading it, not just by
 * whoever maintains it.
 */
export default function FreshnessBadge({ iso, className = "" }) {
  // No date, no badge. An unchecked cause has none, and inventing one here is
  // exactly the claim its provisional banner exists to deny.
  if (!iso) return null;

  const { tone, label, monthsOld } = freshnessOf(iso);
  const Icon = tone === "fresh" ? Clock : CircleAlert;

  const title =
    tone === "fresh"
      ? "Figures checked against the evaluator's research within the last six months."
      : tone === "aging"
        ? `These figures were last checked about ${monthsOld} months ago — they may have moved since.`
        : `These figures are over a year old. Treat them as indicative and check the evaluator's own page.`;

  return (
    <span className={`freshness freshness--${tone} ${className}`.trim()} title={title}>
      <Icon size={14} aria-hidden="true" />
      {label} {monthYear(iso)}
    </span>
  );
}
