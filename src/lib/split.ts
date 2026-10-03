import { useCallback, useEffect, useState } from "react";

const KEY = "canto.splitLeft";
/** The task list needs room for its row actions; the other column for a card with three buttons. */
export const LEFT_MIN = 360;
export const RIGHT_MIN = 300;
export const LEFT_DEFAULT = 416;
const STEP = 16;
const STEP_BIG = 64;

export const maxLeft = (total: number) => Math.max(LEFT_MIN, total - RIGHT_MIN);

/** Keeps both columns usable: a window too narrow for both minimums gives the list its minimum and the rest to the card. */
export function clampLeft(px: number, total: number): number {
  if (!Number.isFinite(px)) return LEFT_DEFAULT;
  return Math.round(Math.min(maxLeft(total), Math.max(LEFT_MIN, px)));
}

/** Arrow keys move by a step (Shift: a bigger one), Home and End jump to the limits, Enter restores. `null` = not ours. */
export function keyLeft(key: string, left: number, total: number, shift = false): number | null {
  const step = shift ? STEP_BIG : STEP;
  switch (key) {
    case "ArrowLeft":
      return clampLeft(left - step, total);
    case "ArrowRight":
      return clampLeft(left + step, total);
    case "Home":
      return LEFT_MIN;
    case "End":
      return maxLeft(total);
    case "Enter":
      return clampLeft(LEFT_DEFAULT, total);
    default:
      return null;
  }
}

function read(): number {
  try {
    const n = Number(localStorage.getItem(KEY));
    return Number.isFinite(n) && n > 0 ? n : LEFT_DEFAULT;
  } catch {
    return LEFT_DEFAULT;
  }
}

/** The width of the task list in the maximized mode, remembered on this machine. */
export function useSplitLeft() {
  const [left, setLeft] = useState(read);
  const commit = useCallback((px: number) => {
    setLeft(px);
    try {
      localStorage.setItem(KEY, String(px));
    } catch {
      // Without storage the width just resets on the next start.
    }
  }, []);
  return { left, setLeft, commit };
}

/** Width of an element, kept current: the fullscreen window resizes under the split. */
export function useWidth(el: HTMLElement | null): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!el) return;
    const read = () => setWidth(el.clientWidth);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  return width;
}
