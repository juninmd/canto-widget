import { useId } from "react";
import { smoothCurve } from "../lib/sparkline";

/** A row's small curve over a fading area, with the previous close as a dotted line so its color reads right. */
export default function MarketChart({ points, up, baseline, width, height }: { points: number[]; up: boolean; baseline?: number | null; width: number; height: number }) {
  const gradient = useId();
  const step = points.length > 1 ? width / (points.length - 1) : 0;
  const values = baseline == null ? points : [...points, baseline];
  const range: [number, number] = [Math.min(...values), Math.max(...values)];
  const { line, area } = smoothCurve(points, points.map((_, i) => i * step), height, 2, range);
  const span = range[1] - range[0];
  const baseY = baseline == null || span === 0 ? null : height - 2 - ((baseline - range[0]) / span) * (height - 4);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={`block w-full ${up ? "text-ok" : "text-danger"}`} style={{ height }} aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {baseY !== null && (
        <line x1="0" x2={width} y1={baseY} y2={baseY} className="stroke-faint" strokeDasharray="2 3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      )}
      <path d={area} fill={`url(#${gradient})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
