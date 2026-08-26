import { useEffect, useRef } from "react";

/**
 * Adds `is-in` to each child of the returned ref once it has reached the
 * viewport, so CSS can rise-and-fade it in.
 *
 * Deliberately a scroll-position check rather than an IntersectionObserver.
 * The observer only fires when the intersection ratio *changes*, so an instant
 * jump — the "#causes" anchor, a restored scroll position, a fast flick — can
 * carry an element from below the fold to above it between two frames without
 * ever registering as intersecting. Those elements then keep the reveal class
 * and their opacity: 0 forever, which silently hides real content. A position
 * test can't miss anything: whatever the scroll did, an element either has
 * reached the viewport by now or it hasn't.
 *
 * Reduced motion skips the whole mechanism and shows everything at once.
 */
export function useReveal(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = Array.from(root.children);
    const showAll = () => items.forEach((el) => el.classList.add("is-in"));

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      showAll();
      return;
    }

    items.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${Math.min(i * 45, 400)}ms`;
    });

    let pending = false;
    let remaining = items.length;

    const check = () => {
      pending = false;
      // A little past the fold, so a card is already settled when it arrives.
      const line = window.innerHeight * 0.94;
      for (const el of items) {
        if (el.classList.contains("is-in")) continue;
        if (el.getBoundingClientRect().top < line) {
          el.classList.add("is-in");
          remaining -= 1;
        }
      }
      if (remaining <= 0) stop();
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(check);
    };

    function stop() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    check(); // anything already on screen appears immediately

    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
