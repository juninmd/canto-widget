import { useCallback, useEffect, useState } from "react";
import { api, errText, type StatusResult } from "../lib/api";
import { timeAgo } from "../lib/time";
import { isTroubled, sortByLastIncident } from "../lib/status";
import { t } from "../i18n";
import Skeleton from "./Skeleton";
import StatusCard from "./StatusCard";

/** Incident history from services the team depends on: read-only, no account needed. */
export default function StatusTab() {
  const [results, setResults] = useState<StatusResult[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [watched, setWatched] = useState<string[]>([]);

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
  }, [load]);

  async function toggleWatch(id: string) {
    const next = watched.includes(id) ? watched.filter((w) => w !== id) : [...watched, id];
    try {
      setWatched((await api.statusAlertsSet(next)) ?? next);
    } catch (e) {
      setError(errText(e));
    }
  }

  const now = Date.now();
  const bad = results?.filter((r) => isTroubled(r, now)).length ?? 0;
  const ok = results ? results.length - bad : 0;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <span className={bad > 0 ? "font-semibold text-danger" : ""}>
          {results ? t("status.summary", { bad, ok }) : t("status.header")}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {fetchedAt > 0 && <span title={t("status.cacheTitle")}>{t("status.updatedAgo", { ago: timeAgo(fetchedAt) })}</span>}
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={loading}
            className="min-h-6 underline decoration-dotted hover:text-muted"
          >
            {loading ? "..." : t("status.refresh")}
          </button>
        </span>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <div className="flex-1 overflow-y-auto pr-1">
        {results === null ? (
          <Skeleton label={t("status.loading")} rows={4} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {results.map((r) => (
                <StatusCard
                  key={r.id}
                  result={r}
                  open={open === r.id}
                  watched={watched.includes(r.id)}
                  onToggle={() => setOpen(open === r.id ? null : r.id)}
                  onWatch={() => void toggleWatch(r.id)}
                />
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-snug text-faint">{t("status.alertsHint")}</p>
          </>
        )}
      </div>
    </div>
  );
}
