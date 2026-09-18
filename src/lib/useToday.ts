import { useEffect, useRef, useState } from "react";
import { todayLocal } from "./api";

const TICK_MS = 30_000;

/**
 * The widget stays open all night. Without this clock, `todayLocal()` is
 * computed once on mount and the tasks tab stays on yesterday until
 * something else triggers a re-render.
 */
export function useToday(now: () => Date = () => new Date()): string {
  const [day, setDay] = useState(() => todayLocal(now()));
  const clock = useRef(now);
  clock.current = now;
  useEffect(() => {
    const t = setInterval(() => {
      setDay((current) => {
        const today = todayLocal(clock.current());
        return today === current ? current : today;
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, []);
  return day;
}
