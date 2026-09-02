import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

/**
 * "I just funded five nets."
 *
 * The one moment the site has a warm user, and it used to offer them a button
 * back to the grid. This offers them the thing that actually spreads: a share
 * whose link is the cause page, which now carries its own Open Graph card, so
 * what lands in the other person's feed is the illustration and the headline
 * rather than a generic site preview.
 *
 * Web Share where it exists — that is the native sheet on a phone, which is
 * where this gets used. Everywhere else, copy to clipboard, because a share
 * button that silently does nothing on desktop is worse than no button.
 */
export default function ShareGift({ charity, outcome }) {
  const [state, setState] = useState("idle");

  const url = `${window.location.origin}/cause/${charity.id}/`;
  // No amount. What someone gave is their business, and the sentence is
  // stronger describing the result than the sum.
  const text = outcome
    ? `I just gave to ${charity.name}. ${outcome}`
    : `I just gave to ${charity.name} through Ripple Good.`;

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ripple Good", text, url });
        return;
      } catch {
        // Cancelled, or the sheet refused. Fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setState("copied");
      setTimeout(() => setState("idle"), 2600);
    } catch {
      setState("failed");
    }
  }

  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="shareGift">
      <button type="button" className="btn btn--primary" onClick={share}>
        {state === "copied" ? (
          <>
            <Check size={18} aria-hidden="true" />
            Link copied
          </>
        ) : (
          <>
            {canShare ? (
              <Share2 size={18} aria-hidden="true" />
            ) : (
              <Copy size={18} aria-hidden="true" />
            )}
            Tell someone
          </>
        )}
      </button>

      <p className="shareGift__note" aria-live="polite">
        {state === "failed"
          ? "Couldn't copy — your browser blocked it."
          : "The strongest reason anyone gives is that someone they know did."}
      </p>
    </div>
  );
}
