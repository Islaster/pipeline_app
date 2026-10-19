import { useEffect, useState, type RefObject } from "react";

export interface Viewport {
  left: number;
  top: number;
  width: number;
  height: number;
}

// The visible rectangle of a scrolling container, kept up to date as it scrolls or resizes.
// `refreshKey` should change whenever the scroller's contents change size, so the
// listeners are attached after the element exists and re-measured when the tree changes.
export function useViewport(
  scrollRef: RefObject<HTMLDivElement | null>,
  refreshKey: unknown
): Viewport {
  const [viewport, setViewport] = useState<Viewport>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const update = () =>
      setViewport({
        left: scroller.scrollLeft,
        top: scroller.scrollTop,
        width: scroller.clientWidth,
        height: scroller.clientHeight,
      });

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    return () => {
      scroller.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [scrollRef, refreshKey]);

  return viewport;
}
