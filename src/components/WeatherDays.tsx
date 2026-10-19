import type { CSSProperties } from "react";
import type { WeatherDay } from "../lib/api";
import { conditionKey, degrees, rangeBar, weekday } from "../lib/weather";
import { t } from "../i18n";
import WeatherIcon from "./WeatherIcon";

/** The days ahead, each with its own min..max bar placed inside the week's range so the days compare at a glance. */
export default function WeatherDays({ days, index }: { days: WeatherDay[]; index: number }) {
  const lo = Math.min(...days.map((d) => d.min));
  const hi = Math.max(...days.map((d) => d.max));
  return (
    <section className="wx-glass wx-rise shrink-0 p-2" style={{ "--i": index } as CSSProperties}>
      <h3 className="px-1 pb-1 text-[11px] text-faint">{t("weather.days")}</h3>
      <ul className="flex flex-col">
        {days.map((day, i) => {
          const bar = rangeBar(day, lo, hi);
          return (
            <li key={day.date} data-weather-day={day.date} className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-hover">
              <span className="w-11 shrink-0 text-xs text-muted">{i === 0 ? t("weather.today") : weekday(day.date)}</span>
              <WeatherIcon condition={day.condition} className="h-6 w-6 shrink-0" />
              <span className="sr-only">{t(conditionKey(day.condition))}</span>
              <span
                title={t("weather.rain", { n: day.rain })}
                className={`w-9 shrink-0 text-[10px] tabular-nums ${day.rain >= 30 ? "text-sky-400" : "invisible"}`}
              >
                {day.rain >= 30 && <span aria-hidden="true">💧</span>}
                {day.rain}%
              </span>
              <span className="w-7 shrink-0 text-right text-xs tabular-nums text-faint">{degrees(day.min)}°</span>
              <span className="wx-range min-w-8 flex-1" aria-hidden="true">
                <span style={{ "--from": `${bar.from}%`, "--span": `${bar.span}%` } as CSSProperties} />
              </span>
              <span className="w-7 shrink-0 text-xs font-semibold tabular-nums text-fg">{degrees(day.max)}°</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
