import { useEffect, useRef, useState } from "react";

/**
 * Draws a quantity as counted icons — ten nets, twenty hens — so the number in
 * the sentence below has a picture attached to it.
 *
 * The honesty rule is the cap. Up to COUNTABLE icons we draw exactly that many,
 * so anyone can count them and find the sentence true. Past that we stop
 * pretending and switch to a multiplication statement — "1,000 ×" beside a
 * single icon — because a grid of 40 icons captioned "1,000" would be a picture
 * that lies.
 *
 * The cap used to be 30, which meant the widget collapsed to "100 ×" beside a
 * single hen at exactly the amount worth feeling. Drawing a hundred is the
 * whole point of drawing anything, and it stays honest because it really is a
 * hundred: the number rendered is never larger than the number counted.
 */
const COUNTABLE = 300;

/**
 * Glyph size by count. Few icons should be large enough to read as objects;
 * a hundred should be small enough to read as a mass. One size for both made
 * the small counts timid and the large ones a wall.
 */
function densityFor(n) {
  if (n <= 12) return "lg";
  if (n <= 40) return "md";
  if (n <= 120) return "sm";
  return "xs";
}

/* Small filled glyphs, drawn on a 16×16 box. Filled rather than stroked: at
   14px in a dense row, line icons turn to mush. */
const GLYPHS = {
  // A hanging net canopy over a bed.
  net: "M8 1.4c-3.5 0-6.1 2.9-6.1 6.4 0 .5.4.9.9.9h1.4v4.4c0 .6.5 1.1 1.1 1.1h5.4c.6 0 1.1-.5 1.1-1.1V8.7h1.4c.5 0 .9-.4.9-.9C14.1 4.3 11.5 1.4 8 1.4Zm2.6 11.1H5.4V8.7h5.2v3.8Z",
  // A capsule, tilted.
  capsule: "M10.9 2.2a3.6 3.6 0 0 1 5.1 5.1l-2.6 2.6-5.1-5.1 2.6-2.6ZM7.2 5.9l5.1 5.1-2.6 2.6a3.6 3.6 0 0 1-5.1-5.1l2.6-2.6Z",
  // A hen: body, head, comb, beak.
  hen: "M11.6 4.1a1.5 1.5 0 0 0-1.4-1.7c.2-.5 0-1-.4-1.2-.1.6-.6.9-1.1.9-.9 0-1.7.7-1.8 1.6L4.7 5.4a4.2 4.2 0 0 0-1.9 3.5v3.4c0 .8.6 1.4 1.4 1.4h7.4c1.4 0 2.6-1.2 2.6-2.6V7.3c0-1.4-1-2.6-2.4-2.9l-.2-.3Zm1.9.4 1.9-.8-1.5 1.6-.4-.8Z",
  // A cloud.
  cloud: "M12.3 12.9H4.6a3.6 3.6 0 0 1-.5-7.2 4.6 4.6 0 0 1 8.7 1.2 3 3 0 0 1-.5 6Z",
  // A child: head and shoulders.
  child: "M8 1.6a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2Zm0 6.3c2.9 0 5.2 1.8 5.2 4v1.4c0 .6-.5 1.1-1.1 1.1H3.9c-.6 0-1.1-.5-1.1-1.1v-1.4c0-2.2 2.3-4 5.2-4Z",
};

/** Ticks a number up to its target. Instant when the OS asks for less motion. */
function useCountUp(target, duration = 420) {
  const [shown, setShown] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    fromRef.current = target;

    if (reduced || from === target) {
      setShown(target);
      return;
    }

    let frame;
    const started = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - started) / duration);
      // easeOutCubic: quick off the mark, settles gently on the final figure.
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (target - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return shown;
}

export function CountUp({ value, format = (n) => n.toLocaleString("en-US") }) {
  return <>{format(useCountUp(value))}</>;
}

export default function Pictogram({ units, pictogram }) {
  const counted = Math.min(units, COUNTABLE);
  const path = GLYPHS[pictogram.glyph];

  // Hooks must run unconditionally, so this sits above the early return.
  const shownCount = useCountUp(units);
  if (!path || units < 1) return null;

  const overflow = units > COUNTABLE;

  return (
    <div className={`pictogram pictogram--${densityFor(counted)}`} aria-hidden="true">
      {overflow && (
        <span className="pictogram__multiplier">
          {shownCount.toLocaleString("en-US")}
          <span className="pictogram__times">×</span>
        </span>
      )}

      <span className={`pictogram__row${overflow ? " pictogram__row--single" : ""}`}>
        {Array.from({ length: overflow ? 1 : counted }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 16 16"
            className="pictogram__glyph"
            style={{
              // Staggered, but capped so the last icon of thirty isn't late.
              // Staggered, but the ramp shortens as the count grows so a
              // hundred icons still land inside half a second.
              animationDelay: `${Math.min(i * (counted > 60 ? 4 : 18), 460)}ms`,
            }}
          >
            <path d={path} />
          </svg>
        ))}
      </span>

      {/* The count belongs in the sentence, not only in the picture: the
          icons confirm the number, they don't have to be counted to find it.
          Past the cap the multiplier beside the single glyph already says it. */}
      <span className="pictogram__label">
        {overflow
          ? pictogram.label
          : `${shownCount.toLocaleString("en-US")} ${pictogram.label}`}
      </span>
    </div>
  );
}
