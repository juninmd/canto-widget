import { useEffect, type RefObject } from "react";

/** A row that overflows sideways scrolls with the wheel and by dragging it, since its scrollbar is hidden. */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let drag: { x: number; left: number; moved: boolean } | null = null;
    const wheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button === 0) drag = { x: e.clientX, left: el.scrollLeft, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const d = e.clientX - drag.x;
      if (Math.abs(d) > 4) drag.moved = true;
      if (drag.moved) el.scrollLeft = drag.left - d;
    };
    const up = () => {
      // The click that ends a drag must not pick the tab under the pointer.
      if (drag?.moved) el.addEventListener("click", (ev) => ev.stopPropagation(), { capture: true, once: true });
      drag = null;
    };
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [ref]);
}
