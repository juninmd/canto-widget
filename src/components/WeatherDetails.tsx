import type { CSSProperties, ReactNode } from "react";
import type { WeatherNow, WeatherDay } from "../lib/api";
import { airLevel, degrees, uvKey } from "../lib/weather";
import { LOCALE, t } from "../i18n";

function Tile({ label, index, children }: { label: string; index: number; children: ReactNode }) {
  return (
    <div className="wx-glass wx-rise flex min-w-0 flex-col gap-0.5 p-2" style={{ "--i": index } as CSSProperties}>
      <span className="truncate text-[10px] uppercase tracking-wide text-faint" title={label}>
        {label}
      </span>
      {children}
    </div>
  );
}

const VALUE = "flex items-baseline gap-0.5 text-sm font-semibold tabular-nums text-fg";
const UNIT = "text-[10px] font-normal text-faint";
const NOTE = "truncate text-[10px] text-muted";
/** From this dew point on the air feels sticky. */
const MUGGY = 18;
/** Under this many km the view is noticeably shorter. */
const LOW_VIS = 5;

function Meter({ percent, fill }: { percent: number; fill: string }) {
  return (
    <span className="h-1 overflow-hidden rounded-full bg-edge" aria-hidden="true">
      <span className="block h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: fill }} />
    </span>
  );
}

const missing = <span className={VALUE}>–</span>;

/** The eight readings behind the headline: feels like, humidity, wind with gusts, pressure, visibility, dew point, UV, air. */
export default function WeatherDetails({ now, today, air, first }: { now: WeatherNow; today: WeatherDay | undefined; air: number | null; first: number }) {
  const feelsDelta = Math.round(now.feels) - Math.round(now.temp);
  return (
    <div data-weather-details className="grid shrink-0 grid-cols-4 gap-1.5">
      <Tile label={t("weather.feelsLabel")} index={first}>
        <span className={VALUE}>{degrees(now.feels)}°</span>
        <span className={NOTE}>{t(feelsDelta > 0 ? "weather.feels.warmer" : feelsDelta < 0 ? "weather.feels.colder" : "weather.feels.same")}</span>
      </Tile>
      <Tile label={t("weather.humidity")} index={first + 1}>
        <span className={VALUE}>
          {now.humidity}
          <span className={UNIT}>%</span>
        </span>
        <Meter percent={now.humidity} fill="var(--color-sky-400, #38bdf8)" />
      </Tile>
      <Tile label={t("weather.wind")} index={first + 2}>
        <span className={VALUE}>
          <span
            aria-hidden="true"
            className="inline-block text-accent-text transition-transform duration-700"
            // The API gives the direction the wind comes FROM; the arrow shows where it goes.
            style={{ transform: `rotate(${now.wind_dir + 180}deg)` }}
          >
            ↑
          </span>
          {degrees(now.wind)}
          <span className={UNIT}>km/h</span>
        </span>
        {now.gusts != null && <span className={NOTE}>{t("weather.gusts", { n: degrees(now.gusts) })}</span>}
      </Tile>
      <Tile label={t("weather.pressure")} index={first + 3}>
        {now.pressure != null ? (
          <span className={VALUE}>
            {Math.round(now.pressure)}
            <span className={UNIT}>hPa</span>
          </span>
        ) : (
          missing
        )}
      </Tile>
      <Tile label={t("weather.visibility")} index={first + 4}>
        {now.visibility != null ? (
          <>
            <span className={VALUE}>
              {now.visibility.toLocaleString(LOCALE, { maximumFractionDigits: now.visibility < 10 ? 1 : 0 })}
              <span className={UNIT}>km</span>
            </span>
            <span className={NOTE}>{t(now.visibility < LOW_VIS ? "weather.visibility.low" : "weather.visibility.good")}</span>
          </>
        ) : (
          missing
        )}
      </Tile>
      <Tile label={t("weather.dewPoint")} index={first + 5}>
        {now.dew_point != null ? (
          <>
            <span className={VALUE}>{degrees(now.dew_point)}°</span>
            <span className={NOTE}>{t(now.dew_point >= MUGGY ? "weather.dew.muggy" : "weather.dew.comfy")}</span>
          </>
        ) : (
          missing
        )}
      </Tile>
      <Tile label={t("weather.uv")} index={first + 6}>
        {today ? (
          <>
            <span className={VALUE}>{degrees(today.uv)}</span>
            <span className={NOTE}>{t(uvKey(today.uv))}</span>
          </>
        ) : (
          missing
        )}
      </Tile>
      <Tile label={t("weather.air")} index={first + 7}>
        {air != null ? (
          <>
            <span className={VALUE}>
              <span aria-hidden="true" className="mr-0.5 text-[10px]" style={{ color: airLevel(air).color }}>
                ●
              </span>
              {air}
            </span>
            <span className={NOTE}>{t(airLevel(air).key)}</span>
          </>
        ) : (
          missing
        )}
      </Tile>
    </div>
  );
}
