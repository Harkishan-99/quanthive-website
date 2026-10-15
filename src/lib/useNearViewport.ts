import { useEffect, useState, type RefObject } from "react";

/**
 * True once the element has come within `margin` of the viewport, and from then
 * on. For costly set-up (WebGL contexts, shader compiles, layout reads) in parts
 * of a page that start well off screen: they get ready just before they're
 * reached, rather than all at once as the page mounts — which on a page change
 * would land in the middle of its transition.
 */
export function useNearViewport(ref: RefObject<Element | null>, margin = "60%") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (near) return;
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: `${margin} 0px` },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, margin, near]);
  return near;
}
