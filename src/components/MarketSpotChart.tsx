import { useId, useRef, useState, type PointerEvent } from "react";
import { smoothCurve } from "../lib/sparkline";

const W = 300;
const H = 112;
const PAD = 8;

type Props = {
  points: number[];
  times: number[];
  /** The previous close (or the period's first price): the dashed line the color is judged against. */
  baseline: number;
  up: boolean;
  label: string;
  price: (value: number) => string;
  time: (seconds: number) => string;
};

/**
 * The spotlight's curve with a min / mid / max scale on the right and a crosshair that tells the price and the
 * time under the pointer (or the finger). Labels are HTML so the stretched SVG cannot squash them.
 */
export default function MarketSpotChart({ points, times, baseline, up, label, price, time }: Props) {
  const gradient = useId();
  const box = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const low = Math.min(...points, baseline);
  const high = Math.max(...points, baseline);
  const span = high - low;
  const step = points.length > 1 ? W / (points.length - 1) : 0;
  const { line, area } = smoothCurve(points, points.map((_, i) => i * step), H, PAD, [low, high]);
  const y = (value: number) => (span === 0 ? H / 2 : H - PAD - ((value - low) / span) * (H - PAD * 2));
  const pct = (value: number) => `${(y(value) / H) * 100}%`;
  const last = points.length - 1;

  const track = (event: PointerEvent<HTMLDivElement>) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || last < 0) return;
    const ratio = (event.clientX - rect.left) / rect.width;
    setHover(Math.min(last, Math.max(0, Math.round(ratio * last))));
  };
  const at = hover ?? last;
  const left = last > 0 ? (at / last) * 100 : 100;

  return (
    <div className="flex gap-1.5">
      <div
        ref={box}
        role="img"
        aria-label={label}
        data-market-chart
        className="relative min-w-0 flex-1 touch-none"
        style={{ height: H }}
        onPointerMove={track}
        onPointerDown={track}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={`block h-full w-full ${up ? "text-ok" : "text-danger"}`} aria-hidden="true">
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[high, (high + low) / 2, low].map((value, i) => (
            <line key={i} x1="0" x2={W} y1={y(value)} y2={y(value)} className="stroke-edge" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="0" x2={W} y1={y(baseline)} y2={y(baseline)} className="stroke-muted" strokeOpacity="0.7" strokeDasharray="3 4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path className="wx-area" d={area} fill={`url(#${gradient})`} />
          <path className="wx-draw" d={line} pathLength={1} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {hover !== null && <line x1={hover * step} x2={hover * step} y1="0" y2={H} className="stroke-muted" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
        </svg>
        <span
          aria-hidden="true"
          data-market-end
          className={`absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-ink ${hover === null ? "canto-endpoint" : ""} ${up ? "bg-ok" : "bg-danger"}`}
          style={{ left: `${left}%`, top: pct(points[at]) }}
        />
        {hover !== null && (
          <span
            data-market-tip
            className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-edge bg-panel px-1.5 py-0.5 text-[11px] shadow-lg"
            style={{ left: `clamp(2.5rem, ${left}%, calc(100% - 2.5rem))` }}
          >
            <b className="font-semibold tabular-nums text-fg">{price(points[hover])}</b>
            {times[hover] ? <span className="ml-1 text-faint">{time(times[hover])}</span> : null}
          </span>
        )}
      </div>
      <div aria-hidden="true" className="relative w-12 shrink-0 font-mono text-[9.5px] tabular-nums text-faint">
        {[high, (high + low) / 2, low].map((value, i) => (
          <span key={i} className="absolute right-0 -translate-y-1/2" style={{ top: pct(value) }}>
            {price(value)}
          </span>
        ))}
      </div>
    </div>
  );
}
