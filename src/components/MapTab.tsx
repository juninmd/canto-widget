import { useCallback, useEffect, useState } from "react";
import { api, errText, type TrafficSpot, type TrafficStatus, type TrafficView } from "../lib/api";
import { fetchedClock } from "../lib/weather";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { useWindowVisible } from "../lib/useWindowVisible";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import MapIncidents from "./MapIncidents";
import MapKey from "./MapKey";
import MapLeave from "./MapLeave";
import MapPlacePicker from "./MapPlacePicker";
import MapPulse from "./MapPulse";
import MapTrips from "./MapTrips";
import MapView from "./MapView";
import Skeleton from "./Skeleton";

/** Rust serves the same reading for 5 min; asking more often only re-reads its cache. */
const POLL_MS = 5 * 60_000;
const LINK = "canto-hit min-h-[28px] rounded-md px-2 text-[11px] text-faint hover:bg-hover hover:text-fg active:bg-active";

/** Local traffic: the map with live flow, how slow the area is, the saved trips with the best time to leave, and incidents nearby. */
export default function MapTab() {
  const [view, setView] = useState<TrafficView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [changing, setChanging] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const visible = useWindowVisible();

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    try {
      setView(await api.trafficGet(force));
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
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => void load(false), POLL_MS);
    return () => clearInterval(id);
  }, [visible, load]);
  useRefreshEvent("map", () => void load(false));

  /** Settings changed in Rust: the old reading belongs to the old place or trips, so read again. */
  const changed = (_: TrafficStatus) => {
    setChanging(false);
    void load(false);
  };

  if (view === null) {
    return error ? <ErrorBanner message={error} onRetry={() => void load(false)} /> : <Skeleton label={t("map.loading")} rows={4} />;
  }
  const { status, reading } = view;
  if (status.origin === null || changing) {
    const suggested = view.suggested;
    return (
      <div className="flex h-full flex-col gap-3 overflow-y-auto pr-0.5">
        <header className="wx-rise flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-fg">{t("map.origin.title")}</h2>
            {status.origin && (
              <button type="button" onClick={() => setChanging(false)} className="canto-hit min-h-[28px] rounded-full px-2.5 text-xs text-muted hover:bg-hover hover:text-fg">
                ← {t("map.back")}
              </button>
            )}
          </div>
          <p className="text-[11px] leading-snug text-faint">{t("map.origin.hint")}</p>
        </header>
        <MapPlacePicker
          label={t("map.origin.label")}
          shortcut={suggested ? { spot: suggested, label: t("map.origin.use", { city: suggested.name }) } : null}
          onPick={(spot: TrafficSpot) => void api.trafficSetOrigin(spot).then(changed, (e) => setError(errText(e)))}
        />
        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  const live = status.has_key && reading !== null;
  const trip = status.trips.find((x) => x.id === selected) ?? status.trips[0] ?? null;
  const route = (trip && reading?.routes.find((r) => r.trip === trip.id)) || null;
  const incidents = reading?.incidents ?? [];
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-0.5">
      <MapView
        origin={status.origin}
        live={live}
        route={route && !route.error ? route : null}
        incidents={incidents}
        focused={focused}
        onFocus={setFocused}
        stamp={view.fetched_at}
        updated={t("map.live", { time: fetchedClock(view.fetched_at || Date.now()) })}
      />
      {view.error && <ErrorBanner message={view.error} busy={loading} onRetry={() => void load(true)} />}
      {!status.has_key && <MapKey onSaved={changed} />}
      {live && <MapPulse slowdown={reading.slowdown} history={view.history} now={view.fetched_at} />}
      {status.has_key && (
        <MapTrips status={status} routes={reading?.routes ?? []} selected={trip?.id ?? null} onSelect={setSelected} onChanged={changed} live={live} />
      )}
      {live && trip && <MapLeave trip={trip} free={route?.free_minutes ?? 0} stamp={view.fetched_at} />}
      {live && <MapIncidents incidents={incidents} focused={focused} onFocus={setFocused} />}
      <footer className="mt-auto flex flex-wrap items-center justify-center gap-x-1 pb-1 text-center text-[10px] text-faint">
        <span>{status.has_key ? t("map.source.tomtom") : t("map.source.osm")}</span>
        <button type="button" onClick={() => setChanging(true)} className={LINK}>
          {t("map.origin.change")}
        </button>
        {status.has_key && (
          <>
            <button type="button" disabled={loading} onClick={() => void load(true)} className={LINK}>
              {loading ? "..." : t("map.refresh")}
            </button>
            <button type="button" onClick={() => void api.trafficSetKey("").then(changed, (e) => setError(errText(e)))} className={LINK}>
              {t("map.key.forget")}
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
