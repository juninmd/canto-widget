import { useEffect, useRef } from "react";
import { REFRESH_EVENT, type RefreshDetail } from "./refreshEvent";

/** Runs `run` when the palette (or coming back online) asks the current tab to reload; `tab` filters broadcasts aimed elsewhere. */
export function useRefreshEvent(tab: string, run: () => void) {
  const ref = useRef(run);
  ref.current = run;
  useEffect(() => {
    const on = (e: Event) => {
      const target = (e as CustomEvent<RefreshDetail>).detail?.tab;
      if (!target || target === tab) ref.current();
    };
    window.addEventListener(REFRESH_EVENT, on);
    return () => window.removeEventListener(REFRESH_EVENT, on);
  }, [tab]);
}
