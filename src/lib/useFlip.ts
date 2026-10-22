import { useLayoutEffect, useRef, type RefObject } from "react";
import { exitDuration } from "./motion";

const FLIP_MS = 260;

/** FLIP: items marked `data-flip` that change place glide from where they were instead of jumping. */
export function useFlip(container: RefObject<HTMLElement | null>, key: unknown) {
  const last = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
    const box = container.current;
    if (!box) return;
    const animate = exitDuration() > 0;
    const next = new Map<string, DOMRect>();
    for (const el of box.querySelectorAll<HTMLElement>("[data-flip]")) {
      const id = el.dataset.flip ?? "";
      const rect = el.getBoundingClientRect();
      next.set(id, rect);
      const prev = last.current.get(id);
      if (!animate || !prev || typeof el.animate !== "function") continue;
      const dx = prev.left - rect.left;
      const dy = prev.top - rect.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
      // Transform only: the move stays on the compositor and leaves layout alone.
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: FLIP_MS, easing: "cubic-bezier(0.2, 0, 0, 1)" });
    }
    last.current = next;
  }, [container, key]);
}
