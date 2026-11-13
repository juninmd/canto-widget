import { useState } from "react";
import type { Forge } from "./forge";
import { filterRepos, groupRepos, stars, type RepoView } from "./repos";
import type { ReposState } from "./useRepos";
import { clockLabel } from "../../lib/clockLabel";
import { t } from "../../i18n";
import ErrorBanner from "../../components/ErrorBanner";
import RepoHeatmap from "./RepoHeatmap";
import RepoItem from "./RepoItem";
import RepoViewSwitch from "./RepoViewSwitch";
import Skeleton from "../../components/Skeleton";

const VIEW_KEY = "canto.forge.repos.view";
const STATS_KEY = "canto.forge.repos.stats";

function saved<T>(key: string, read: (v: string | null) => T): T {
  try {
    return read(localStorage.getItem(key));
  } catch {
    return read(null);
  }
}

function keep(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // A blocked storage only forgets the choice.
  }
}

export const savedView = (): RepoView => saved(VIEW_KEY, (v) => (v === "list" || v === "grid" ? v : "cards"));
/** The statistics (and their API call) stay off until the user asks for them in this subtab. */
export const savedStats = (): boolean => saved(STATS_KEY, (v) => v === "1");

const LAYOUT: Record<RepoView, string> = {
  list: "space-y-1",
  cards: "grid gap-2 sm:grid-cols-2",
  grid: "grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2",
};

type Props = { forge: Forge; repos: ReposState; stats: boolean; onStats: (on: boolean) => void };

/** The repositories the user reaches, by organization or group and the root; list, cards or grid. */
export default function ReposList({ forge, repos, stats, onStats }: Props) {
  const { list, calendar, error, listLoading, calendarLoading, calendarError } = repos;
  const [view, setView] = useState<RepoView>(savedView);
  const [text, setText] = useState("");
  const [closed, setClosed] = useState<string[]>([]);
  const shown = list ? filterRepos(list.repos, text) : [];
  const groups = groupRepos(shown);

  const chooseView = (v: RepoView) => {
    setView(v);
    keep(VIEW_KEY, v);
  };
  const toggle = (key: string) => setClosed((c) => (c.includes(key) ? c.filter((k) => k !== key) : [...c, key]));
  function chooseStats() {
    keep(STATS_KEY, stats ? "0" : "1");
    onStats(!stats);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          type="search"
          value={text}
          aria-label={t("forge.repos.filter")}
          placeholder={t("forge.repos.filterPlaceholder")}
          onChange={(e) => setText(e.target.value)}
          className="canto-field min-w-0 flex-1 px-2 py-1 text-xs"
        />
        <button
          type="button"
          aria-pressed={stats}
          onClick={chooseStats}
          title={t("forge.repos.statsTitle")}
          className={`canto-hit min-h-[24px] rounded-full border px-2 text-[11px] transition-colors ${stats ? "border-accent-text text-accent-text" : "border-edge text-muted hover:bg-hover hover:text-fg"}`}
        >
          {t("forge.repos.stats")}
        </button>
        <RepoViewSwitch value={view} onChange={chooseView} />
      </div>
      {list?.limited_until && (
        <p role="status" className="text-[11px] text-muted">
          {t("forge.rateLimited", { time: clockLabel(list.limited_until) })}
        </p>
      )}
      {error && <ErrorBanner message={error} onRetry={() => void repos.load(true)} busy={listLoading} />}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {stats && (
          <section aria-label={t("forge.repos.statsLabel")} className="space-y-2 rounded-xl border border-edge bg-ink/60 p-2.5">
            {list && (
              <p className="text-[11px] text-muted">
                {t("forge.repos.totals", { repos: list.repos.length, groups: groupRepos(list.repos).filter((g) => g.key !== "").length, stars: stars(list.repos) })}
              </p>
            )}
            {calendarError && <ErrorBanner message={calendarError} onRetry={() => void repos.loadCalendar(true)} busy={calendarLoading} />}
            {!calendar && calendarLoading && <Skeleton label={t("forge.repos.heatmapLoading")} rows={2} />}
            {calendar && (calendar.days.length > 0 ? <RepoHeatmap calendar={calendar} /> : <p className="text-[11px] text-faint">{t("forge.repos.heatmapEmpty")}</p>)}
          </section>
        )}
        {!list && listLoading && <Skeleton label={t("forge.repos.loading")} rows={4} />}
        {list && groups.length === 0 && (
          <p className="rounded-xl border border-dashed border-edge px-3 py-3 text-center text-[11px] text-faint">
            {list.repos.length > 0 ? t("forge.repos.emptyFiltered") : t(forge === "gitlab" ? "forge.repos.emptyGitlab" : "forge.repos.empty")}
          </p>
        )}
        {groups.map((g) => {
          const open = !closed.includes(g.key);
          const name = g.key || t("forge.repos.root");
          return (
            <section key={g.key} aria-label={name}>
              <h3 className="m-0 mb-1">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggle(g.key)}
                  className="canto-hit flex w-full items-center gap-1.5 rounded-md px-1 text-left text-[11px] font-semibold uppercase tracking-wide text-muted hover:text-fg"
                >
                  <span aria-hidden="true" className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}>
                    ▸
                  </span>
                  <span className="min-w-0 truncate">{name}</span>
                  <span className="rounded-full bg-edge px-1.5 text-[10px] font-normal normal-case text-faint">{g.repos.length}</span>
                </button>
              </h3>
              {open && (
                <ul className={LAYOUT[view]} aria-label={name}>
                  {g.repos.map((r) => (
                    <RepoItem key={r.full_name} repo={r} view={view} />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
        {list?.truncated && <p className="text-center text-[11px] text-faint">{t("forge.repos.truncated")}</p>}
      </div>
    </div>
  );
}
