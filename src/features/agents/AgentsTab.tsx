import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { api, errText, type HarnessView } from "../../lib/api";
import { installedCount } from "./agents";
import { useRefreshEvent } from "../../lib/useRefreshEvent";
import { t } from "../../i18n";
import AgentRow from "./AgentRow";
import ProviderIcon from "../models/ProviderIcon";
import ErrorBanner from "../../components/ErrorBanner";
import Skeleton from "../../components/Skeleton";
import SearchField from "../../components/SearchField";
import FilterChips from "../../components/FilterChips";
import ViewSwitch from "../../components/ViewSwitch";
import ResultsMeta from "../../components/ResultsMeta";
import DataTable, { type Column } from "../../components/DataTable";
import { useViewPref } from "../../lib/useViewPref";
import { fold, foldIncludes } from "../../lib/fold";
import { releaseDate } from "./agents";

const VIEWS = ["list", "table"] as const;
type Installed = "installed" | "missing";

const COLUMNS: Column<HarnessView>[] = [
  { key: "name", label: t("agents.col.name"), render: (v) => <span className="font-medium text-fg">{v.name}</span>, sort: (v) => v.name },
  { key: "state", label: t("agents.col.state"), render: (v) => (v.installed ? t("agents.installed") : t("agents.notInstalled")), sort: (v) => Number(v.installed) },
  { key: "version", label: t("agents.col.version"), render: (v) => v.release?.tag ?? "—", sort: (v) => v.release?.tag ?? "" },
  { key: "released", label: t("agents.col.released"), render: (v) => (v.release ? releaseDate(v.release.published_at) : "—"), sort: (v) => (v.release ? new Date(v.release.published_at).getTime() || 0 : 0) },
  { key: "tool", label: t("agents.col.tool"), render: (v) => v.install_tool || "—", sort: (v) => v.install_tool },
];

const LINK = "canto-hit min-h-[24px] shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** The coding-agent CLIs: which ones are installed here and what each one shipped last. */
export default function AgentsTab({ onError }: { onError: (m: string) => void }) {
  const [views, setViews] = useState<HarnessView[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [state, setState] = useState<Installed | null>(null);
  const [view, setView] = useViewPref("agents", VIEWS);

  const load = useCallback(async (force: boolean) => {
    setLoading(true);
    try {
      setViews(await api.harnessList(force));
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
  useRefreshEvent("agents", () => void load(false));

  const visible = useMemo(() => {
    const needle = fold(query.trim());
    return (views ?? []).filter(
      (v) => (state === null || v.installed === (state === "installed")) && (!needle || foldIncludes(v.name, needle) || foldIncludes(v.id, needle)),
    );
  }, [views, query, state]);

  if (views === null) {
    return error ? <ErrorBanner message={error} onRetry={() => void load(false)} /> : <Skeleton label={t("agents.loading")} rows={4} />;
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="rounded-xl border border-edge/60 bg-gradient-to-br from-accent/10 via-panel/40 to-panel/40 p-2.5">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="min-w-0 truncate font-medium text-fg">
            {t("agents.header", { installed: installedCount(views), total: views.length })}
          </span>
          <button type="button" onClick={() => void load(true)} disabled={loading} title={t("agents.refreshTitle")} className={`${LINK} text-faint`}>
            {loading ? "..." : t("agents.refresh")}
          </button>
        </div>
        <ul aria-hidden="true" className="mt-2 flex items-center gap-1.5">
          {views.map((view, i) => (
            <li key={view.id} title={view.name} className="canto-pop relative" style={{ "--i": i } as CSSProperties}>
              <ProviderIcon id={view.id} name={view.name} size={30} dim={!view.installed} />
              {view.installed && <span className="canto-ping absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-panel bg-accent text-accent" />}
            </li>
          ))}
        </ul>
        <div
          role="progressbar"
          aria-label={t("agents.header", { installed: installedCount(views), total: views.length })}
          aria-valuemin={0}
          aria-valuemax={views.length}
          aria-valuenow={installedCount(views)}
          className="mt-2.5 h-1 overflow-hidden rounded-full bg-edge/70"
        >
          <div
            className="canto-grow-x h-full rounded-full bg-accent transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${views.length ? (installedCount(views) / views.length) * 100 : 0}%` }}
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {views.length > 0 && (
        <>
          <div className="flex gap-2">
            <SearchField className="flex-1" value={query} onChange={setQuery} label={t("agents.find.label")} placeholder={t("agents.find.placeholder")} />
            <ViewSwitch value={view} options={VIEWS} onChange={setView} />
          </div>
          <FilterChips
            allLabel={t("browse.noFilter")}
            allCount={views.length}
            chips={[
              { key: "installed", label: t("agents.filter.installed"), count: installedCount(views) },
              { key: "missing", label: t("agents.filter.missing"), count: views.length - installedCount(views) },
            ]}
            value={state}
            onChange={setState}
          />
          <ResultsMeta
            shown={visible.length}
            total={views.length}
            filtering={query.trim() !== "" || state !== null}
            onClear={() => {
              setQuery("");
              setState(null);
            }}
          />
        </>
      )}
      {views.length === 0 ? (
        <p className="text-xs text-faint">{t("agents.empty")}</p>
      ) : visible.length === 0 ? (
        <p className="text-xs text-faint">{t("browse.noResults")}</p>
      ) : view === "table" ? (
        <div className="flex-1 overflow-y-auto">
          <DataTable label={t("agents.tab")} columns={COLUMNS} rows={visible} rowKey={(v) => v.id} />
        </div>
      ) : (
        <ul className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {visible.map((view, i) => (
            <AgentRow key={view.id} view={view} index={i} onError={onError} />
          ))}
        </ul>
      )}
      <p className="text-[10px] leading-snug text-faint">
        {t("agents.hint")} · {t("agents.source")}
      </p>
    </div>
  );
}
