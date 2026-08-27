/**
 * Where the dark water meets the page.
 *
 * A shallow, slightly uneven swell rather than the tall symmetrical dome this
 * used to be. Water at rest doesn't arc; the old curve rose almost the full
 * height of its box and read as a graphic device, and its rim was thick enough
 * to be a band in its own right.
 *
 * Three passes, back to front:
 *   1. two faint lines above the shoreline — the ripple still travelling
 *   2. the blue swell
 *   3. the page-coloured swell, a few units lower, so the blue left showing
 *      between them is the bright rim along the crest
 *
 * The rim is a gap between two fills, not a stroke, so it keeps its weight when
 * the SVG stretches — preserveAspectRatio is none, and a stroked path would
 * thin out as the window widened. The two faint lines are strokes, so they take
 * vector-effect="non-scaling-stroke" to stay hairlines at any width.
 *
 * Control points are deliberately not mirrored: the crest sits a little left of
 * centre and the two shoulders differ, which is what keeps it from reading as a
 * perfect arc.
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
