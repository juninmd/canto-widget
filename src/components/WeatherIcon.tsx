import type { CSSProperties } from "react";
import type { WeatherCondition } from "../lib/api";

const after = (d: string) => ({ "--d": d }) as CSSProperties;

const CLOUD = (fill: string) => (
  <g fill={fill}>
    <circle cx="24" cy="40" r="9" />
    <circle cx="35" cy="33" r="12" />
    <circle cx="47" cy="41" r="8" />
    <rect x="24" y="40" width="23" height="9" rx="4" />
  </g>
);

function Sun({ x = 32, y = 32, r = 10 }: { x?: number; y?: number; r?: number }) {
  const rays = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <g>
      <g className="wx-ray-ring" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round">
        {rays.map((deg) => (
          <line key={deg} x1={x} y1={y - r - 4} x2={x} y2={y - r - 8} transform={`rotate(${deg} ${x} ${y})`} />
        ))}
      </g>
      <circle className="wx-sun" cx={x} cy={y} r={r} fill="#fbbf24" />
    </g>
  );
}

function Moon({ x = 30, y = 30 }: { x?: number; y?: number }) {
  return (
    <g>
      <path
        d={`M${x + 8} ${y + 12}a14 14 0 1 1-10-23 11 11 0 0 0 10 23z`}
        fill="#e2e8f0"
        transform={`translate(${x - 30} ${y - 30})`}
      />
      <circle className="wx-twinkle" cx={x + 14} cy={y - 12} r="1.6" fill="#fff" />
      <circle className="wx-twinkle" style={after("1.1s")} cx={x + 20} cy={y - 4} r="1.1" fill="#fff" />
    </g>
  );
}

const drop = (x: number, delay: string, key: string) => (
  <line
    key={key}
    className="wx-fall"
    style={after(delay)}
    x1={x}
    y1="50"
    x2={x - 2}
    y2="55"
    stroke="#7dd3fc"
    strokeWidth="2.4"
    strokeLinecap="round"
  />
);

/** The condition drawn as a small animated scene; `night` swaps the sun for the moon. */
export default function WeatherIcon({
  condition,
  night = false,
  className = "h-8 w-8",
}: {
  condition: WeatherCondition;
  night?: boolean;
  className?: string;
}) {
  const sky = night ? <Moon x={26} y={24} /> : <Sun x={26} y={24} r={8} />;
  let art;
  switch (condition) {
    case "clear":
      art = night ? <Moon /> : <Sun />;
      break;
    case "cloudy":
      art = (
        <>
          {sky}
          <g className="wx-drift">{CLOUD("#e2e8f0")}</g>
        </>
      );
      break;
    case "fog":
      art = (
        <>
          <g className="wx-drift">{CLOUD("#cbd5e1")}</g>
          {[0, 1, 2].map((i) => (
            <line
              key={i}
              className="wx-slide"
              style={after(`${i * 0.5}s`)}
              x1={16 + i * 3}
              y1={50 + i * 4}
              x2={46 + i * 3}
              y2={50 + i * 4}
              stroke="#e2e8f0"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.8"
            />
          ))}
        </>
      );
      break;
    case "drizzle":
      art = (
        <>
          <g className="wx-drift">{CLOUD("#cbd5e1")}</g>
          {drop(28, "0s", "a")}
          {drop(38, "0.5s", "b")}
        </>
      );
      break;
    case "rain":
      art = (
        <>
          <g className="wx-drift">{CLOUD("#94a3b8")}</g>
          {drop(26, "0s", "a")}
          {drop(35, "0.4s", "b")}
          {drop(44, "0.8s", "c")}
        </>
      );
      break;
    case "snow":
      art = (
        <>
          <g className="wx-drift">{CLOUD("#cbd5e1")}</g>
          {[27, 36, 45].map((x, i) => (
            <circle key={x} className="wx-fall" style={after(`${i * 0.45}s`)} cx={x} cy="52" r="2.2" fill="#fff" />
          ))}
        </>
      );
      break;
    case "storm":
      art = (
        <>
          <g className="wx-drift">{CLOUD("#64748b")}</g>
          <path className="wx-bolt" d="M35 44 28 54h6l-3 8 9-11h-6z" fill="#fde047" />
        </>
      );
      break;
  }
  return (
    <svg viewBox="0 0 64 64" className={`wx-icon ${className}`} aria-hidden="true" focusable="false">
      {art}
    </svg>
  );
}
