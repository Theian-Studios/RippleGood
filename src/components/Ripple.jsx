/**
 * The thing the site is named after, finally drawn.
 *
 * Concentric rings spreading from a single point — a drop landing. The name was
 * used as a noun and a verb across four surfaces and explained once, in prose,
 * near the bottom of the home page; the hero's only graphic is a wave, which is
 * a different metaphor entirely (water moving past you, rather than one small
 * act spreading outward).
 *
 * `live` runs the rings outward once on arrival, for the thank-you page. Left
 * off it is a still mark, quiet enough to sit behind other things. Nothing
 * loops either way: motion that never stops competes with the reading, and the
 * reduced-motion rule collapses the animation to its end state.
 */
export default function Ripple({ live = false, className = "" }) {
  const rings = [18, 32, 46, 60];

  return (
    <svg
      viewBox="0 0 140 140"
      className={`ripple${live ? " ripple--live" : ""} ${className}`.trim()}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {rings.map((r, i) => (
        <circle
          key={r}
          cx="70"
          cy="70"
          r={r}
          fill="none"
          strokeWidth={i === 0 ? 3 : 2}
          style={{ animationDelay: `${i * 140}ms` }}
        />
      ))}
      {/* The drop itself. Everything else is what it did. */}
      <circle className="ripple__drop" cx="70" cy="70" r="7" />
    </svg>
  );
}
