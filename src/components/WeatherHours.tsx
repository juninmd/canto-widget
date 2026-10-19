import type { CSSProperties } from "react";
import type { WeatherDay, WeatherHour } from "../lib/api";
import { smoothCurve } from "../lib/sparkline";
import { clock, conditionKey, degrees, isNight } from "../lib/weather";
import { t } from "../i18n";
import WeatherIcon from "./WeatherIcon";

const COL = 52;
const CURVE = 52;

/** Every hour as a column under one smooth temperature curve; the strip scrolls sideways when it outgrows the card. */
export default function WeatherHours({ hours, days, index }: { hours: WeatherHour[]; days: WeatherDay[]; index: number }) {
  const width = hours.length * COL;
  const { line, area } = smoothCurve(
    hours.map((hour) => hour.temp),
    hours.map((_, i) => i * COL + COL / 2),
    CURVE,
  );
  return (
    <section className="wx-glass wx-rise shrink-0 p-2" style={{ "--i": index } as CSSProperties}>
      <h3 className="px-1 pb-1 text-[11px] text-faint">{t("weather.hours")}</h3>
      <div data-weather-hours role="group" aria-label={t("weather.hours")} tabIndex={0} className="overflow-x-auto pb-1">
        <div style={{ width }} className="relative text-accent">
          <svg viewBox={`0 0 ${width} ${CURVE}`} width={width} height={CURVE} aria-hidden="true">
            <defs>
              <linearGradient id="wx-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="wx-area" d={area} fill="url(#wx-area)" />
            <path className="wx-draw" d={line} pathLength={1} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <ol className="flex">
            {hours.map((hour, i) => (
              <li
                key={hour.at}
                data-weather-hour={hour.at}
                title={`${t(conditionKey(hour.condition))} · ${t("weather.rain", { n: hour.rain })}`}
                className="flex shrink-0 flex-col items-center gap-0.5 text-fg"
                style={{ width: COL }}
              >
                <span className="text-[10px] tabular-nums text-faint">{i === 0 ? t("weather.now") : clock(hour.at)}</span>
                <WeatherIcon condition={hour.condition} night={isNight(hour.at, days)} className="h-6 w-6" />
                <span className="text-xs font-semibold tabular-nums">{degrees(hour.temp)}°</span>
                <span className={`text-[10px] tabular-nums ${hour.rain >= 30 ? "text-sky-400" : "invisible"}`}>{hour.rain}%</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
