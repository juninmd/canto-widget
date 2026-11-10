import { useEffect, useRef, useState } from "react";

/** A price that flashes green or red when a refresh moves it, like a broker's board; the first value stays still. */
export default function PriceTick({ value, text, className = "" }: { value: number; text: string; className?: string }) {
  const prev = useRef(value);
  const [tick, setTick] = useState<{ dir: "up" | "down"; n: number } | null>(null);

  useEffect(() => {
    if (value === prev.current) return;
    const dir = value > prev.current ? "up" : "down";
    prev.current = value;
    setTick((old) => ({ dir, n: (old?.n ?? 0) + 1 }));
  }, [value]);

  return (
    <span key={tick?.n ?? 0} data-tick={tick?.dir} className={`${className} ${tick ? `canto-tick-${tick.dir}` : ""}`}>
      {text}
    </span>
  );
}
