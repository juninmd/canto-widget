import type { CSSProperties } from "react";
import type { WeatherForecast, WeatherPlace } from "../lib/api";
import { clock, conditionKey, degrees, weatherAlert, type Alert } from "../lib/weather";
import { t } from "../i18n";
import WeatherIcon from "./WeatherIcon";
import WeatherSky from "./WeatherSky";

const CHIP =
  "canto-hit flex min-h-[28px] items-center justify-center rounded-full bg-white/15 px-2.5 text-[11px] font-medium text-white backdrop-blur-sm hover:bg-white/25 active:bg-white/30 disabled:opacity-60";

type Props = {
  place: WeatherPlace;
  forecast: WeatherForecast;
  loading: boolean;
  onRefresh: () => void;
  onChange: () => void;
};

/** The sky of the city: temperature, the condition drawn and animated, today's range and the rain warning. */
export default function WeatherHero({ place, forecast, loading, onRefresh, onChange }: Props) {
  const { now } = forecast;
  const today = forecast.days[0];
  const alert = weatherAlert(forecast);
  return (
    <section data-sky={now.condition} data-night={!now.is_day} className="wx-hero wx-rise shrink-0 rounded-2xl p-4" style={{ "--i": 0 } as CSSProperties}>
      <WeatherSky condition={now.condition} night={!now.is_day} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">
            {place.city}
            {place.country && ` · ${place.country}`}
          </h2>
          {place.admin1 && <p className="truncate text-[11px] text-white/80">{place.admin1}</p>}
        </div>
        <span className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={onRefresh} disabled={loading} aria-label={t("weather.refresh")} title={t("weather.refreshTitle")} className={CHIP}>
            <span aria-hidden="true" className={`inline-block text-sm leading-none ${loading ? "wx-spin" : ""}`}>
              ↻
            </span>
          </button>
          <button type="button" onClick={onChange} className={CHIP}>
            {t("weather.change")}
          </button>
        </span>
      </div>

      <div data-weather-now className="mt-1 flex items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-start leading-none">
            <span className="text-6xl font-extralight tabular-nums tracking-tight">{degrees(now.temp)}</span>
            <span className="mt-1.5 text-xl font-light">°C</span>
          </div>
          <p className="mt-1 text-sm font-medium">{t(conditionKey(now.condition))}</p>
          {today && (
            <p className="text-[11px] tabular-nums text-white/85">
              {t("weather.highLow", { max: degrees(today.max), min: degrees(today.min) })}
            </p>
          )}
          <p className="text-[11px] text-white/85">{t("weather.feels", { temp: degrees(now.feels) })}</p>
        </div>
        <WeatherIcon condition={now.condition} night={!now.is_day} className="ml-auto h-24 w-24 shrink-0 drop-shadow-lg" />
      </div>

      {alert && <AlertPill alert={alert} />}
      {forecast.rain_from && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sky-300/25 px-2.5 py-1 text-[11px] font-medium">
          <span aria-hidden="true">💧</span>
          {t("weather.rainFrom", { time: clock(forecast.rain_from) })}
        </p>
      )}
    </section>
  );
}

const ALERT = {
  danger: "wx-alert-danger bg-rose-400 text-rose-950",
  warn: "bg-amber-300 text-amber-950",
};

function alertText(alert: Alert): string {
  if (alert.key === "weather.alert.stormAt") return t(alert.key, { time: alert.time });
  if (alert.key === "weather.alert.gusts") return t(alert.key, { n: alert.n });
  if (alert.key === "weather.alert.uv") return t(alert.key, { level: t(alert.uv) });
  return t(alert.key);
}

/** The most urgent warning, as a solid pill the eye finds before the numbers. */
function AlertPill({ alert }: { alert: Alert }) {
  return (
    <p
      role="status"
      data-weather-alert={alert.level}
      className={`mr-1.5 mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold [text-shadow:none] ${ALERT[alert.level]}`}
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
        <path d="M12 2 1 21h22L12 2Zm-1 7h2v6h-2V9Zm0 8h2v2h-2v-2Z" />
      </svg>
      {alertText(alert)}
    </p>
  );
}
