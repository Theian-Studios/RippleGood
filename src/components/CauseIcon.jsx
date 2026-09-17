/**
 * One line icon per cause, drawn in the same grammar as the interface icons
 * (a 24-unit box, round caps and joins, no fills) so a cause tile sits beside
 * an arrow or a checkmark without looking imported from somewhere else.
 *
 * Each icon is the same object the cause's illustration and pictogram use.
 * Before this, the three surfaces disagreed: a moon on the tile, a bed net on
 * the card and a net glyph in the giving panel; a pill, then a shield; a baby,
 * then a capsule; a worm, then a school. One object per cause, everywhere.
 *
 * Every drawing carries two layers. The silhouette has to survive 18px in a
 * tile, so it is one clear outline. The detail (a drape line on the net, the
 * sheen on a softgel, the flange on a syringe, the comb and wattle on the
 * hen) sits inside that outline with at least two units of air around it, so
 * it reads as texture at 18px and as the thing itself at 44px and up.
 */
const ICONS = {
  // A bed net: hung from a hook, the canopy with its centre seam and one
  // drape line, the hem rail, and the bed it covers on its legs.
  net: (
    <>
      <path d="M12 1.5v2.5" />
      <path d="M12 4c-4.5 0-7.5 4-7.5 9.5h15C19.5 8 16.5 4 12 4Z" />
      <path d="M12 4v9.5" />
      <path d="M6.5 9.5c1.5-1 3.3-1.5 5.5-1.5s4 .5 5.5 1.5" />
      <path d="M3 13.5h18" />
      <path d="M5.5 13.5V22M18.5 13.5V22" />
      <path d="M4 18h16" />
    </>
  ),

  // A medicine bottle: screw cap, shoulders, a plus on the label, and the
  // label's bottom edge.
  medicine: (
    <>
      <rect x="8.5" y="2" width="7" height="3.5" rx=".75" />
      <path d="M7 9a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v9.5A3.5 3.5 0 0 1 13.5 22h-3A3.5 3.5 0 0 1 7 18.5Z" />
      <path d="M7 8.75h10" />
      <path d="M12 11v5M9.5 13.5h5" />
      <path d="M9 19h6" />
    </>
  ),

  // A vitamin A softgel: the oval, the twist at its tail, and the sheen
  // along its top that says gel rather than tablet.
  capsule: (
    <g transform="rotate(-35 12 12)">
      <rect x="3.5" y="8.5" width="14.5" height="7" rx="3.5" />
      <path d="M7.5 10.75c1-.5 2.2-.5 3.2 0" />
      <path d="M18 12h3" />
    </g>
  ),

  // A hen, side on: comb, beak, eye, wattle, head, the body running from
  // the neck round to the breast, two tail feathers, two legs with feet.
  hen: (
    <>
      <path d="M15.4 4.6l.4-2 1.2 1.3 1.1-1.6.8 2.2" />
      <path d="M20.1 6.6l2.4.7-2.4.8" />
      <path d="M18.2 6.1h.01" />
      <path d="M18.2 9v1.6" />
      <path d="M15.1 7.6a2.6 2.6 0 1 1 5-.9" />
      <path d="M15.4 8.4c-.9 1.5-2.2 2.3-3.9 2.3H8.6c-3 0-4.9 1.6-4.9 4 0 2.6 2.4 4.5 6.2 4.5h4c2.8 0 4.9-1.9 5.2-4.6l.7-5" />
      <path d="M4.6 12.2L2 8M7 11L5.3 6.8" />
      <path d="M9.8 19.2V22M13.2 19.2V22M8.3 22h3M11.7 22h3" />
    </>
  ),

  // A wind turbine: a tapered mast on its base, the hub, three leaf-shaped
  // blades rather than three sticks.
  turbine: (
    <>
      <path d="M11 22l.4-12M13 22l-.4-12" />
      <path d="M7.5 22h9" />
      <circle cx="12" cy="8" r="1.6" />
      <path d="M12 6.4c-1-1.3-1-3.5 0-4.9 1 1.4 1 3.6 0 4.9Z" />
      <path d="M13.4 8.8c1.6-.2 3.4.9 4.2 2.4-1.7.3-3.5-.7-4.2-2.4Z" />
      <path d="M10.6 8.8c-1.6-.2-3.4.9-4.2 2.4 1.7.3 3.5-.7 4.2-2.4Z" />
    </>
  ),

  // Banknotes: two in a stack, the front one with its medallion and two
  // corner marks. Cash, handed over as cash.
  banknote: (
    <>
      <rect x="2" y="8" width="18" height="12" rx="2" />
      <circle cx="11" cy="14" r="2.75" />
      <path d="M5.5 11h.01M16.5 17h.01" />
      <path d="M5.5 8V6a2 2 0 0 1 2-2H20a2 2 0 0 1 2 2v10" />
    </>
  ),

  // A school: a flag on the ridge, the roof overhanging the walls, an
  // arched door and a window either side. A flag, not a cross, or it
  // reads as a church.
  school: (
    <>
      <path d="M12 1.5h3.5l-1 1.25 1 1.25H12" />
      <path d="M12 1.5v3.5" />
      <path d="M2.5 12.5L12 5l9.5 7.5" />
      <path d="M4.5 11v11M19.5 11v11" />
      <path d="M2 22h20" />
      <path d="M9.5 22v-4.5a2.5 2.5 0 0 1 5 0V22" />
      <path d="M6.5 13.5h2v2.5h-2zM15.5 13.5h2v2.5h-2z" />
    </>
  ),

  // A syringe, upright: thumb rest, plunger, finger flange, barrel with
  // two graduations, hub, needle.
  syringe: (
    <>
      <path d="M9 2.5h6" />
      <path d="M12 2.5v3.5" />
      <path d="M7.5 6h9" />
      <path d="M8.5 6h7v9.5a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 8.5 15.5z" />
      <path d="M10.5 9.5h2.5M10.5 12.5h2.5" />
      <path d="M10.75 17v1.5h2.5V17" />
      <path d="M12 18.5V22" />
    </>
  ),

  // A bowl seen from slightly above, so the food inside shows over the
  // rim, on its foot, with three curls of steam.
  bowl: (
    <>
      <ellipse cx="12" cy="12" rx="9.5" ry="2.5" />
      <path d="M2.5 12c0 5 4 8.5 9.5 8.5s9.5-3.5 9.5-8.5" />
      <path d="M9 20.5v1.5h6v-1.5" />
      <path d="M6.5 11c1.5-1.8 3.5-2.7 5.5-2.7s4 .9 5.5 2.7" />
      <path d="M8.5 6.5c0-1.5 1.5-1.5 1.5-3.5" />
      <path d="M12.5 5.5c0-1.5 1.5-1.5 1.5-3.5" />
      <path d="M16.5 6.5c0-1.5 1.5-1.5 1.5-3.5" />
    </>
  ),

  // A chlorine dispenser as they stand at a water point: the tank with its
  // label on a post, the spout off its side, and the dose coming out.
  dispenser: (
    <>
      <rect x="3" y="2.5" width="9" height="7" rx="1.5" />
      <path d="M5.5 6h4" />
      <path d="M7.5 9.5V22" />
      <path d="M4.5 22h6" />
      <path d="M12 5.5h2.5a2 2 0 0 1 2 2v2" />
      <path d="M16.5 20.5a2.7 2.7 0 0 1-2.7-2.7c0-1.9 2.7-5.3 2.7-5.3s2.7 3.4 2.7 5.3a2.7 2.7 0 0 1-2.7 2.7Z" />
    </>
  ),

  // A sack of flour, tied at the neck with its ears up, and the plus that
  // says something was added to it.
  grain: (
    <>
      <path d="M9 2.5c.5 2-1.5 2.5-2 5h10c-.5-2.5-2.5-3-2-5" />
      <path d="M6 7.5H18" />
      <path d="M7 7.5h10l1.4 9.6a3.5 3.5 0 0 1-3.5 4H9.1a3.5 3.5 0 0 1-3.5-4Z" />
      <path d="M12 12v5M9.5 14.5h5" />
    </>
  ),

  // A rapid test cassette: sample well above, two lines in the window, the
  // grip below.
  test: (
    <>
      <rect x="7" y="1.5" width="10" height="21" rx="2.5" />
      <circle cx="12" cy="6" r="1.75" />
      <rect x="9.5" y="10" width="5" height="7.5" rx="1" />
      <path d="M10.75 12.25h2.5M10.75 15.25h2.5" />
      <path d="M10 20h4" />
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
