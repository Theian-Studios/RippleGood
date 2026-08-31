/**
 * Where the dark water meets the page. Three passes back to front: two faint
 * travelling lines, the blue swell, then the page-coloured swell a few units
 * lower, so the blue showing between them is the rim along the crest.
 *
 * The rim is a gap between two fills rather than a stroke: preserveAspectRatio
 * is none, and a stroked path would thin out as the window widened. The two
 * faint lines are strokes, so they need non-scaling-stroke.
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
      {/* The ripple still spreading, well above the shoreline. */}
      <path
        d="M0 96C280 72 560 66 760 74S1180 92 1440 76"
        fill="none"
        stroke="var(--sky)"
        strokeOpacity="0.14"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 108C300 88 600 82 800 88S1200 102 1440 92"
        fill="none"
        stroke="var(--sky)"
        strokeOpacity="0.1"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />

      {/* The swell, and the rim along its crest. */}
      <path d="M0 120C300 78 620 68 820 76S1200 100 1440 120Z" fill="var(--blue)" />
      <path
        d="M0 120C300 87 620 77 820 85S1200 108 1440 120Z"
        fill="var(--gray-50)"
      />
    </svg>
  );
}
