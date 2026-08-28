/**
 * A faint, hand-drawn wallpaper of the things a gift actually buys — nets,
 * capsules, bowls, books, water, hens — tiled behind the whole page.
 *
 * It is deliberately almost invisible. The point is texture that rewards a
 * second look, not decoration competing with the reading: at this opacity the
 * cards and copy sitting on top lose no contrast at all, which matters more
 * here than the pattern does.
 *
 * One <pattern> tile repeated by a single <rect>, so the browser rasterises the
 * doodles once however tall the page grows. Fixed to the viewport, behind
 * everything, and inert to the pointer.
 */
const TILE = 520;

/* Each doodle is drawn around a 0,0 origin in a ~50-unit box, so it can be
   dropped anywhere in the tile with a translate and a rotation.
   Drawn large enough to be legible at a glance: a first pass at ~40 units left
   the hen as a blob and the tap as a question mark. */
const DOODLES = {
  // A capsule, with its seam.
  pill: "M-21-9a10 10 0 0 0 0 19h42a10 10 0 0 0 0-19Z M3-9v19",
  // A bed net: canopy, bed, legs, hanging point.
  net: "M0-24c-14 0-24 12-24 26h48c0-14-10-26-24-26Z M-19 3h38 M-15 3v8 M15 3v8 M0-24v-7",
  // A droplet.
  drop: "M0-23c9 12 15 19 15 26A15 15 0 0 1-15 3c0-7 6-14 15-26Z",
  // A heart.
  heart: "M0 14c-12-8-20-14-20-22a9 9 0 0 1 20-5 9 9 0 0 1 20 5c0 8-8 14-20 22Z",
  // A hen: body, head, beak, comb, tail, legs.
  hen: "M-14 6a14 12 0 0 0 28 0 14 12 0 0 0-28 0Z M18-6a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z M18-7l9 3-9 4 M9-15c2-4 6-4 9-2 M-14 1l-11-8 4 11 M-7 17v8 M7 17v8",
  // A coin, with a dollar sign.
  coin: "M0-16a16 16 0 1 0 0 32 16 16 0 0 0 0-32Z M0-11v22 M5-7c-2-3-10-3-10 2s10 2 10 7-8 5-10 2",
  // A book.
  book: "M-17-13h16v26h-16Z M1-13h16v26H1Z M-12-6h6 M6-6h6 M-12 2h6 M6 2h6",
  // A first-aid kit.
  kit: "M-17-11h34v23h-34Z M-6-11v-5h12v5 M0-3v9 M-5 1h10",
  // A sprout.
  sprout: "M0 18V-3 M0-3c-10 0-16-6-16-14 9 0 16 5 16 14Z M0-3c10 0 16-6 16-14-9 0-16 5-16 14Z",
  // A bowl of food, steaming.
  bowl: "M-17 0h34c0 10-8 16-17 16S-17 10-17 0Z M-7-7c0-5 5-5 5-10 M5-7c0-5 5-5 5-10",
  // A drop landing, with its ripples.
  ripple: "M0-16c4 5 6 9 6 11a6 6 0 0 1-12 0c0-2 2-6 6-11Z M-18 8a18 10 0 0 1 36 0 M-10 15a10 6 0 0 1 20 0",
  // A shirt.
  shirt: "M-16-10 -7-15h14l9 5-5 8-4-3v17h-14V-5l-4 3Z",
  // A medicine bottle.
  bottle: "M-8-15h16v5h-16Z M-11-10h22v25h-22Z M0-4v11 M-5 1h10",
  // A water bucket.
  bucket: "M-16-9h32l-5 25h-22Z M-11-9a11 9 0 0 1 22 0",
  // A shield, checked.
  shield: "M0-20-16-13v12c0 10 7 17 16 21 9-4 16-11 16-21v-12Z M-7 0l5 6 10-12",
  // A globe.
  globe: "M0-17a17 17 0 1 0 0 34 17 17 0 0 0 0-34Z M-17 0h34 M0-17c8 9 8 25 0 34 M0-17c-8 9-8 25 0 34",
  // A parcel with a heart on it.
  box: "M-16-8h32v22h-32Z M-16-8 0-16l16 8 M0 8c-5-3-8-6-8-9a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 3-3 6-8 9Z",
  // Two people.
  people: "M-16 15a8 8 0 0 1 16 0 M-8 1a6 6 0 1 1 0-13 6 6 0 0 1 0 13Z M0 15a8 8 0 0 1 16 0 M8 1a6 6 0 1 1 0-13 6 6 0 0 1 0 13Z",
  // Two hands clasped.
  handshake: "M-18-2l8-6 6 4 6-4 8 6 M-18-2v6l8 7 4-3 4 3 8-7v-6 M-4-4l4 3 4-3",
  // A serving dome.
  cloche: "M-18 9h36 M-16 9a16 14 0 0 1 32 0 M0-5v-5 M-3-10h6",
  // A wind turbine.
  windmill: "M0-1v20 M-7 19h14 M0-1 0-21 M0-1 16 8 M0-1-16 8",
  // A house with a heart in it.
  house: "M-15-2 0-15l15 13 M-12-2v16h24V-2 M0 11c-4-3-7-5-7-8a3 3 0 0 1 7-2 3 3 0 0 1 7 2c0 3-3 5-7 8Z",
  // A hand holding a heart.
  handHeart: "M-16 9a16 8 0 0 0 32 0 M-16 9V7 M16 9V7 M0-3c-6-4-10-8-10-12a5 5 0 0 1 10-3 5 5 0 0 1 10 3c0 4-4 8-10 12Z",
  // A map pin.
  pin: "M0 19s-11-13-11-21a11 11 0 0 1 22 0c0 8-11 21-11 21Z M0-3a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  // A tulip.
  flower: "M0 20V0 M-8-12c0 8 3 12 8 12s8-4 8-12c-3 3-5 4-8 4s-5-1-8-4Z M0 9c-6 0-9-3-9-7 5 0 9 3 9 7Z",
  // A carrot.
  carrot: "M-5-8 5-8 0 19Z M0-8v-6 M-3-10-7-16 M3-10 7-16",
  // A park bench.
  bench: "M-18 2h36 M-18 8h36 M-18-4h36 M-14 8v9 M14 8v9 M-16-4v6 M16-4v6",
  // A glass.
  glass: "M-9-14h18l-3 13a6 6 0 0 1-12 0Z M0-1v12 M-7 11h14",
  // One person.
  person: "M-11 16a11 11 0 0 1 22 0 M0-1a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z",
};

