import { useEffect, useRef } from "react";

/** Runs `onRefocus` when the window regains focus or becomes visible, so a widget left in the tray catches up. */
export function useRefocus(onRefocus: () => void, active = true) {
  const ref = useRef(onRefocus);
  ref.current = onRefocus;
  useEffect(() => {
    if (!active) return;
    const focus = () => ref.current();
    const visible = () => {
      if (!document.hidden) ref.current();
    };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [active]);
}
