import { useDeferredValue, useMemo, useState } from "react";
import type { Forge } from "./forge";
import { buildRows, filterRepos, flatRows, groupCount, indexRepos, stars, type RepoSort, type RepoView } from "./repos";
import type { ReposState } from "./useRepos";
import { clockLabel } from "../../lib/clockLabel";
import { t } from "../../i18n";
import ErrorBanner from "../../components/ErrorBanner";
import RepoHeatmap from "./RepoHeatmap";
import RepoDetail from "./RepoDetail";
import RepoTree from "./RepoTree";
import { useRepoAvatars } from "./useRepoAvatars";
import RepoViewSwitch from "./RepoViewSwitch";
import { loadPins, repoKey, togglePin } from "./repoPins";
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

/** The old layouts (list, cards, grid) are gone: whatever was saved opens the tree. */
export const savedView = (): RepoView => saved(VIEW_KEY, (v) => (v === "flat" ? "flat" : "tree"));
const SORT_KEY = "canto.forge.repos.sort";
export const savedSort = (): RepoSort => saved(SORT_KEY, (v) => (v === "name" || v === "stars" ? v : "recent"));
/** The statistics (and their API call) stay off until the user asks for them in this subtab. */
export const savedStats = (): boolean => saved(STATS_KEY, (v) => v === "1");

const SORTS: RepoSort[] = ["recent", "name", "stars"];

type Props = { forge: Forge; repos: ReposState; stats: boolean; onStats: (on: boolean) => void };

/**
 * The repositories the user reaches as a windowed tree of groups, subgroups and repositories (or a flat list), found
 * with a local search over everything loaded so far; selecting one opens its details and, on demand, its README.
 */
