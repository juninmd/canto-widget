import { freshness, isFiltered, visibleSections, type Forge } from "../lib/forge";
import type { ForgeListsState } from "../lib/useForgeLists";
import type { CiMap } from "../lib/forgeChecks";
import { timeAgo } from "../lib/time";
import { clockLabel } from "../lib/clockLabel";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import ForgeDisconnect from "./ForgeDisconnect";
import ForgeFilterBar from "./ForgeFilterBar";
import ForgeSection from "./ForgeSection";
import ForgeSummary from "./ForgeSummary";
import Skeleton from "./Skeleton";
import Spinner from "./Spinner";

type Props = { forge: Forge; login: string; host?: string; lists: ForgeListsState; ci?: CiMap; onDisconnect: () => void };

const BTN = "canto-hit inline-flex min-h-[24px] items-center gap-1 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active disabled:opacity-60";

/** Issue and PR/MR lists of one connected forge: header, filter, sections. */
export default function ForgeBoard({ forge, login, host, lists: gh, ci, onDisconnect }: Props) {
  const { lists } = gh;
  const fresh = lists ? freshness(lists) : null;
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-faint">
        <span className="min-w-0 truncate">
          @{login}
          {host && ` · ${host}`}
        </span>
        <span className="flex flex-wrap items-center gap-x-3">
          {gh.error && lists && <span className="rounded-full bg-edge px-2 text-muted">{t("common.cached")}</span>}
          {fresh?.fetchedAt && <span title={t("forge.cacheTitle")}>{t("forge.updatedAgo", { ago: timeAgo(fresh.fetchedAt) })}</span>}
          <button type="button" aria-busy={gh.loading} onClick={() => void gh.load(gh.filter, true, true)} disabled={gh.loading} className={BTN}>
            {gh.loading && <Spinner />}
            {t("forge.refresh")}
          </button>
          <ForgeDisconnect onConfirm={onDisconnect} className={BTN} />
        </span>
      </div>
      {lists && <ForgeSummary forge={forge} lists={lists} ci={ci} />}
      <ForgeFilterBar forge={forge} filter={gh.filter} onApply={(f) => void gh.load(f, false)} />
      {fresh?.limitedUntil && (
        <p role="status" className="text-[11px] text-muted">
          {t("forge.rateLimited", { time: clockLabel(fresh.limitedUntil) })}
        </p>
      )}
      {gh.error && <ErrorBanner message={gh.error} onRetry={() => void gh.load(gh.filter, true, true)} busy={gh.loading} />}
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
              ci={ci}
            />
          ))}
      </div>
    </div>
  );
}
