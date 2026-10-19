import { useRef, type MouseEvent, type RefObject } from "react";

// Lets the mouse drag a scrolling container around, like grabbing a map.
// Only drags from the background: clicks on nodes still work as clicks.
export function useDragToPan(scrollRef: RefObject<HTMLDivElement | null>) {
  const drag = useRef<{
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

  function onMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0) return; // left button only
    if ((event.target as HTMLElement).closest("button, a, input, video"))
      return; // leave nodes alone
    const scroller = scrollRef.current;
    if (!scroller) return;

    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: scroller.scrollLeft,
      scrollTop: scroller.scrollTop,
    };
    scroller.classList.add("is-panning");
    event.preventDefault(); // no text selection while dragging

    const onMove = (move: globalThis.MouseEvent) => {
      if (!drag.current) return;
      scroller.scrollLeft =
        drag.current.scrollLeft - (move.clientX - drag.current.startX);
      scroller.scrollTop =
        drag.current.scrollTop - (move.clientY - drag.current.startY);
    };
    const onUp = () => {
      drag.current = null;
      scroller.classList.remove("is-panning");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return { onMouseDown };
}
