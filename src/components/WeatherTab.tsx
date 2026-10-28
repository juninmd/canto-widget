import { useCallback, useEffect, useState } from "react";
import { api, errText, type WeatherPlace, type WeatherView } from "../lib/api";
import { dayHours, fetchedClock, weekday } from "../lib/weather";
import { useLatestRequest } from "../lib/useLatestRequest";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";
import WeatherCity from "./WeatherCity";
import WeatherDays from "./WeatherDays";
import WeatherDetails from "./WeatherDetails";
import WeatherHero from "./WeatherHero";
import WeatherHours from "./WeatherHours";
import WeatherAstro from "./WeatherAstro";
import WeatherNowcast from "./WeatherNowcast";

/** The weather of one city: the sky now, the next two hours, the details, the hours of the picked day, the days, sun and moon. */
export default function WeatherTab() {
  const [view, setView] = useState<WeatherView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [changing, setChanging] = useState(false);
  const [day, setDay] = useState(0);
  const { bump, isLatest } = useLatestRequest();

  // The refresh event, the mount read and the refresh button can overlap: only the newest reply lands.
  const load = useCallback(
    async (force: boolean) => {
      const id = bump();
      setLoading(true);
      try {
        const next = await api.weatherGet(force);
        if (!isLatest(id)) return;
        setView(next);
        setError("");
      } catch (e) {
        if (isLatest(id)) setError(errText(e));
      } finally {
        if (isLatest(id)) setLoading(false);
      }
    },
    [bump, isLatest],
  );

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
      {error && <ErrorBanner message={error} busy={loading} onRetry={() => void load(true)} />}
      {view.error && (
        <p role="alert" className="text-xs text-danger">
          {view.error}
        </p>
      )}
      {forecast ? (
        <>
          <WeatherHero place={place} forecast={forecast} loading={loading} onRefresh={() => void load(true)} onChange={() => setChanging(true)} />
          {(forecast.next_rain?.length ?? 0) > 0 && <WeatherNowcast quarters={forecast.next_rain!} index={1} />}
          <WeatherDetails now={forecast.now} today={forecast.days[0]} air={forecast.air ?? null} first={2} />
          <WeatherHours
            key={day}
            hours={dayHours(forecast.hours, forecast.days, day)}
            days={forecast.days}
            title={day === 0 ? t("weather.hours") : t("weather.hoursOf", { day: weekday(forecast.days[day]?.date ?? "") })}
            isToday={day === 0}
            index={10}
          />
          {forecast.days.length > 0 && <WeatherDays days={forecast.days} selected={day} onPick={setDay} index={11} />}
          <WeatherAstro today={forecast.days[0]} nowAt={forecast.hours[0]?.at ?? ""} lat={place.lat} index={12} />
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
