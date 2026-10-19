import type { CSSProperties, ReactNode } from "react";
import type { WeatherDay, WeatherNow } from "../lib/api";
import { clock, degrees, uvKey } from "../lib/weather";
import { t } from "../i18n";

function Tile({ label, index, children }: { label: string; index: number; children: ReactNode }) {
  return (
    <div className="wx-glass wx-rise flex min-w-0 flex-col gap-0.5 p-2" style={{ "--i": index } as CSSProperties}>
      <span className="truncate text-[10px] uppercase tracking-wide text-faint">{label}</span>
      {children}
    </div>
  );
}

const VALUE = "text-sm font-semibold tabular-nums text-fg";

/** The six readings behind the headline: humidity, wind (with its direction), UV, the sun and today's rain chance. */
export default function WeatherDetails({ now, today, first }: { now: WeatherNow; today: WeatherDay | undefined; first: number }) {
  return (
    <div data-weather-details className="grid shrink-0 grid-cols-3 gap-2">
      <Tile label={t("weather.humidity")} index={first}>
        <span className={VALUE}>{now.humidity}%</span>
        <span className="h-1 overflow-hidden rounded-full bg-edge" aria-hidden="true">
          <span className="block h-full rounded-full bg-sky-400" style={{ width: `${now.humidity}%` }} />
        </span>
      </Tile>
      <Tile label={t("weather.wind")} index={first + 1}>
        <span className={`${VALUE} flex items-center gap-1`}>
          <span
            aria-hidden="true"
            className="inline-block text-accent-text transition-transform duration-700"
            // The API gives the direction the wind comes FROM; the arrow shows where it goes.
            style={{ transform: `rotate(${now.wind_dir + 180}deg)` }}
          >
            ↑
          </span>
          {degrees(now.wind)}
          <span className="text-[10px] font-normal text-faint">km/h</span>
        </span>
      </Tile>
      <Tile label={t("weather.uv")} index={first + 2}>
        {today ? (
          <>
            <span className={VALUE}>{degrees(today.uv)}</span>
            <span className="truncate text-[10px] text-muted">{t(uvKey(today.uv))}</span>
          </>
        ) : (
          <span className={VALUE}>–</span>
        )}
      </Tile>
      <Tile label={t("weather.sunrise")} index={first + 3}>
        <span className={VALUE}>🌅 {today?.sunrise ? clock(today.sunrise) : "–"}</span>
      </Tile>
      <Tile label={t("weather.sunset")} index={first + 4}>
        <span className={VALUE}>🌇 {today?.sunset ? clock(today.sunset) : "–"}</span>
      </Tile>
      <Tile label={t("weather.rainToday")} index={first + 5}>
        <span className={VALUE}>{today ? `${today.rain}%` : "–"}</span>
      </Tile>
    </div>
  );
}
