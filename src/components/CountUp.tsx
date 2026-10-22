import { useEffect, useRef, useState } from "react";
import { exitDuration } from "../lib/motion";

const COUNT_MS = 700;

/** A number that runs up to its value when it first shows or changes; with less motion it is just the number. */
export default function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(() => (exitDuration() > 0 ? 0 : value));
  const from = useRef(shown);

  useEffect(() => {
    if (exitDuration() === 0 || typeof requestAnimationFrame === "undefined") {
      setShown(value);
      return;
    }
    const start = performance.now();
    const base = from.current;
    let frame = requestAnimationFrame(function step(now) {
      const k = Math.min(1, (now - start) / COUNT_MS);
      const n = base + (value - base) * (1 - (1 - k) ** 3);
      from.current = n;
      setShown(k === 1 ? value : n);
      if (k < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{format(shown)}</>;
}
