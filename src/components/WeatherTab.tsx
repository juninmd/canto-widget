import { useCallback, useEffect, useState } from "react";
import { api, errText, type WeatherView } from "../lib/api";
import { clock, conditionKey, degrees, weekday } from "../lib/weather";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { sparkline } from "../lib/sparkline";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";

const LINK = "canto-hit min-h-[24px] shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** The weather of one city: the reading now, the next hours as a curve and the next days. */
export default function WeatherTab() {
  const [view, setView] = useState<WeatherView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    try {
      setView(await api.weatherGet(force));
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);
  useRefreshEvent("weather", () => void load(false));

  if (view === null) {
    return error ? <ErrorBanner message={error} onRetry={() => void load(false)} /> : <Skeleton label={t("weather.loading")} rows={4} />;
  }
  if (view.place === null) {
    return <WeatherCity onSaved={setView} />;
  }

  const forecast = view.forecast;
  const points = forecast ? sparkline(forecast.hours.map((hour) => hour.temp), 260, 40) : "";
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <span className="min-w-0 truncate font-medium text-muted">
          {view.place.city}
          {view.place.country && ` · ${view.place.country}`}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={() => void load(true)} disabled={loading} title={t("weather.refreshTitle")} className={LINK}>
            {loading ? "..." : t("weather.refresh")}
          </button>
          <ForgetCity onForgotten={setView} />
        </span>
      </div>
      {view.error && (
        <p role="alert" className="text-xs text-danger">
          {view.error}
        </p>
      )}
      {forecast && (
        <>
          <div data-weather-now className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-fg">{degrees(forecast.now.temp)}°C</span>
            <span className="text-xs text-muted">{t(conditionKey(forecast.now.condition))}</span>
            <span className="ml-auto text-[11px] text-faint">{t("weather.feels", { temp: degrees(forecast.now.feels) })}</span>
          </div>
          {forecast.rain_from && <p className="text-[11px] text-accent-text">{t("weather.rainFrom", { time: clock(forecast.rain_from) })}</p>}

          <h3 className="text-[11px] text-faint">{t("weather.hours")}</h3>
          <svg viewBox="0 0 260 40" className="h-10 w-full text-accent" aria-hidden="true">
            <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <div className="flex justify-between text-[10px] tabular-nums text-faint">
            {forecast.hours.map((hour) => (
              <span key={hour.at} title={t("weather.rain", { n: hour.rain })}>
                {clock(hour.at)} {degrees(hour.temp)}°
              </span>
            ))}
          </div>

          <h3 className="text-[11px] text-faint">{t("weather.days")}</h3>
          <ul className="flex flex-col">
            {forecast.days.map((day) => (
              <li key={day.date} data-weather-day={day.date} className="flex items-center gap-2 px-1.5 py-1">
                <span className="w-10 text-[11px] text-muted">{weekday(day.date)}</span>
                <span className="text-[11px] tabular-nums text-fg">
                  {degrees(day.max)}° / {degrees(day.min)}°
                </span>
                <span className="ml-auto text-[10px] text-faint">
                  {t(conditionKey(day.condition))}
                  {day.rain >= 50 && (day.condition === "clear" || day.condition === "cloudy") && ` · ${t("weather.rain", { n: day.rain })}`}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-auto text-[10px] text-faint">{t("weather.source")}</p>
    </div>
  );
}

/** The first screen: the address is resolved in Rust and only the coordinates come back. */
function WeatherCity({ onSaved }: { onSaved: (view: WeatherView) => void }) {
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  async function save() {
    setWorking(true);
    try {
      onSaved(await api.weatherSetCity(city));
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setWorking(false);
    }
  }

  return (
    <form
      className="flex h-full flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <h2 className="text-xs font-semibold text-fg">{t("weather.ask.title")}</h2>
      <p className="text-[11px] leading-snug text-faint">{t("weather.ask.hint")}</p>
      <label className="flex flex-col gap-1 text-[11px] text-muted">
        {t("weather.city.label")}
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t("weather.city.placeholder")}
          className="canto-box rounded-md border border-edge bg-panel px-2 py-1 text-xs text-fg"
        />
      </label>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={working || city.trim() === ""}
        className="canto-hit min-h-[28px] shrink-0 rounded-md bg-accent/15 px-2 text-xs font-semibold text-accent-text hover:bg-accent/25 disabled:opacity-60"
      >
        {working ? t("weather.searching") : t("weather.search")}
      </button>
    </form>
  );
}

function ForgetCity({ onForgotten }: { onForgotten: (view: WeatherView) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      aria-label={t("weather.forget")}
      title={t("weather.forget")}
      disabled={busy}
      onClick={() => {
        setBusy(true);
        void api
          .weatherClear()
          .then(onForgotten)
          .finally(() => setBusy(false));
      }}
      className={LINK}
    >
      {t("weather.change")}
    </button>
  );
}
