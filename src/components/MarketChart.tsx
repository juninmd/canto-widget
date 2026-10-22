import { useId } from "react";
import { smoothCurve } from "../lib/sparkline";

/** A smooth curve over a fading area, colored by the day's direction; `draw` animates the stroke in. */
export default function MarketChart({ points, up, width, height, draw = false }: { points: number[]; up: boolean; width: number; height: number; draw?: boolean }) {
  const gradient = useId();
  const step = points.length > 1 ? width / (points.length - 1) : 0;
  const { line, area } = smoothCurve(points, points.map((_, i) => i * step), height, 3);
  const svg = (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`block w-full ${up ? "text-ok" : "text-danger"}`}
      style={{ height }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.32" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className={draw ? "wx-area" : undefined} d={area} fill={`url(#${gradient})`} />
      <path
        className={draw ? "wx-draw" : undefined}
        d={line}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect={draw ? undefined : "non-scaling-stroke"}
      />
    </svg>
  );
  if (!draw || points.length === 0) return svg;
  // The last point as an HTML dot: inside the stretched SVG a circle would turn into an ellipse.
  const min = Math.min(...points);
  const span = Math.max(...points) - min;
  const y = span === 0 ? height / 2 : height - 3 - ((points[points.length - 1] - min) / span) * (height - 6);
  return (
    <div className="relative">
      {svg}
      <span
        aria-hidden="true"
        data-market-end
        className={`canto-endpoint absolute right-0.5 size-1.5 -translate-y-1/2 rounded-full ${up ? "bg-ok" : "bg-danger"}`}
        style={{ top: `${(y / height) * 100}%` }}
      />
    </div>
  );
}
