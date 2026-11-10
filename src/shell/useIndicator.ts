import { useLayoutEffect, useState, type RefObject } from "react";

export type IndicatorBox = { x: number; y: number; w: number; h: number };

/** Where the active tab sits inside its list, so one shared bar can glide to it instead of each tab painting its own. */
export function useIndicator(list: RefObject<HTMLElement | null>, activeOf: () => HTMLElement | null | undefined, key: unknown): IndicatorBox | null {
  const [box, setBox] = useState<IndicatorBox | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const active = activeOf();
      // A tab with no size (hidden, or a DOM without layout) keeps its own underline.
      if (!active || active.offsetWidth === 0) return setBox(null);
      const next = { x: active.offsetLeft, y: active.offsetTop, w: active.offsetWidth, h: active.offsetHeight };
      setBox((prev) => (prev && prev.x === next.x && prev.y === next.y && prev.w === next.w && prev.h === next.h ? prev : next));
    };
    measure();
    if (typeof ResizeObserver === "undefined" || !list.current) return;
    const observer = new ResizeObserver(measure);
    observer.observe(list.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- activeOf reads refs; `key` says when they moved.
  }, [list, key]);

  return box;
}
