import { useCallback, useEffect, useState } from "react";
import { api, errText, type WeatherPlace, type WeatherView } from "../lib/api";
import { fetchedClock } from "../lib/weather";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";
import WeatherCity from "./WeatherCity";
import WeatherDays from "./WeatherDays";
import WeatherDetails from "./WeatherDetails";
import WeatherHero from "./WeatherHero";
import WeatherHours from "./WeatherHours";

/** The weather of one city: the sky now, the details, the next hours as a curve and the next days. */
export default function WeatherTab() {
  const [view, setView] = useState<WeatherView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [changing, setChanging] = useState(false);

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
  if (view.place === null || changing) {
    return (
      <WeatherCity
        onSaved={(saved) => {
          setView(saved);
          setChanging(false);
        }}
        onForgotten={setView}
        onBack={view.place ? () => setChanging(false) : undefined}
      />
    );
  }

  const { place, forecast } = view;
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-0.5">
      {view.error && (
        <p role="alert" className="text-xs text-danger">
          {view.error}
        </p>
      )}
      {forecast ? (
        <>
          <WeatherHero place={place} forecast={forecast} loading={loading} onRefresh={() => void load(true)} onChange={() => setChanging(true)} />
          <WeatherDetails now={forecast.now} today={forecast.days[0]} first={1} />
          <WeatherHours hours={forecast.hours} days={forecast.days} index={7} />
          {forecast.days.length > 0 && <WeatherDays days={forecast.days} index={8} />}
        </>
      ) : (
        <FailedCard place={place} loading={loading} onRefresh={() => void load(true)} onChange={() => setChanging(true)} />
      )}
      <p className="mt-auto pb-1 text-center text-[10px] text-faint">
        {t("weather.source")}
        {view.fetched_at > 0 && ` · ${t("weather.updated", { time: fetchedClock(view.fetched_at) })}`}
      </p>
    </div>
  );
}

/** A saved city whose reading failed keeps its name and both ways out: try again, or pick another city. */
function FailedCard({ place, loading, onRefresh, onChange }: { place: WeatherPlace; loading: boolean; onRefresh: () => void; onChange: () => void }) {
  const BTN = "canto-hit min-h-[28px] rounded-md px-2 text-xs hover:bg-hover active:bg-active disabled:opacity-60";
  return (
    <div className="wx-glass flex shrink-0 items-center justify-between gap-2 p-3">
      <span className="min-w-0 truncate text-sm font-semibold text-fg">
        {place.city}
        {place.country && ` · ${place.country}`}
      </span>
      <span className="flex shrink-0 gap-1">
        <button type="button" onClick={onRefresh} disabled={loading} aria-label={t("weather.refresh")} className={BTN}>
          {loading ? "..." : t("weather.refresh")}
        </button>
        <button type="button" onClick={onChange} className={BTN}>
          {t("weather.change")}
        </button>
      </span>
    </div>
  );
}
