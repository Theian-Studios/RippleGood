import { useEffect } from "react";

const SUFFIX = "Ripple Good";

/**
 * A single-page app never reloads, so the tab title and the meta description
 * are ours to maintain. Both matter for anything that reads the page after a
 * share — and the title is what a screen reader announces on navigation.
 */
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title
      ? `${title} · ${SUFFIX}`
      : `${SUFFIX}: make the biggest ripple.`;

    if (!description) return;
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", description);
  }, [title, description]);
}
