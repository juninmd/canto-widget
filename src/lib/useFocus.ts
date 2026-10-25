import { useEffect, useState, useSyncExternalStore } from "react";
import { focusStore, type Running } from "./focus";
import { useWindowVisible } from "./useWindowVisible";

export function useRunning(): Running | null {
  return useSyncExternalStore(focusStore.subscribe, focusStore.get);
}

/** Re-renders every second while `active` and on screen; only the components that show the clock call it. */
export function useTick(active: boolean): number {
  const [now, setNow] = useState(Date.now);
  // The tracked time lives in `focusStore`, so a hidden clock skips nothing; it reads the total on return.
  const visible = useWindowVisible();
  const on = active && visible;
  useEffect(() => {
    if (!on) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [on]);
  return now;
}
