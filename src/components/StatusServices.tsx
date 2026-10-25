import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText, type StatusResult } from "../lib/api";
import { timeAgo } from "../lib/time";
import { isTroubled, level, sortByLastIncident } from "../lib/status";
import { bySeverity, countLevels, matchesFilter, type StatusFilter } from "../lib/statusView";
import { t } from "../i18n";
import { RefreshIcon } from "./ForgeIcons";
import Skeleton from "./Skeleton";
import EmptyRetry from "./EmptyRetry";
import { PulseIcon } from "./Icons";
import Spinner from "./Spinner";
import StatusCard from "./StatusCard";
import StatusOverview from "./StatusOverview";
import StatusToolbar from "./StatusToolbar";

/** Incident history from services the team depends on: read-only, no account needed. */
export default function StatusServices({ toolbar }: { toolbar?: HTMLElement | null }) {
  const [results, setResults] = useState<StatusResult[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [watched, setWatchedState] = useState<string[]>([]);
  // Fast consecutive toggles must build on each other, not on the list captured at render.
  const watchedRef = useRef<string[]>([]);
  const setWatched = useCallback((ids: string[]) => {
    watchedRef.current = ids;
    setWatchedState(ids);
  }, []);

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    try {
      setResults(sortByLastIncident(await api.apiStatus(force)));
      setFetchedAt(Date.now());
      setError("");
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
    void api
      .statusAlertsGet()
      .then((ids) => setWatched(ids ?? []))
      .catch(() => {});
  }, [load, setWatched]);

  async function toggleWatch(id: string) {
    const current = watchedRef.current;
    const next = current.includes(id) ? current.filter((w) => w !== id) : [...current, id];
    setWatched(next);
    try {
      const saved = (await api.statusAlertsSet(next)) ?? next;
      if (watchedRef.current === next) setWatched(saved);
    } catch (e) {
      if (watchedRef.current === next) setWatched(current);
      setError(errText(e));
    }
  }

  const now = Date.now();
  const sorted = results ? bySeverity(results, now) : [];
  const counts = results ? countLevels(results, now) : null;
  const bad = results?.filter((r) => isTroubled(r, now)).length ?? 0;
  const shown = sorted.filter((r) => matchesFilter(filter, level(r, now)));

  return (
    <div className="flex h-full flex-col gap-2">
      <StatusToolbar host={toolbar}>
        {fetchedAt > 0 && <span title={t("status.cacheTitle")}>{t("status.updatedAgo", { ago: timeAgo(fetchedAt) })}</span>}
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={loading}
          aria-busy={loading}
          aria-label={t("status.refresh")}
          title={t("status.refresh")}
          className="canto-hit grid h-[28px] min-w-[28px] place-items-center rounded-lg text-muted hover:bg-hover hover:text-fg active:bg-active disabled:opacity-60"
        >
          {loading ? <Spinner /> : <RefreshIcon />}
        </button>
      </StatusToolbar>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {results === null && !error ? (
          <Skeleton label={t("status.loading")} rows={4} />
        ) : results === null || counts === null || results.length === 0 ? (
          // Rust answers an empty list when no status page could be read: "0 operacionais" would read as data.
          <EmptyRetry icon={<PulseIcon />} message={t("uiStatus.none")} busy={loading} onRetry={() => void load(true)} />
        ) : (
          <>
            <StatusOverview counts={counts} bad={bad} ok={results.length - bad} filter={filter} onFilter={setFilter} />
            {shown.length === 0 && <p className="rounded-xl border border-dashed border-edge px-3 py-3 text-center text-[11px] text-faint">{t("uiStatus.filter.empty")}</p>}
            {shown.map((r) => (
              <StatusCard
                key={r.id}
                result={r}
                open={open === r.id}
                watched={watched.includes(r.id)}
                onToggle={() => setOpen(open === r.id ? null : r.id)}
                onWatch={() => void toggleWatch(r.id)}
              />
            ))}
            <p className="mt-1 text-[10px] leading-snug text-faint">{t("status.alertsHint")}</p>
          </>
        )}
      </div>
    </div>
  );
}
