import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Two jobs the router doesn't do itself:
 *
 *   • A path change leaves the scroll position where it was, which lands you
 *     halfway down a page you've never seen. Reset it.
 *   • A link carrying a hash (#causes) should land on that section. The browser
 *     only does this on a real page load, not on a client-side navigation.
 */
export default function ScrollToTop() {
  // `key` changes on every navigation, even to the identical URL — so clicking
  // "See your impact" while already sitting at /#causes still scrolls there.
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // Not every hash is a selector. Legacy links from when this site used a
    // HashRouter look like "#/cause/climate", and querySelector throws a
    // SyntaxError on that — which, unguarded, took the whole app down with it
    // rather than merely failing to scroll. An id can't contain "/" anyway, so
    // that alone rules out the entire old URL shape; the try/catch covers the
    // rest of what a hand-typed fragment can be.
    if (hash && hash.length > 1 && !hash.includes("/")) {
      let target = null;
      try {
        target = document.querySelector(hash);
      } catch {
        target = null;
      }
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
    }
    // "instant" rather than the smooth scroll html sets globally: a new page
    // should already be at the top, not seen racing there.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, key]);

  return null;
}
