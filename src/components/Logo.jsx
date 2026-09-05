import { useId } from "react";

/**
 * The Ripple Good mark: a heart with two ripple bands swept across its lower
 * half, and the "Ripple Good" wordmark beside it — "Ripple" set in the sans,
 * "Good" in the brand script, as on the brand sheet, with a ™ after it.
 *
 * The bands are cut with a mask rather than painted white, so the gaps are
 * genuinely transparent. Painted-white bands only look right on a white page —
 * these have to survive the navy footer too.
 *
 * The gradient runs light-to-deep across the heart, matching the brand sheet.
 */
export default function Logo({
  size = "md",
  onDark = false,
  animate = false,
  className = "",
}) {
  // Gradient and mask ids must be unique per instance, or a second logo on the
  // page reuses the first one's definitions.
  const uid = useId().replace(/:/g, "");
  const gradId = `rip-grad-${uid}`;
  const maskId = `rip-mask-${uid}`;

  const px = size === "lg" ? 54 : size === "sm" ? 36 : 44;

  return (
    <span
      role="img"
      aria-label="Ripple Good"
      className={`logo logo--${size}${onDark ? " logo--onDark" : ""}${
        animate ? " logo--animate" : ""
      } ${className}`.trim()}
    >
      <svg
        className="logo__mark"
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={gradId} x1="8" y1="10" x2="92" y2="86" gradientUnits="userSpaceOnUse">
            <stop offset="0" className="logo__stop-a" />
            <stop offset="1" className="logo__stop-b" />
          </linearGradient>

          <mask id={maskId}>
            {/* White keeps, black cuts. */}
            <rect x="0" y="0" width="100" height="100" fill="white" />
            {/* Both bands sit in the lower half and bow upward, so the heart's
                point is left as a separate piece below them — as in the brand
                sheet. Higher up they read as a wifi glyph, not as water. */}
            <path
              d="M2 60 C 28 42, 72 42, 98 62"
              stroke="black"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M18 77 C 36 63, 64 63, 84 78"
              stroke="black"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
            />
          </mask>
        </defs>

        <path
          className="logo__heart"
          d="M50 90 C 50 90 6 62 6 34 C 6 17 19 6 33 6 C 42 6 49 11 50 19 C 51 11 58 6 67 6 C 81 6 94 17 94 34 C 94 62 50 90 50 90 Z"
          fill={`url(#${gradId})`}
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* The ™ rides the wordmark, which is the mark itself and so the one
          place it belongs. It sits outside .logo__script deliberately: set in
          the script face it would read as part of the word, and the subset of
          Dancing Script we ship has three glyphs in it anyway.

          The whole wordmark is already aria-hidden — .logo carries the
          accessible name — so a screen reader never has to say "trade mark"
          twice a page. */}
      <span className="logo__word" aria-hidden="true">
        <span className="logo__name">Ripple</span>
        <span className="logo__script">Good</span>
        <span className="logo__tm">™</span>
      </span>
    </span>
  );
}