/* One glyph per cell of an even 6x6 lattice, so the spacing between any two
   neighbours is the same everywhere. Only the rotation varies, which keeps it
   from reading as stamped without disturbing the rhythm. The pattern's own -6
   degree tilt does the rest.

   Glyphs are stepped through with a stride co-prime to their count, so no two
   neighbouring cells draw the same thing. */
const LAYOUT = [
  ["pill", 43.3, 43.3, -15, 0.9],
  ["shirt", 130.0, 43.3, -9, 0.9],
  ["handHeart", 216.7, 43.3, -3, 0.9],
  ["hen", 303.3, 43.3, 3, 0.9],
  ["globe", 390.0, 43.3, 9, 0.9],
  ["bench", 476.7, 43.3, 15, 0.9],
  ["sprout", 43.3, 130.0, -10, 0.9],
  ["cloche", 130.0, 130.0, -4, 0.9],
  ["net", 216.7, 130.0, 2, 0.9],
  ["bottle", 303.3, 130.0, 8, 0.9],
  ["pin", 390.0, 130.0, 14, 0.9],
  ["coin", 476.7, 130.0, -11, 0.9],
  ["box", 43.3, 216.7, -5, 0.9],
  ["glass", 130.0, 216.7, 1, 0.9],
  ["bowl", 216.7, 216.7, 7, 0.9],
  ["windmill", 303.3, 216.7, 13, 0.9],
  ["drop", 390.0, 216.7, -12, 0.9],
  ["bucket", 476.7, 216.7, -6, 0.9],
  ["flower", 43.3, 303.3, 0, 0.9],
  ["book", 130.0, 303.3, 6, 0.9],
  ["people", 216.7, 303.3, 12, 0.9],
  ["person", 303.3, 303.3, -13, 0.9],
  ["ripple", 390.0, 303.3, -7, 0.9],
  ["house", 476.7, 303.3, -1, 0.9],
  ["heart", 43.3, 390.0, 5, 0.9],
  ["shield", 130.0, 390.0, 11, 0.9],
  ["carrot", 216.7, 390.0, -14, 0.9],
  ["kit", 303.3, 390.0, -8, 0.9],
  ["handshake", 390.0, 390.0, -2, 0.9],
  ["pill", 476.7, 390.0, 4, 0.9],
  ["shirt", 43.3, 476.7, 10, 0.9],
  ["handHeart", 130.0, 476.7, -15, 0.9],
  ["hen", 216.7, 476.7, -9, 0.9],
  ["globe", 303.3, 476.7, -3, 0.9],
  ["bench", 390.0, 476.7, 3, 0.9],
  ["sprout", 476.7, 476.7, 9, 0.9],
];

export default function Wallpaper() {
  return (
    <div className="wallpaper" aria-hidden="true">
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="ripple-doodles"
            width={TILE}
            height={TILE}
            patternUnits="userSpaceOnUse"
            // A slight tilt stops the eye finding the tile edges.
            patternTransform="rotate(-6)"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {LAYOUT.map(([name, x, y, rot, scale], i) => (
                <path
                  key={`${name}-${i}`}
                  d={DOODLES[name]}
                  transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}
                />
              ))}
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ripple-doodles)" />
      </svg>
    </div>
  );
}
