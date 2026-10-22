import type { CSSProperties } from "react";
import type { WeatherDay } from "../lib/api";
import { conditionKey, degrees, weekday } from "../lib/weather";
import { t } from "../i18n";
import WeatherIcon from "./WeatherIcon";

type Props = { days: WeatherDay[]; selected: number; onPick: (index: number) => void; index: number };

/** The days ahead as cards in a row; picking one turns the hourly chart to that day. */
export default function WeatherDays({ days, selected, onPick, index }: Props) {
  return (
    <section className="wx-glass wx-rise flex shrink-0 flex-col gap-1.5 p-2" style={{ "--i": index } as CSSProperties}>
      <h3 className="flex items-center justify-between gap-2 px-1 text-[11px] text-faint">
        <span>{t("weather.days")}</span>
        <span className="truncate">{t("weather.pickDay")}</span>
      </h3>
      <ul className="flex gap-1.5 overflow-x-auto px-0.5 pb-1 [scrollbar-width:none]">
        {days.map((day, i) => (
          <li key={day.date} className="shrink-0">
            <button
              type="button"
              data-weather-day={day.date}
              aria-pressed={i === selected}
              onClick={() => onPick(i)}
              title={t("weather.rain", { n: day.rain })}
              className="wx-pick canto-hit flex w-[68px] flex-col items-center gap-0.5 rounded-xl border border-edge bg-panel px-1 py-2 tabular-nums hover:bg-hover aria-pressed:border-accent aria-pressed:bg-accent/10"
            >
              <span className={`text-[11px] ${i === selected ? "font-semibold text-fg" : "text-muted"}`}>
                {i === 0 ? t("weather.today") : weekday(day.date)}
              </span>
              <WeatherIcon condition={day.condition} className="h-7 w-7" />
              <span className="sr-only">{t(conditionKey(day.condition))}</span>
              <span className="text-[13px] font-semibold text-fg">{degrees(day.max)}°</span>
              <span className="text-[11px] text-faint">{degrees(day.min)}°</span>
              <span className={`min-h-[13px] text-[10px] font-semibold text-sky-400 ${day.rain >= 30 ? "" : "invisible"}`}>
                <span aria-hidden="true">💧</span>
                {day.rain}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
