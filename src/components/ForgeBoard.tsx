import { freshness, isFiltered, visibleSections, type Forge } from "../lib/forge";
import type { ForgeListsState } from "../lib/useForgeLists";
import { timeAgo } from "../lib/time";
import { LOCALE, t } from "../i18n";
import ForgeFilterBar from "./ForgeFilterBar";
import ForgeSection from "./ForgeSection";
import Skeleton from "./Skeleton";

type Props = { forge: Forge; login: string; host?: string; lists: ForgeListsState; onDisconnect: () => void };

const clock = (ms: number) => new Date(ms).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });

/** Issue and PR/MR lists of one connected forge: header, filter, sections. */
export default function ForgeBoard({ forge, login, host, lists: gh, onDisconnect }: Props) {
  const { lists } = gh;
  const fresh = lists ? freshness(lists) : null;
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <span className="truncate">
          @{login}
          {host && ` · ${host}`}
        </span>
        <span className="flex shrink-0 gap-3">
          {fresh?.fetchedAt && <span title={t("forge.cacheTitle")}>{t("forge.updatedAgo", { ago: timeAgo(fresh.fetchedAt) })}</span>}
          <button
            type="button"
            onClick={() => void gh.load(gh.filter, true, true)}
            disabled={gh.loading}
            className="min-h-6 underline decoration-dotted hover:text-muted"
          >
            {gh.loading ? "..." : t("forge.refresh")}
          </button>
          <button type="button" onClick={onDisconnect} className="min-h-6 underline decoration-dotted hover:text-muted">
            {t("forge.disconnect")}
          </button>
        </span>
      </div>
      <ForgeFilterBar forge={forge} filter={gh.filter} onApply={(f) => void gh.load(f, false)} />
      {fresh?.limitedUntil && (
        <p role="status" className="text-[11px] text-muted">
          {t("forge.rateLimited", { time: clock(fresh.limitedUntil) })}
        </p>
      )}
      {gh.error && (
        <p role="alert" className="text-xs text-danger">
          {gh.error}
        </p>
      )}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {!lists && gh.loading && <Skeleton label={t("forge.loading")} rows={4} />}
        {lists &&
          visibleSections(forge, gh.filter.kind).map(({ key, title }) => (
            <ForgeSection
              key={key}
              title={title}
              section={key}
              forge={forge}
              list={lists[key]}
              login={login}
              filtered={isFiltered(gh.filter)}
              loadingMore={gh.loadingMore === key}
              onMore={() => void gh.more(key)}
            />
          ))}
      </div>
    </div>
  );
}
