/**
 * The ripple in the hero: rings spreading from a drop on dark water.
 *
 * The brand argument drawn literally — the ring at the centre is small, bright
 * and tight; each one outward is wider, dimmer and fainter, until the last
 * dissolves into the navy. One drop, a long way out.
 *
 * Ellipses, not circles. Perfect circles read as a target or a radar sweep;
 * flattening them to roughly 2:5 puts the water in perspective, the way you'd
 * see rings spreading on a surface in front of you.
 *
 * Rings are annuli drawn as strokes, not stacked filled discs — stacked discs
 * would each paint over the one beneath, so the dim outer rings would erase the
 * bright centre. A stroke only ever paints its own band.
 */

/* Point of impact, in viewBox units: centred, and low enough that the rings
   spread out beneath the copy rather than behind it. */
const CX = 460;
const CY = 200;
const SQUASH = 0.4; // ry as a fraction of rx — the perspective of the surface

/* Outside-in, so the tight centre lands on top. The outermost ring is all but
   the background colour, so the water has no visible edge. */
const RINGS = [
  { r: 440, w: 20, c: "#132c50" },
  { r: 386, w: 19, c: "#16345f" },
  { r: 334, w: 18, c: "#1a3e73" },
  { r: 284, w: 17, c: "#1f4b8c" },
  { r: 236, w: 16, c: "#2559a6" },
  { r: 190, w: 15, c: "#2c68c1" },
  { r: 148, w: 14, c: "#3479db" },
  { r: 110, w: 13, c: "#3f8bf0" },
  { r: 76, w: 12, c: "#549dff" },
  { r: 48, w: 11, c: "#77b4ff" },
];

/* Hairlines between the bands, for the fine detail real water has. */
const HAIRLINES = [62, 92, 128, 168, 212, 258, 308, 360, 412];

export default function HeroRipple() {
  return (
    <svg
      className="heroRipple"
      viewBox="0 0 920 400"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g className="heroRipple__rings">
        {RINGS.map(({ r, w, c }) => (
          <ellipse
            key={r}
            cx={CX}
            cy={CY}
            rx={r}
            ry={r * SQUASH}
            fill="none"
            stroke={c}
            strokeWidth={w}
          />
        ))}

        {HAIRLINES.map((r) => (
          <ellipse
            key={`h-${r}`}
            cx={CX}
            cy={CY}
            rx={r}
            ry={r * SQUASH}
            fill="none"
            stroke="#8fc0ff"
            strokeWidth="1.5"
            opacity="0.16"
          />
        ))}

        {/* The drop itself, at the point of impact. */}
        <ellipse cx={CX} cy={CY} rx="17" ry={17 * SQUASH} fill="#9ec8ff" />
        <ellipse cx={CX} cy={CY - 5} rx="10" ry="12" fill="#dbeaff" opacity="0.92" />
      </g>
    </svg>
  );
}
