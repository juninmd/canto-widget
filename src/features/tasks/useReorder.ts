import { useEffect, useRef, useState } from "react";

/** Moves `id` to where `target` sits; returns null when nothing changes. */
export function moveId(ids: string[], id: string, target: string): string[] | null {
  const from = ids.indexOf(id);
  const to = ids.indexOf(target);
  if (from < 0 || to < 0 || from === to) return null;
  const out = ids.slice();
  out.splice(from, 1);
  out.splice(to, 0, id);
  return out;
}

/** Puts a filtered subset's new order back into the full list: hidden items keep their slots. */
export function mergeOrder(all: string[], visible: string[]): string[] {
  const shown = new Set(visible);
  let next = 0;
  return all.map((id) => (shown.has(id) ? visible[next++] : id));
}

/**
 * Pointer-driven reordering. HTML5 drag-and-drop is swallowed by the Tauri file-drop handler on
 * Windows and never starts in WKWebView (macOS) without dataTransfer data, so it can't be relied on.
 */
export function useReorder(ids: string[], onCommit: (ids: string[]) => void) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOverState] = useState<string | null>(null);
  const latest = useRef({ ids, onCommit, dragging });
  latest.current = { ids, onCommit, dragging };
  // A ref, not just state: pointerup can land before React re-renders the last hover.
  const overRef = useRef<string | null>(null);
  const setOver = (id: string | null) => {
    overRef.current = id;
    setOverState(id);
  };

  useEffect(() => {
    if (!dragging) return;
    const end = () => {
      const { ids, onCommit, dragging } = latest.current;
      const over = overRef.current;
      setDragging(null);
      setOver(null);
      const next = dragging && over ? moveId(ids, dragging, over) : null;
      if (next) onCommit(next);
    };
    const cancel = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setDragging(null);
      setOver(null);
    };
    // Touch and pen pointers are implicitly captured by the grip, so hover events never reach other rows.
    const move = (e: PointerEvent) => {
      const row = document.elementFromPoint?.(e.clientX, e.clientY)?.closest<HTMLElement>("[data-reorder-id]");
      const id = row?.dataset.reorderId;
      if (id && overRef.current !== id) setOver(id);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    window.addEventListener("keydown", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      window.removeEventListener("keydown", cancel);
    };
  }, [dragging]);

  return {
    dragging,
    over,
    start: (id: string) => {
      setDragging(id);
      setOver(id);
    },
    hover: (id: string) => {
      if (latest.current.dragging && overRef.current !== id) setOver(id);
    },
    /** Keyboard alternative: moves one slot up (-1) or down (+1). */
    step: (id: string, delta: -1 | 1) => {
      const i = ids.indexOf(id);
      const target = ids[i + delta];
      const next = target ? moveId(ids, id, target) : null;
      if (next) onCommit(next);
    },
  };
}
