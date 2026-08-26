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
};

/* Position, rotation and scale for each instance in the tile. Scattered by
   hand rather than by an algorithm — a regular grid reads as a grid. */
const LAYOUT = [
  ["net", 64, 70, -8, 1],
  ["pill", 214, 44, 18, 1],
  ["drop", 356, 82, -6, 0.95],
  ["coin", 462, 50, 12, 0.9],
  ["bowl", 130, 190, 6, 1],
  ["hen", 296, 176, -10, 1],
  ["book", 440, 200, 14, 0.95],
  ["heart", 50, 278, -14, 1],
  ["sprout", 198, 302, 8, 1],
  ["kit", 346, 296, -16, 0.95],
  ["shirt", 478, 326, 10, 0.9],
  ["ripple", 104, 414, 0, 1],
  ["bottle", 252, 434, -8, 0.95],
  ["bucket", 392, 422, 12, 0.95],
  ["pill", 34, 156, 62, 0.8],
  ["drop", 174, 506, 8, 0.8],
  ["net", 338, 496, 6, 0.8],
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
