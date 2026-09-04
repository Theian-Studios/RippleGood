/**
 * One line icon per cause, drawn in the same grammar as the interface icons
 * (a 24-unit box, round caps and joins, no fills) so a cause tile sits beside
 * an arrow or a checkmark without looking imported from somewhere else.
 *
 * Each icon is the same object the cause's illustration and pictogram use.
 * Before this, the three surfaces disagreed: a moon on the tile, a bed net on
 * the card and a net glyph in the giving panel; a pill, then a shield; a baby,
 * then a capsule; a worm, then a school. One object per cause, everywhere.
 */
const ICONS = {
  // A bed net: the canopy hung from a point, and the bed it covers.
  net: (
    <>
      <path d="M12 2v2" />
      <path d="M4 13c0-5 3.6-9 8-9s8 4 8 9" />
      <path d="M3 13h18" />
      <path d="M12 4v9" />
      <path d="M5 13v8M19 13v8" />
      <path d="M5 17h14" />
    </>
  ),

  // A medicine bottle: a course of tablets, taken through the season.
  medicine: (
    <>
      <path d="M9 3h6v3H9z" />
      <path d="M8 6h8v12a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3z" />
      <path d="M12 10v6M9 13h6" />
    </>
  ),

  // A vitamin A softgel: an oval capsule with the twist at its tail.
  capsule: (
    <g transform="rotate(-35 12 12)">
      <rect x="4" y="9" width="13.5" height="6" rx="3" />
      <path d="M17.5 12h2.5" />
    </g>
  ),

  // A hen, side on: comb, beak, body, tail, two legs.
  hen: (
    <>
      <path d="M15.5 7.5l.8-3 1.2 2 1.2-2 .8 3" />
      <path d="M17.2 9.6h.01" />
      <path d="M4 14c0 3 2.5 5 6 5h3c3.5 0 5.5-2.5 5.5-5.5V10a3 3 0 0 0-3-3h-1a3 3 0 0 0-3 3v1H8c-2.5 0-4 1.5-4 3z" />
      <path d="M18.5 9.5h2.5" />
      <path d="M4 13l-2.5-2.5" />
      <path d="M9 19v3M13 19v3" />
    </>
  ),

  // A wind turbine: mast, hub, three blades.
  turbine: (
    <>
      <path d="M12 22V11" />
      <path d="M8 22h8" />
      <circle cx="12" cy="9" r="1.5" />
      <path d="M12 7.5V2" />
      <path d="M13.3 9.75l5.2 3" />
      <path d="M10.7 9.75l-5.2 3" />
    </>
  ),

  // A banknote: cash, handed over as cash.
  banknote: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),

  // A school: where the deworming tablets are handed out. A flag on the
  // roof, not a cross, or it reads as a church.
  school: (
    <>
      <path d="M12 5V1.5h3.5l-1 1.25 1 1.25H12" />
      <path d="M4 22V11l8-6 8 6v11" />
      <path d="M2 22h20" />
      <path d="M14 22v-5a2 2 0 0 0-4 0v5" />
      <path d="M8 13h.01M16 13h.01" />
    </>
  ),

  // A syringe, upright: plunger, barrel with two marks, hub, needle.
  syringe: (
    <>
      <path d="M9 3h6" />
      <path d="M12 3v3" />
      <path d="M8 6h8v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z" />
      <path d="M10 9.5h2M10 12.5h2" />
      <path d="M10.5 16v2h3v-2" />
      <path d="M12 18v4" />
    </>
  ),

  // A bowl of food, steaming.
  bowl: (
    <>
      <path d="M3 11h18a9 9 0 0 1-18 0z" />
      <path d="M8 21h8" />
      <path d="M9.5 8c0-2 1.5-2 1.5-4" />
      <path d="M13.5 8c0-2 1.5-2 1.5-4" />
    </>
  ),

  // A chlorine dispenser: tank, spout, and the dose coming out.
  dispenser: (
    <>
      <rect x="3" y="3" width="7" height="6" rx="1.5" />
      <path d="M6.5 9v2" />
      <path d="M10 6h4a2 2 0 0 1 2 2v2" />
      <path d="M16 22a3 3 0 0 1-3-3c0-2 3-5.5 3-5.5S19 17 19 19a3 3 0 0 1-3 3Z" />
    </>
  ),

  // A sack of flour, with the plus that says something was added to it.
  grain: (
    <>
      <path d="M9 3c0 2-1.5 2.2-1.5 4h9C16.5 5.2 15 5 15 3" />
      <path d="M7.5 7h9l1.4 9.6a3.5 3.5 0 0 1-3.5 4H9.6a3.5 3.5 0 0 1-3.5-4Z" />
      <path d="M12 12v5M9.5 14.5h5" />
    </>
  ),

  // A rapid test cassette: sample well above, two lines in the window.
  test: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <circle cx="12" cy="6.5" r="1.5" />
      <rect x="9.5" y="11" width="5" height="7" rx="1" />
      <path d="M10.8 13.2h2.4M10.8 15.8h2.4" />
    </>
  ),

};

export const causeIconNames = Object.keys(ICONS);

export default function CauseIcon({
  name,
  size = 24,
  strokeWidth = 1.75,
  className = "",
  ...rest
}) {
  const art = ICONS[name] ?? ICONS.net;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {art}
    </svg>
  );
}
