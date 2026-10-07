import { t } from "../i18n";
import { chart } from "../lib/health";
import type { HealthSample, HealthState } from "../lib/healthTypes";

const TONE: Record<HealthState, string> = { up: "text-ok", slow: "text-warn", down: "text-danger", unknown: "text-faint" };
const W = 372;
const H = 150;

/** Latency of the last readings with the limit as a dashed line; outages are shaded and break the line. */
export default function LatencyChart({ name, samples, limit, state }: { name: string; samples: HealthSample[]; limit: number; state: HealthState }) {
  const c = chart(samples, limit, W, H);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("health.chart.aria", { name })} className={`block h-auto w-full ${TONE[state]}`}>
      {c.ticks.map((tick) => (
        <g key={tick.label}>
          <line x1={34} x2={W - 8} y1={tick.y} y2={tick.y} className="stroke-edge" />
          <text x={29} y={tick.y + 3} textAnchor="end" className="fill-faint text-[10px]">
            {tick.label}
          </text>
        </g>
      ))}
      {c.down.map((d) => (
        <rect key={d.x} x={d.x} y={10} width={d.w} height={H - 30} className="fill-danger" opacity={0.18} />
      ))}
      <line x1={34} x2={W - 8} y1={c.limitY} y2={c.limitY} strokeDasharray="4 3" className="stroke-warn" />
      <text x={W - 8} y={c.limitY - 4} textAnchor="end" className="fill-warn text-[10px]">
        {t("health.chart.limit", { ms: limit })}
      </text>
      <path d={c.area} fill="currentColor" opacity={0.12} />
      <path d={c.line} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
      {c.last && <circle cx={c.last.x} cy={c.last.y} r={3.5} fill="currentColor" />}
      <text x={34} y={H - 4} className="fill-faint text-[10px]">
        {t("health.chart.before")}
      </text>
      <text x={W - 8} y={H - 4} textAnchor="end" className="fill-faint text-[10px]">
        {t("health.now")}
      </text>
    </svg>
  );
}
