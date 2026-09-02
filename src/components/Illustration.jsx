/**
 * One duotone illustration per cause — navy forms, a single blue accent.
 *
 * Drawn rather than photographed on purpose. Photographs of people in poverty
 * do emotional work the subject didn't consent to, and this site's whole
 * argument is that the outcome should move you, not the image. These are
 * geometric and unsentimental: they signal the cause without staging anyone.
 *
 * All share a 240×190 box so every cause page's hero balances identically.
 */
import { resolveCauseId } from "../data/charities.js";

const VIEW = "0 0 240 190";

/* Shared paint, keyed to the brand tokens so the set can never drift out of
   step with the palette again. `--ill-*` still lets one page retint the lot. */
const ink = "var(--ill-ink, var(--navy))";
const inkSoft = "var(--ill-ink-soft, #3a5a86)";
const accent = "var(--ill-accent, var(--blue))";
const wash = "var(--ill-wash, var(--mist))";

function GlobalHealth() {
  return (
    <>
      {/* A bed net canopy, drawn open, over someone sleeping. */}
      <circle cx="120" cy="70" r="62" fill={wash} />
      <path d="M120 22c-34 0-58 30-58 66h116c0-36-24-66-58-66Z" fill="none" stroke={accent} strokeWidth="3" />
      <path d="M120 30c-24 0-42 25-42 58M120 30c24 0 42 25 42 58M120 30v58" stroke={accent} strokeWidth="1.6" opacity=".55" />
      <path d="M99 88c0-11 9-21 21-21s21 10 21 21" stroke={accent} strokeWidth="1.6" opacity=".55" fill="none" />
      <circle cx="120" cy="18" r="6" fill={accent} />
      <rect x="52" y="132" width="136" height="10" rx="5" fill={ink} />
      <rect x="62" y="120" width="116" height="14" rx="7" fill={inkSoft} />
      <circle cx="92" cy="112" r="11" fill={ink} />
      <path d="M104 127c0-8 8-14 22-14h44v9h-66Z" fill={ink} />
      <rect x="60" y="142" width="8" height="18" rx="4" fill={ink} />
      <rect x="172" y="142" width="8" height="18" rx="4" fill={ink} />
    </>
  );
}

function ChildNutrition() {
  return (
    <>
      {/* A vitamin A softgel offered in an open palm. It used to have sun rays
          behind it, which said vitamin D. The capsule is the same oval-with-a-
          tail the tile icon draws. */}
      <circle cx="120" cy="82" r="60" fill={wash} />
      <g transform="rotate(-30 120 72)">
        <rect x="86" y="58" width="64" height="28" rx="14" fill={accent} />
        <path d="M150 72h12" stroke={accent} strokeWidth="7" strokeLinecap="round" />
        <path d="M100 66c6-3 14-3 20 0" stroke={wash} strokeWidth="3" strokeLinecap="round" opacity=".7" />
      </g>
      <path d="M64 118c8-10 22-14 34-10l30 10h26c9 0 16 7 16 16s-7 16-16 16H96c-14 0-26-6-34-16l-8-10 10-6Z" fill={ink} />
      <path d="M74 116c10-6 22-6 32-2" stroke={wash} strokeWidth="2.5" fill="none" opacity=".5" />
    </>
  );
}

function DiseasePrevention() {
  return (
    <>
      {/* A course of medicine under a season: the four months of cover sit on
          an arc above the bottle. This was a shield with a checkmark, which is
          the picture every insurance company uses. */}
      <circle cx="120" cy="86" r="60" fill={wash} />
      <path d="M60 44a150 150 0 0 1 120 0" stroke={inkSoft} strokeWidth="2" fill="none" opacity=".5" strokeDasharray="5 7" />
      <rect x="104" y="52" width="32" height="18" rx="5" fill={inkSoft} />
      <rect x="94" y="66" width="52" height="92" rx="12" fill={ink} />
      <rect x="104" y="86" width="32" height="46" rx="6" fill={wash} />
      <path d="M120 98v22M109 109h22" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      <g fill={accent}>
        <circle cx="62" cy="52" r="6" />
        <circle cx="94" cy="34" r="6" />
        <circle cx="146" cy="34" r="6" />
        <circle cx="178" cy="52" r="6" />
      </g>
    </>
  );
}

function AnimalWelfare() {
  return (
    <>
      {/* A hen walking out of a cage whose bars have opened. */}
      <circle cx="120" cy="84" r="60" fill={wash} />
      {/* The cage, with one bar swung open in the accent. */}
      <g stroke={inkSoft} strokeWidth="3" strokeLinecap="round" opacity=".4">
        <path d="M46 36v102M64 36v102" />
        <path d="M40 36h50M40 138h50" />
      </g>
      {/* The bar that gave way, bent aside into the empty half of the cage —
          drawn here rather than behind the hen, where it was invisible. */}
      <path
        d="M82 36v26c0 20-12 31-30 35"
        stroke={accent}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Tail, body and head as separate shapes: as one merged blob the
          silhouette didn't read as a hen at all. */}
      <path d="M104 94 78 68l10 30-16 6 32 10Z" fill={ink} />
      <ellipse cx="134" cy="102" rx="36" ry="30" fill={ink} />
      <circle cx="166" cy="73" r="15" fill={ink} />
      <g fill={accent}>
        <circle cx="158" cy="57" r="5" />
        <circle cx="167" cy="53" r="5.5" />
        <circle cx="176" cy="57" r="5" />
      </g>
      <path d="M181 73l15 5-15 6V73Z" fill={accent} />
      <circle cx="170" cy="69" r="3.6" fill={wash} />
      <path d="M122 98c11-7 24-5 31 4-7 9-20 11-31 4v-8Z" fill={wash} opacity=".22" />
      <g stroke={ink} strokeWidth="4" strokeLinecap="round">
        <path d="M124 130v15M146 130v15M117 147h13M139 147h13" />
      </g>
    </>
  );
}

