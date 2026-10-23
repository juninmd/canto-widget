import { useEffect, useState } from "react";
import { exitDuration } from "../lib/motion";
import { count } from "../lib/steam";

/** Only animates when the system says motion is welcome, the same rule as every exit. */
const still = () => exitDuration() === 0;

/** A number that counts up to its value when it first shows; still when motion is reduced. */
export default function SteamCountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(() => (still() ? value : 0));
  useEffect(() => {
    if (still() || typeof requestAnimationFrame === "undefined") {
      setShown(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 700);
      setShown(Math.round(value * (1 - (1 - k) ** 3)));
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{count(shown)}</>;
}
