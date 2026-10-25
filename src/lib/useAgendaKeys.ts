import { useEffect, useRef } from "react";

export type AgendaKey = "prev" | "next" | "today" | "join";

const KEYS: Record<string, AgendaKey> = { "[": "prev", "]": "next", h: "today", H: "today", j: "join", J: "join" };

/** Bare keys, so they only count outside text fields (same rule as the global shortcuts). */
export function useAgendaKeys(active: boolean, run: (k: AgendaKey) => void) {
  const ref = useRef(run);
  ref.current = run;
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
      const key = KEYS[e.key];
      if (!key || typing || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      ref.current(key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);
}