function Climate() {
  return (
    <>
      {/* A turbine, and an emissions curve bending down past it. */}
      <circle cx="120" cy="84" r="60" fill={wash} />
      <path d="M34 58c26 0 44 14 58 40s34 40 60 40h54" stroke={accent} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M34 58c26 0 44 14 58 40" stroke={inkSoft} strokeWidth="3.5" fill="none" strokeLinecap="round" opacity=".35" />
      <circle cx="206" cy="138" r="6" fill={accent} />
      <path d="M114 150l6-72h4l6 72h-16Z" fill={ink} />
      <g fill={ink}>
        <path d="M122 74 108 24c-1-4 2-7 6-5l16 9c3 2 3 6 0 8l-8 38Z" />
        <path d="M122 78 68 74c-4 0-6-4-3-7l12-13c3-3 7-2 8 2l37 22Z" />
        <path d="M122 78l40 36c3 3 1 8-3 8l-18-1c-4 0-6-3-5-7l-14-36Z" />
      </g>
      <circle cx="122" cy="78" r="7" fill={accent} />
      <rect x="96" y="150" width="52" height="7" rx="3.5" fill={ink} />
    </>
  );
}

function DirectCash() {
  return (
    <>
      {/* Money arriving on a phone, landing in an open hand. */}
      <circle cx="120" cy="80" r="60" fill={wash} />
      <rect x="88" y="18" width="64" height="104" rx="12" fill={ink} />
      <rect x="96" y="30" width="48" height="74" rx="5" fill={wash} />
      <rect x="110" y="112" width="20" height="4" rx="2" fill={wash} opacity=".6" />
      <g transform="translate(0 -4)">
        <rect x="104" y="46" width="32" height="22" rx="4" fill={accent} />
        <circle cx="120" cy="57" r="6" fill={ink} opacity=".8" />
        <path d="M120 78v14M114 86l6 6 6-6" stroke={accent} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M56 150c0-16 12-28 28-28h72c16 0 28 12 28 28v6H56v-6Z" fill={ink} />
      <path d="M72 140c8-6 18-9 28-9h40c10 0 20 3 28 9" stroke={wash} strokeWidth="2.5" fill="none" opacity=".45" />
    </>
  );
}

function Deworming() {
  return (
    <>
      {/* A school: the delivery route that makes this cheap. */}
      <circle cx="120" cy="84" r="60" fill={wash} />
      <path d="M120 26 54 62h132L120 26Z" fill={ink} />
      <rect x="66" y="62" width="108" height="72" fill={ink} />
      <rect x="80" y="78" width="22" height="22" rx="3" fill={wash} />
      <rect x="138" y="78" width="22" height="22" rx="3" fill={wash} />
      <path d="M108 134v-22a12 12 0 0 1 24 0v22h-24Z" fill={accent} />
      <rect x="48" y="134" width="144" height="8" rx="4" fill={ink} />
      <g fill={accent}>
        <circle cx="120" cy="44" r="6" />
      </g>
      <g fill={inkSoft}>
        <circle cx="72" cy="152" r="7" />
        <path d="M62 172c0-6 4-11 10-11s10 5 10 11H62Z" />
        <circle cx="120" cy="152" r="7" />
        <path d="M110 172c0-6 4-11 10-11s10 5 10 11h-20Z" />
        <circle cx="168" cy="152" r="7" />
        <path d="M158 172c0-6 4-11 10-11s10 5 10 11h-20Z" />
      </g>
    </>
  );
}

function LeadExposure() {
  return (
    <>
      {/* A paint tin: wire bail up, lid on, one drip of the paint down the
          label. It had a light bulb on the label and a blue X floating beside
          it, which read as a close button. The tile icon is the same tin. */}
      <circle cx="120" cy="84" r="60" fill={wash} />
      <path d="M84 52V46c0-20 16-34 36-34s36 14 36 34v6h-9v-6c0-15-12-25-27-25S93 31 93 46v6h-9Z" fill={inkSoft} opacity=".55" />
      <rect x="74" y="62" width="92" height="80" rx="8" fill={ink} />
      <rect x="66" y="52" width="108" height="16" rx="6" fill={inkSoft} />
      <rect x="88" y="84" width="64" height="36" rx="5" fill={wash} />
      <path d="M100 96h40M100 106h24" stroke={inkSoft} strokeWidth="3" strokeLinecap="round" opacity=".55" />
      <path d="M120 116c-6 8-9 13-9 17a9 9 0 0 0 18 0c0-4-3-9-9-17Z" fill={accent} />
    </>
  );
}

const SET = {
  "malaria-nets": GlobalHealth,
  "malaria-medicine": DiseasePrevention,
  "child-survival": ChildNutrition,
  "animal-welfare": AnimalWelfare,
  climate: Climate,
  "extreme-poverty": DirectCash,
  "intestinal-worms": Deworming,
  "lead-poisoning": LeadExposure,
};

export default function Illustration({ causeId, className = "" }) {
  // Through resolveCauseId, so a retired slug still draws its picture rather
  // than rendering nothing at all. Returning null here is silent by design —
  // a cause with no art shows none — which is exactly why a stale key in this
  // map would not have announced itself.
  const Art = SET[resolveCauseId(causeId)];
  if (!Art) return null;

  return (
    <svg
      viewBox={VIEW}
      className={`illustration ${className}`.trim()}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <Art />
    </svg>
  );
}
