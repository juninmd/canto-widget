import { useState, type CSSProperties } from "react";
import type { WeatherDay, WeatherHour } from "../lib/api";
import { smoothCurve } from "../lib/sparkline";
import { clock, conditionKey, degrees, hourOf, isNight } from "../lib/weather";
import { LOCALE, t } from "../i18n";
import WeatherIcon from "./WeatherIcon";

const COL = 52;
/** Rows of each column: time, icon, value, the chart, the rain pill. */
const ROWS = [16, 26, 18, 56, 22];
const CHART_TOP = ROWS[0] + ROWS[1] + ROWS[2];
const CHART = ROWS[3];
/** From this chance on an hour joins the shaded rain band. */
const BAND = 45;
type Mode = "temp" | "rain" | "wind";
const MODES: Mode[] = ["temp", "rain", "wind"];

/** Runs of consecutive rainy hours, as [first, last] column indexes. */
function rainRuns(hours: WeatherHour[]): [number, number][] {
  const runs: [number, number][] = [];
  hours.forEach((hour, i) => {
    if (hour.rain < BAND) return;
    const last = runs[runs.length - 1];
    if (last && last[1] === i - 1) last[1] = i;
    else runs.push([i, i]);
  });
  return runs;
}

/** Sunrise and sunset inside the columns, as an x and the time to print next to the mark. */
function sunMarks(hours: WeatherHour[], days: WeatherDay[]): { x: number; at: string }[] {
  const marks: { x: number; at: string }[] = [];
  for (const day of days)
    for (const at of [day.sunrise, day.sunset]) {
      const i = at ? hours.findIndex((hour) => hour.at.slice(0, 13) === at.slice(0, 13)) : -1;
      if (i >= 0) marks.push({ x: i * COL + COL / 2 + (hourOf(at) % 1) * COL, at });
    }
  return marks;
}

type Props = { hours: WeatherHour[]; days: WeatherDay[]; title: string; isToday: boolean; index: number };

