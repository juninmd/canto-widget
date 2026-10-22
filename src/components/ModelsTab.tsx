import { useCallback, useEffect, useRef, useState } from "react";
import { useFlip } from "../lib/useFlip";
import { api, errText, type ModelsView } from "../lib/api";
import { SORTS, sortModels, type ModelSort } from "../lib/models";
import { timeAgo } from "../lib/time";
import { LOCALE, t } from "../i18n";
import { BellIcon } from "./Icons";
import ModelItem from "./ModelItem";
import Skeleton from "./Skeleton";

const SITE = "https://artificialanalysis.ai/";
const LINK = "canto-hit min-h-[24px] rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** LLMs ranked by Artificial Analysis' Intelligence Index, read keyless from its public page; Rust holds the 3 h floor. */
export default function ModelsTab() {
  const [view, setView] = useState<ModelsView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<ModelSort>("intelligence");
  const list = useRef<HTMLOListElement>(null);
  // Re-sorting glides each model to its new rank instead of reshuffling the list in one frame.
  useFlip(list, `${sort}|${view?.models.length ?? 0}`);

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    try {
      setView(await api.modelsGet(force));
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

  async function toggleAlerts() {
    if (!view) return;
    const next = !view.alerts;
    setView({ ...view, alerts: next });
    try {
      const saved = (await api.modelsAlertsSet(next)) ?? next;
      setView((v) => (v ? { ...v, alerts: saved } : v));
    } catch (e) {
      setView((v) => (v ? { ...v, alerts: !next } : v));
      setError(errText(e));
    }
  }

  if (view === null) {
    return error ? <p role="alert" className="text-xs text-danger">{error}</p> : <Skeleton label={t("models.loading")} rows={4} />;
  }

  const rows = sortModels(view.models, sort);
  const max = Math.max(0, ...view.models.map((m) => m.score));
  const nextAt = new Date(view.next_fetch_at).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
  const bell = view.alerts ? t("models.alertOff") : t("models.alertOn");
  const problem = error || view.error;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <span className="truncate font-medium text-muted">
          {view.total > 0 ? t("models.header", { n: view.total }) : t("models.headerEmpty")}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {view.fetched_at > 0 && <span>{t("models.updatedAgo", { ago: timeAgo(view.fetched_at) })}</span>}
          <button type="button" onClick={() => void load(true)} disabled={loading} title={t("models.nextFetchTitle")} className={LINK}>
            {loading ? "..." : t("models.refresh")}
          </button>
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <div role="group" aria-label={t("uima.sortBy")} className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="text-faint">{t("uima.sortBy")}</span>
          {SORTS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={sort === k}
              onClick={() => setSort(k)}
              className={`canto-hit min-h-[24px] rounded-full border px-2.5 capitalize ${sort === k ? "border-accent bg-accent font-semibold text-on-accent" : "border-edge text-muted hover:bg-hover hover:text-fg"}`}
            >
              {t(`models.sort.${k}`)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void toggleAlerts()}
          aria-pressed={view.alerts}
          aria-label={bell}
          title={bell}
          className={`grid size-6 place-items-center rounded-md hover:bg-edge ${view.alerts ? "text-accent-text" : "text-faint hover:text-fg"}`}
        >
          <BellIcon on={view.alerts} />
        </button>
      </div>
      {view.throttled && (
        <p role="status" className="text-[11px] text-faint">
          {t("models.throttled", { time: nextAt })}
        </p>
      )}
      {problem && (
        <p role="alert" className="text-xs text-danger">
          {problem}
        </p>
      )}
      <div className="flex-1 overflow-y-auto pr-1">
        {rows.length === 0 ? (
          <p className="text-xs text-faint">{t("models.empty")}</p>
        ) : (
          <ol ref={list} className="flex flex-col gap-2">
            {rows.map((r, i) => (
              <ModelItem key={r.id} row={r} max={max} sort={sort} index={i} />
            ))}
          </ol>
        )}
        <p className="mt-3 text-[10px] leading-snug text-faint">{t("models.alertsHint")}</p>
      </div>
      <div className="flex items-center justify-between gap-2 text-[10px] text-faint">
        <span>
          {t("models.source")}{" "}
          <button type="button" onClick={() => void api.openLink(SITE).catch(() => {})} className={LINK}>
            artificialanalysis.ai
          </button>
        </span>
      </div>
    </div>
  );
}
