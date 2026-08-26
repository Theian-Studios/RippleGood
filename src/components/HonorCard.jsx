import { useEffect, useRef } from "react";

/**
 * Draws the shareable "given in honor of…" card.
 *
 * Canvas rather than SVG-to-image on purpose: an <img> holding SVG can't reach
 * the page's webfonts, so the download would silently fall back to Times while
 * the on-screen preview looked right. Drawing with ctx.fillText after
 * document.fonts.ready uses the real Poppins in both.
 */
const W = 1200;
const H = 630;

const NAVY = "#0a1b33";
const SKY = "#86c5f0";
const WHITE = "#ffffff";
const MUTED = "rgba(255,255,255,0.66)";

/** The Ripple heart, drawn at (x, y) with the given height. Two ripple bands
 *  are cut out by painting them in the background colour, which is fine here
 *  because both cards have a known solid navy ground. */
function drawMark(ctx, x, y, h, bg) {
  const s = h / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  const grad = ctx.createLinearGradient(8, 10, 92, 86);
  grad.addColorStop(0, "#9ccbf6");
  grad.addColorStop(1, "#4d95e8");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(50, 90);
  ctx.bezierCurveTo(50, 90, 6, 62, 6, 34);
  ctx.bezierCurveTo(6, 17, 19, 6, 33, 6);
  ctx.bezierCurveTo(42, 6, 49, 11, 50, 19);
  ctx.bezierCurveTo(51, 11, 58, 6, 67, 6);
  ctx.bezierCurveTo(81, 6, 94, 17, 94, 34);
  ctx.bezierCurveTo(94, 62, 50, 90, 50, 90);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = bg;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(2, 60);
  ctx.bezierCurveTo(28, 42, 72, 42, 98, 62);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18, 77);
  ctx.bezierCurveTo(36, 63, 64, 63, 84, 78);
  ctx.stroke();

  ctx.restore();
}


/** Greedy wrap; returns the y position just past the last line drawn. */
function wrap(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = next;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);

  // Ellipsis rather than silent truncation if a long name overflows.
  if (lines.length === maxLines && words.length) {
    const joined = lines.join(" ");
    const consumed = joined.split(/\s+/).length;
    if (consumed < words.length) {
      let last = lines[maxLines - 1];
      while (last && ctx.measureText(`${last}…`).width > maxWidth) {
        last = last.slice(0, -1);
      }
      lines[maxLines - 1] = `${last}…`;
    }
  }

  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

export default function HonorCard({ card, canvasRef }) {
  const localRef = useRef(null);
  const ref = canvasRef || localRef;
  const { occasion, honoree, charity, outcome, from } = card;

  useEffect(() => {
    let cancelled = false;

    async function draw() {
      // Without this the first paint can land before Poppins is ready.
      if (document.fonts?.ready) await document.fonts.ready;
      if (cancelled) return;

      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = NAVY;
      ctx.fillRect(0, 0, W, H);

      // The heart mark, same geometry as the site logo.
      drawMark(ctx, 78, 56, 62, NAVY);

      ctx.fillStyle = WHITE;
      ctx.font = "700 40px Poppins, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText("Ripple", 156, 88);
      const rippleW = ctx.measureText("Ripple").width;
      ctx.font = "700 48px 'Dancing Script', cursive";
      ctx.fillStyle = SKY;
      ctx.fillText("Good", 156 + rippleW + 12, 88);

      ctx.font = "600 22px Poppins, sans-serif";
      ctx.fillStyle = SKY;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(occasion.toUpperCase(), 84, 214);

      ctx.fillStyle = WHITE;
      ctx.font = "700 66px Poppins, sans-serif";
      const afterName = wrap(ctx, honoree || "you", 84, 292, W - 168, 76, 2);

      ctx.fillStyle = SKY;
      ctx.fillRect(84, afterName + 18, 92, 5);

      ctx.fillStyle = WHITE;
      ctx.font = "500 34px Poppins, sans-serif";
      const afterOutcome = wrap(ctx, outcome, 84, afterName + 88, W - 168, 46, 3);

      ctx.fillStyle = MUTED;
      ctx.font = "400 24px Poppins, sans-serif";
      const credit = from
        ? `From ${from} · via ${charity} · ripplegood.org`
        : `via ${charity} · ripplegood.org`;
      wrap(ctx, credit, 84, Math.min(afterOutcome + 46, H - 52), W - 168, 32, 2);
    }

    draw();
    return () => {
      cancelled = true;
    };
  }, [occasion, honoree, charity, outcome, from, ref]);

  return (
    <canvas
      ref={ref}
      width={W}
      height={H}
      className="honorCanvas"
      role="img"
      aria-label={`Card reading: ${occasion}, ${honoree}. ${outcome}`}
    />
  );
}