/** Every hour as a column: a temperature, rain or wind chart, the shaded hours when it rains and each hour's chance. */
export default function WeatherHours({ hours, days, title, isToday, index }: Props) {
  const [mode, setMode] = useState<Mode>("temp");
  const [feels, setFeels] = useState(false);
  const width = hours.length * COL;
  const xs = hours.map((_, i) => i * COL + COL / 2);
  const values = hours.map((hour) => (mode === "wind" ? (hour.wind ?? 0) : hour.temp));
  const feelsValues = hours.map((hour) => hour.feels ?? hour.temp);
  const shown = mode === "temp" && feels ? [...values, ...feelsValues] : values;
  const range: [number, number] = [Math.min(...shown), Math.max(...shown)];
  const curve = smoothCurve(values, xs, CHART, 8, range);
  const feelsCurve = mode === "temp" && feels ? smoothCurve(feelsValues, xs, CHART, 8, range).line : "";
  return (
    <section className="wx-glass wx-rise flex shrink-0 flex-col gap-1.5 p-2" style={{ "--i": index } as CSSProperties}>
      <h3 className="flex items-center justify-between gap-2 px-1 text-[11px] text-faint">
        <span>{title}</span>
        {mode === "temp" && (
          <button type="button" aria-pressed={feels} onClick={() => setFeels(!feels)} className="canto-hit wx-toggle flex items-center gap-1.5 rounded-full px-1 hover:text-fg">
            <i aria-hidden="true" />
            {t("weather.feelsToggle")}
          </button>
        )}
      </h3>
      <div role="group" aria-label={title} className="flex flex-wrap gap-1 px-1">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className="canto-hit rounded-full border border-edge px-2.5 py-0.5 text-[11px] text-muted hover:text-fg aria-pressed:border-accent/50 aria-pressed:bg-accent/15 aria-pressed:text-accent-text"
          >
            {t(`weather.mode.${m}`)}
          </button>
        ))}
      </div>
      {hours.length === 0 ? (
        <p className="px-1 py-4 text-center text-xs text-faint">{t("weather.noHours")}</p>
      ) : (
        <div data-weather-hours role="group" aria-label={title} tabIndex={0} className="overflow-x-auto pb-1">
          <div style={{ width }} className="relative">
            {rainRuns(hours).map(([a, b]) => (
              <span key={a} className="wx-band" style={{ left: a * COL + 2, width: (b - a + 1) * COL - 4 } as CSSProperties} aria-hidden="true">
                {Array.from({ length: (b - a + 1) * 5 }, (_, j) => (
                  <i key={j} style={{ "--x": `${(j * 37) % 100}%`, "--d": `${-(j % 7) * 0.15}s` } as CSSProperties} />
                ))}
              </span>
            ))}
            <svg
              viewBox={`0 0 ${width} ${CHART}`}
              width={width}
              height={CHART}
              className="pointer-events-none absolute left-0 text-accent"
              style={{ top: CHART_TOP }}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="wx-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              {sunMarks(hours, days).map(({ x, at }) => (
                <g key={at} className="text-amber-400">
                  <line x1={x} y1="0" x2={x} y2={CHART} stroke="currentColor" strokeOpacity=".6" strokeDasharray="2 3" />
                  <text x={x + 3} y={CHART - 3} fontSize="9" fill="currentColor">
                    {clock(at)}
                  </text>
                </g>
              ))}
              {mode === "rain" ? (
                hours.map((hour, i) => {
                  const h = Math.max(2, (hour.rain / 100) * (CHART - 6));
                  return <rect key={hour.at} className="wx-bar" x={xs[i] - 11} y={CHART - h} width="22" height={h} rx="4" fill="#38bdf8" opacity={0.3 + hour.rain / 140} />;
                })
              ) : (
                <>
                  <path key={`a${mode}`} className="wx-area" d={curve.area} fill="url(#wx-area)" />
                  {feelsCurve && <path d={feelsCurve} fill="none" stroke="#fbbf24" strokeWidth="1.6" strokeDasharray="4 4" />}
                  <path key={`l${mode}`} className="wx-draw" d={curve.line} pathLength={1} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
              {isToday && <line x1={xs[0]} y1="0" x2={xs[0]} y2={CHART} stroke="var(--color-fg)" strokeOpacity=".3" strokeDasharray="2 3" />}
            </svg>
            <ol className="relative flex">
              {hours.map((hour, i) => (
                <li
                  key={hour.at}
                  data-weather-hour={hour.at}
                  title={`${t(conditionKey(hour.condition))} · ${t("weather.rain", { n: hour.rain })}`}
                  className="grid shrink-0 justify-items-center text-fg"
                  style={{ width: COL, gridTemplateRows: ROWS.map((r) => `${r}px`).join(" ") }}
                >
                  <span className="text-[10px] tabular-nums text-faint">{i === 0 && isToday ? t("weather.now") : clock(hour.at)}</span>
                  <WeatherIcon condition={hour.condition} night={isNight(hour.at, days)} className="h-6 w-6" />
                  <span className="text-xs font-semibold tabular-nums">
                    {mode === "temp" && `${degrees(hour.temp)}°`}
                    {mode === "rain" && `${hour.rain}%`}
                    {mode === "wind" && (
                      <>
                        <span aria-hidden="true" className="inline-block text-accent-text" style={{ transform: `rotate(${(hour.wind_dir ?? 0) + 180}deg)` }}>
                          ↑
                        </span>
                        {degrees(hour.wind ?? 0)}
                      </>
                    )}
                  </span>
                  <span />
                  <RainPill hour={hour} mode={mode} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}

/** Each hour's chance of rain, or its millimetres on the rain chart; a dash when there is nothing to say. */
function RainPill({ hour, mode }: { hour: WeatherHour; mode: Mode }) {
  const mm = hour.precip ?? 0;
  const wet = mode === "rain" ? mm >= 0.1 : hour.rain >= 10;
  return (
    <span
      className={`flex h-[18px] w-[44px] items-center justify-center rounded-full text-[10px] font-semibold tabular-nums ${wet ? "bg-sky-400/30 text-fg" : "bg-edge/60 text-faint"}`}
    >
      {!wet ? "–" : mode === "rain" ? `${mm.toLocaleString(LOCALE, { maximumFractionDigits: 1 })} mm` : `${hour.rain}%`}
    </span>
  );
}
