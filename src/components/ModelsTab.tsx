import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFlip } from "../lib/useFlip";
import { api, errText, type ModelsView } from "../lib/api";
import { SORTS, availableFilters, withSheet, filterModels, sortModels, type ModelFilter, type ModelSort } from "../lib/models";
import { loadPicked, savePicked, togglePick } from "../lib/modelsCompare";
import { timeAgo } from "../lib/time";
import { LOCALE, t } from "../i18n";
import { BellIcon } from "./Icons";
import ModelItem from "./ModelItem";
import ModelsCompare from "./ModelsCompare";
import ModelsTray from "./ModelsTray";
import Skeleton from "./Skeleton";
import SubTabs from "./SubTabs";

const SITE = "https://artificialanalysis.ai/";
const LINK = "canto-hit min-h-[24px] rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";
const CHIP = "canto-hit min-h-[24px] rounded-full border px-2.5";
type View = "rank" | "compare";

/** LLMs ranked by Artificial Analysis' Intelligence Index, read keyless from its public page; Rust holds the 3 h floor. Each model opens its sheet in place, and up to four go side by side in Comparar. */
export default function ModelsTab() {
  const [view, setView] = useState<ModelsView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<ModelSort>("intelligence");
  const [tab, setTab] = useState<View>("rank");
  const [filters, setFilters] = useState<ModelFilter[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [picked, setPickedState] = useState<string[]>(loadPicked);
  const list = useRef<HTMLOListElement>(null);
  // Re-sorting glides each model to its new rank instead of reshuffling the list in one frame.
  useFlip(list, `${sort}|${filters.join()}|${view?.models.length ?? 0}`);

  const setPicked = useCallback((ids: string[]) => {
    setPickedState(ids);
    savePicked(ids);
  }, []);

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    try {
      const next = await api.modelsGet(force);
      setView({ ...next, models: next.models.map(withSheet) });
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

  // Toggling a sheet or the loading flag re-renders the tab; the ranking and the compare set only change with their inputs.
  const all = view?.models;
  const offered = useMemo(() => (all ? availableFilters(all) : []), [all]);
  const rows = useMemo(() => (all ? sortModels(filterModels(all, filters.filter((f) => offered.includes(f))), sort) : []), [all, filters, offered, sort]);
  const marked = useMemo(() => (all ? picked.filter((id) => all.some((m) => m.id === id)) : []), [all, picked]);
  const max = useMemo(() => Math.max(0, ...(all ?? []).map((m) => m.score)), [all]);

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
    return error ? (
      <p role="alert" className="text-xs text-danger">
        {error}
      </p>
    ) : (
      <Skeleton label={t("models.loading")} rows={4} />
    );
  }

  const nextAt = new Date(view.next_fetch_at).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
  const bell = view.alerts ? t("models.alertOff") : t("models.alertOn");
  const problem = error || view.error;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <span className="truncate font-medium text-muted">{view.total > 0 ? t("models.header", { n: view.total }) : t("models.headerEmpty")}
          {view.index && ` · v${view.index}`}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {view.fetched_at > 0 && <span>{t("models.updatedAgo", { ago: timeAgo(view.fetched_at) })}</span>}
          <button type="button" onClick={() => void load(true)} disabled={loading} title={t("models.nextFetchTitle")} className={LINK}>
            {loading ? "..." : t("models.refresh")}
          </button>
        </span>
      </div>
      <SubTabs
        label={t("models.viewLabel")}
        tabs={[
          { key: "rank", label: t("models.view.rank") },
          { key: "compare", label: marked.length ? `${t("models.view.compare")} · ${marked.length}` : t("models.view.compare") },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "rank" && (
        <div className="flex items-start justify-between gap-2 text-[11px]">
          <div role="group" aria-label={t("uima.sortBy")} className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="text-faint">{t("uima.sortBy")}</span>
            {SORTS.map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={sort === k}
                onClick={() => setSort(k)}
                className={`${CHIP} capitalize ${sort === k ? "border-accent bg-accent font-semibold text-on-accent" : "border-edge text-muted hover:bg-hover hover:text-fg"}`}
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
      )}
      {tab === "rank" && offered.length > 0 && (
        <div role="group" aria-label={t("models.filterLabel")} className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-faint">{t("models.filterLabel")}</span>
          {offered.map((f) => {
            const on = filters.includes(f);
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFilters(on ? filters.filter((x) => x !== f) : [...filters, f])}
                className={`${CHIP} ${on ? "border-accent/50 bg-accent/15 text-fg" : "border-edge text-muted hover:bg-hover hover:text-fg"}`}
              >
                {t(`models.filter.${f}`)}
              </button>
            );
          })}
        </div>
      )}
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
      <div className="relative flex-1 overflow-y-auto pr-1">
        {tab === "compare" ? (
          <ModelsCompare rows={view.models} picked={marked} onChange={setPicked} />
        ) : rows.length === 0 ? (
          <p className="text-xs text-faint">{t("models.empty")}</p>
        ) : (
          <ol ref={list} className="flex flex-col gap-2">
            {rows.map((r, i) => (
              <ModelItem
                key={r.id}
                row={r}
                rows={view.models}
                max={max}
                sort={sort}
                index={i}
                open={open === r.id}
                picked={marked.includes(r.id)}
                onToggle={() => setOpen(open === r.id ? null : r.id)}
                onPick={() => setPicked(togglePick(marked, r.id))}
              />
            ))}
          </ol>
        )}
        {tab === "rank" && <p className="mt-3 text-[10px] leading-snug text-faint">{t("models.alertsHint")}</p>}
        {tab === "rank" && marked.length > 0 && (
          <ModelsTray ids={marked} onGo={() => setTab("compare")} />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 text-[10px] text-faint">
        <span>
          {t("models.source")}{" "}
          <button type="button" onClick={() => void api.openLink(SITE).catch((e) => setError(errText(e)))} className={LINK}>
            artificialanalysis.ai
          </button>
        </span>
      </div>
    </div>
  );
}
