import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/**
 * Copies the cause's /share/<id> URL rather than the address in the bar.
 *
 * That path is a static page built by scripts/build-og-images.mjs carrying this
 * cause's own preview card, and it forwards a human straight into the app. The
 * hash URL would paste as a generic, identical preview everywhere.
 */
export default function ShareCause({ charity }) {
  const [copied, setCopied] = useState(false);

  // import.meta.env.BASE_URL keeps this correct under a repo subpath and under "/".
  const url = `${window.location.origin}${import.meta.env.BASE_URL}share/${charity.id}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard blocked (insecure context, or denied): fall back to a prompt
      // so the link is still gettable rather than the button doing nothing.
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button type="button" className="shareCause" onClick={copy}>
      {copied ? (
        <Check size={15} aria-hidden="true" />
      ) : (
        <Link2 size={15} aria-hidden="true" />
      )}
      {copied ? "Link copied" : "Share this cause"}
    </button>
  );
}
