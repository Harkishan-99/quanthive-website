import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Site-wide inertial scrolling. Lenis eases the wheel and trackpad but keeps the
 * page's native scroll position underneath, so everything that reads scrollY,
 * IntersectionObserver and position: sticky/fixed keeps working unchanged.
 *
 * Skipped entirely when the reader asks for reduced motion.
 */
let lenis: Lenis | null = null;

export function startSmoothScroll() {
  if (lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  lenis = new Lenis({
    // Exponential ease-out over ~1.1s: long enough to feel weighted, short enough
    // that a flick still lands where the reader aimed.
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    smoothWheel: true,
    // In-page #anchor links glide instead of jumping.
    anchors: true,
    // Let nested scrollers — the card row's sideways scroll, the menu drawer on a
    // phone — scroll natively instead of being driven as the page.
    allowNestedScroll: true,
    autoRaf: true,
  });
}

/** Jump straight to a position (no easing), keeping Lenis in step. */
export function jumpPageTo(top: number) {
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo(0, top);
}

/** Smoothly scroll the page to a position, through Lenis when it is running. */
export function scrollPageTo(top: number) {
  if (lenis) lenis.scrollTo(top);
  else {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }
}
