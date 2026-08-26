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
    if (hash) {
      const target = document.querySelector(hash);
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
