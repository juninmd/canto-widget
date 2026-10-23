import type { CSSProperties } from "react";
import { LEVEL_COLOR, slowLevel, todayHistory } from "../lib/traffic";
import { t } from "../i18n";

const W = 300;
const H = 36;
/** The line tops out here: past 60% slower the city is at a standstill anyway. */
const TOP = 60;

/** How much slower than free flow the roads around the start are, plus today's readings as a line. */
export default function MapPulse({ slowdown, history, now }: { slowdown: number | null; history: [number, number][]; now: number }) {
  const level = slowdown === null ? null : slowLevel(slowdown);
  const color = level ? LEVEL_COLOR[level] : "var(--color-faint)";
  const arc = slowdown === null ? 0 : (141 * Math.min(slowdown, TOP)) / TOP;
  const today = todayHistory(history, now);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const sx = (at: number) => ((at - start.getTime()) / 86_400_000) * W;
  const sy = (v: number) => H - (Math.min(v, TOP) / TOP) * H;
  const line = today.map(([at, v], i) => `${i ? "L" : "M"}${sx(at).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
  const last = today[today.length - 1];
  return (
    <section data-map-pulse aria-label={t("map.pulse.title")} className="wx-glass wx-rise grid shrink-0 grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 p-3" style={{ "--i": 1, "--lvl": color } as CSSProperties}>
      <div className="relative row-span-2 h-[68px] w-[68px]">
        <svg viewBox="0 0 70 70" className="h-full w-full rotate-[135deg]" aria-hidden="true">
          <circle cx="35" cy="35" r="30" fill="none" stroke="var(--color-edge)" strokeWidth="7" strokeLinecap="round" strokeDasharray="141 189" />
          <circle cx="35" cy="35" r="30" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${arc} 189`} className="map-gauge" />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <b className="text-base font-bold tabular-nums text-fg">{slowdown === null ? "–" : `${slowdown}%`}</b>
          <small className="text-[8px] text-faint">{t("map.pulse.slower")}</small>
        </span>
      </div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
        {t("map.pulse.title")}
        {level && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color, background: `color-mix(in srgb, ${color} 18%, transparent)` }}>
            {t(`map.level.${level}`)}
          </span>
        )}
      </h3>
      <p className="text-xs leading-snug text-muted">{slowdown === null ? t("map.pulse.none") : t("map.pulse.text", { n: slowdown })}</p>
      {today.length > 1 && (
        <div className="col-span-2 mt-1">
          <svg viewBox={`0 0 ${W} ${H + 10}`} preserveAspectRatio="none" className="h-[44px] w-full overflow-visible" role="img" aria-label={t("map.pulse.history")}>
            <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            {last && <circle cx={sx(last[0])} cy={sy(last[1])} r="3" fill={color} />}
            {[0, 6, 12, 18].map((h) => (
              <text key={h} x={(h / 24) * W + 2} y={H + 10} className="fill-faint text-[9px]">
                {h}h
              </text>
            ))}
          </svg>
        </div>
      )}
    </section>
  );
}
