import { useEffect, useState, useSyncExternalStore } from "react";
import { focusStore, type Running } from "./focus";

export function useRunning(): Running | null {
  return useSyncExternalStore(focusStore.subscribe, focusStore.get);
}

/** Past the boundary, so a late-but-on-time timer never reads the second before it. */
const SLACK_MS = 15;

/**
 * Re-renders while `active`, right as the running total reaches `offsetMs` past a multiple of `periodMs` (each second
 * for a clock, each minute for a minute count). A plain 1 s interval drifts against the run's own second and makes the clock
 * skip or repeat a digit; this one re-aims at the next boundary on every tick.
 */
export function useTick(active: boolean, periodMs = 1000, offsetMs = 0): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!active) return;
    let id: ReturnType<typeof setTimeout>;
    const arm = () => {
      id = setTimeout(() => {
        setNow(Date.now());
        arm();
      }, focusStore.msToNext(periodMs, offsetMs) + SLACK_MS);
    };
    setNow(Date.now());
    arm();
    return () => clearTimeout(id);
  }, [active, periodMs, offsetMs]);
  return now;
}