export default function ReposList({ forge, repos, stats, onStats }: Props) {
  const { repos: all, calendar, error, syncing, partial, limitedUntil, calendarLoading, calendarError } = repos;
  const [view, setView] = useState<RepoView>(savedView);
  const [sort, setSort] = useState<RepoSort>(savedSort);
  const [text, setText] = useState("");
  const [open, setOpen] = useState<Set<string>>(() => new Set([""]));
  const [shut, setShut] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [pins, setPins] = useState(loadPins);
  const [onlyPinned, setOnlyPinned] = useState(false);
  const query = useDeferredValue(text);
  const searching = query.trim() !== "";

  const index = useMemo(() => indexRepos(all), [all]);
  const found = useMemo(() => filterRepos(index, query), [index, query]);
  const shown = useMemo(() => (onlyPinned ? found.filter((r) => pins.has(repoKey(r))) : found), [found, onlyPinned, pins]);
  const rows = useMemo(
    () => (view === "flat" ? flatRows(shown, sort) : buildRows(shown, sort, (key) => (searching ? !shut.has(key) : open.has(key)))),
    [view, shown, sort, searching, shut, open],
  );
  const picked = selected === null ? undefined : all.find((r) => (r.id || r.full_name) === selected);
  const icons = useRepoAvatars(forge, picked?.avatar_url ? [picked.avatar_url] : []);

  const chooseView = (v: RepoView) => {
    setView(v);
    keep(VIEW_KEY, v);
  };
  const chooseSort = (s: RepoSort) => {
    setSort(s);
    keep(SORT_KEY, s);
  };
  // While searching every group is open and a click closes it; otherwise the user's own open set rules.
  const toggle = (key: string) => {
    const flip = (s: Set<string>) => {
      const next = new Set(s);
      if (!next.delete(key)) next.add(key);
      return next;
    };
    if (searching) setShut(flip);
    else setOpen(flip);
  };
  function chooseStats() {
    keep(STATS_KEY, stats ? "0" : "1");
    onStats(!stats);
  }

  const summary = searching || onlyPinned
    ? t("forge.repos.summaryFiltered", { shown: shown.length, repos: all.length })
    : t("forge.repos.summary", { repos: all.length, groups: groupCount(all) });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="space-y-1.5">
        <input
          type="search"
          value={text}
          aria-label={t("forge.repos.filter")}
          placeholder={t("forge.repos.filterPlaceholder")}
          onChange={(e) => {
            setText(e.target.value);
            setShut(new Set());
          }}
          className="canto-field w-full px-2 py-1 text-xs"
        />
        <div className="flex items-center gap-1.5">
          <select
            value={sort}
            aria-label={t("forge.repos.sort")}
            onChange={(e) => chooseSort(e.target.value as RepoSort)}
            className="canto-field min-w-0 flex-1 px-1.5 py-1 text-[11px]"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t(`forge.repos.sort.${s}`)}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-pressed={stats}
            onClick={chooseStats}
            title={t("forge.repos.statsTitle")}
            className={`canto-hit min-h-[24px] rounded-full border px-2 text-[11px] transition-colors ${stats ? "border-accent-text text-accent-text" : "border-edge text-muted hover:bg-hover hover:text-fg"}`}
          >
            {t("forge.repos.stats")}
          </button>
          <button
            type="button"
            aria-pressed={onlyPinned}
            onClick={() => setOnlyPinned(!onlyPinned)}
            className={`canto-hit min-h-[24px] rounded-full border px-2 text-[11px] transition-colors ${onlyPinned ? "border-accent-text text-accent-text" : "border-edge text-muted hover:bg-hover hover:text-fg"}`}
          >
            {t("forge.repos.pinnedFilter", { n: pins.size })}
          </button>
          <RepoViewSwitch value={view} onChange={chooseView} />
        </div>
      </div>
      {all.length > 0 && (
        <p role="status" className="m-0 flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
          <span>{summary}</span>
          {syncing && <span className="text-faint">{t("forge.repos.syncing", { n: all.length })}</span>}
          {partial && !limitedUntil && <span className="text-faint">{t("forge.repos.partial", { n: all.length })}</span>}
          {limitedUntil && <span>{t("forge.rateLimited", { time: clockLabel(limitedUntil) })}</span>}
        </p>
      )}
      {error && <ErrorBanner message={error} onRetry={() => void repos.load(true)} busy={syncing} />}
      {stats && (
        <section aria-label={t("forge.repos.statsLabel")} className="max-h-[40%] shrink-0 space-y-2 overflow-y-auto rounded-xl border border-edge bg-ink/60 p-2.5">
          {all.length > 0 && <p className="m-0 text-[11px] text-muted">{t("forge.repos.totals", { repos: all.length, groups: groupCount(all), stars: stars(all) })}</p>}
          {calendarError && <ErrorBanner message={calendarError} onRetry={() => void repos.loadCalendar(true)} busy={calendarLoading} />}
          {!calendar && calendarLoading && <Skeleton label={t("forge.repos.heatmapLoading")} rows={2} />}
          {calendar && (calendar.days.length > 0 ? <RepoHeatmap calendar={calendar} /> : <p className="text-[11px] text-faint">{t("forge.repos.heatmapEmpty")}</p>)}
        </section>
      )}
      {all.length === 0 && syncing && <Skeleton label={t("forge.repos.loading")} rows={4} />}
      {all.length === 0 && repos.loaded && !syncing && !error && (
        <p className="rounded-xl border border-dashed border-edge px-3 py-3 text-center text-[11px] text-faint">
          {t(forge === "gitlab" ? "forge.repos.emptyGitlab" : "forge.repos.empty")}
        </p>
      )}
      {all.length > 0 && shown.length === 0 && (
        <p className="rounded-xl border border-dashed border-edge px-3 py-3 text-center text-[11px] text-faint">{t("forge.repos.emptyFiltered")}</p>
      )}
      {shown.length > 0 && (
        <RepoTree
          forge={forge}
          rows={rows}
          flat={view === "flat"}
          selected={selected}
          label={t("forge.repos.tree")}
          onToggle={toggle}
          onSelect={(r) => setSelected(r.id || r.full_name)}
        />
      )}
      {picked && <RepoDetail forge={forge} repo={picked} icon={icons(picked.avatar_url)} pinned={pins.has(repoKey(picked))} onPin={() => setPins(togglePin(pins, repoKey(picked)))} onClose={() => setSelected(null)} />}
    </div>
  );
}
