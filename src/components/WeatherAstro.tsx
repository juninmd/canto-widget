import type { CSSProperties } from "react";
import type { WeatherDay } from "../lib/api";
import { moon, moonPath } from "../lib/moon";
import { clock, hourOf } from "../lib/weather";
import { t } from "../i18n";
import { duration } from "../lib/summary";

const W = 140;
const BASE = 62;

const hm = (hours: number) => duration(Math.round(hours * 60));

/** Where the sun is on today's arc, how much daylight is left, and the moon's phase as seen from the city's hemisphere. */
export default function WeatherAstro({ today, nowAt, lat, index }: { today: WeatherDay | undefined; nowAt: string; lat: number; index: number }) {
  const rise = today?.sunrise ? hourOf(today.sunrise) : Number.NaN;
  const set = today?.sunset ? hourOf(today.sunset) : Number.NaN;
  const now = hourOf(nowAt);
  const known = Number.isFinite(rise) && Number.isFinite(set) && Number.isFinite(now);
  const up = known && now >= rise && now < set;
  const f = known ? Math.max(0, Math.min(1, (now - rise) / (set - rise))) : 0;
  const angle = Math.PI * (1 - f);
  const sx = W / 2 + Math.cos(angle) * 60;
  const sy = BASE - Math.sin(angle) * 46;
  const m = moon(Date.now());
  return (
    <div data-weather-astro className="wx-rise grid shrink-0 grid-cols-[1.4fr_1fr] gap-1.5" style={{ "--i": index } as CSSProperties}>
      <div className="wx-glass flex min-w-0 flex-col gap-1 p-2">
        <h3 className="flex justify-between gap-1 text-[11px] text-faint">
          <span>{t("weather.sun")}</span>
          <span className="truncate tabular-nums">{up ? t("weather.daylightLeft", { time: hm(set - now) }) : known ? t("weather.sunDown") : ""}</span>
        </h3>
        <svg viewBox={`0 0 ${W} 78`} className="h-20 w-full" aria-hidden="true">
          <path d={`M10 ${BASE} A60 46 0 0 1 130 ${BASE}`} fill="none" stroke="var(--color-edge)" strokeWidth="2" strokeDasharray="3 4" />
          {known && f > 0 && (
            <path d={`M10 ${BASE} A60 46 0 0 1 ${sx.toFixed(1)} ${sy.toFixed(1)}`} fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          )}
          <line x1="2" y1={BASE} x2={W - 2} y2={BASE} stroke="var(--color-edge)" />
          {up && (
            <g>
              <circle cx={sx} cy={sy} r="10" fill="#fbbf24" opacity=".25" />
              <circle cx={sx} cy={sy} r="5.5" fill="#fbbf24" />
            </g>
          )}
          <text x="4" y="76" fontSize="10" fill="var(--color-faint)">
            {today?.sunrise ? clock(today.sunrise) : "–"}
          </text>
          <text x={W - 4} y="76" fontSize="10" fill="var(--color-faint)" textAnchor="end">
            {today?.sunset ? clock(today.sunset) : "–"}
          </text>
        </svg>
        <span className="sr-only">
          {t("weather.sunrise")} {today?.sunrise ? clock(today.sunrise) : "–"}, {t("weather.sunset")} {today?.sunset ? clock(today.sunset) : "–"}
        </span>
      </div>
      <div className="wx-glass flex min-w-0 flex-col gap-1 p-2">
        <h3 className="text-[11px] text-faint">{t("weather.moon")}</h3>
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 44 44" className="h-11 w-11 shrink-0" aria-hidden="true">
            <circle cx="22" cy="22" r="18" fill="var(--color-edge)" />
            <path d={moonPath(m, lat < 0, 22, 18)} fill="#f1f5f9" />
          </svg>
          <div className="min-w-0 text-[10.5px] leading-snug text-faint">
            <b className="block truncate text-xs font-semibold text-fg">{t(`weather.moon.${m.phase}`)}</b>
            {t("weather.moon.lit", { n: Math.round(m.lit * 100) })}
            {m.phase !== "full" && m.toFull > 0 && <span className="block">{t("weather.moon.toFull", { n: m.toFull })}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
