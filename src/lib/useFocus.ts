import { useEffect, useState, useSyncExternalStore } from "react";
import { focusStore, type Running } from "./focus";

export function useRunning(): Running | null {
  return useSyncExternalStore(focusStore.subscribe, focusStore.get);
}

/** Re-renders every second while `active`; only the components that show the clock call it. */
export function useTick(active: boolean): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}
