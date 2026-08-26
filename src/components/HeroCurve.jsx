/**
 * The arc where the dark water meets the page — a shallow dome with a bright
 * rim along its crest, as on the brand sheet.
 *
 * Two paths rather than a stroke: the rim is the gap between a blue shape and
 * the page-coloured shape sitting a few units lower, which keeps a constant
 * visual weight when the SVG is stretched to any width. A stroke would thin out
 * as it stretched.
 */
export default function HeroCurve() {
  return (
    <svg
      className="heroCurve"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 120C420 8 1020 8 1440 120Z" fill="var(--blue)" />
      <path d="M0 120C420 30 1020 30 1440 120Z" fill="var(--gray-50)" />
    </svg>
  );
}
