import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { freshness, isFiltered, visibleSections, type Forge } from "../lib/forge";
import type { ForgeListsState } from "../lib/useForgeLists";
import { useMentions } from "../lib/useMentions";
import type { CiMap } from "../lib/forgeChecks";
import { timeAgo } from "../lib/time";
import { clockLabel } from "../lib/clockLabel";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import ForgeDisconnect from "./ForgeDisconnect";
import ForgeFilterBar from "./ForgeFilterBar";
import ForgeSection from "./ForgeSection";
import ForgeSummary from "./ForgeSummary";
import MentionsList from "./MentionsList";
import Skeleton from "./Skeleton";
import Spinner from "./Spinner";
import SubTabs from "./SubTabs";

type Props = { forge: Forge; login: string; host?: string; lists: ForgeListsState; ci?: CiMap; onDisconnect: () => void };

const BTN = "canto-hit inline-flex min-h-[24px] items-center gap-1 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active disabled:opacity-60";

type Sub = "lists" | "mentions";

/** One connected forge: header, then its issue and PR/MR lists or, in the other subtab, who mentioned the user. */
export default function ForgeBoard({ forge, login, host, lists: gh, ci, onDisconnect }: Props) {
  const { lists } = gh;
  const fresh = lists ? freshness(lists) : null;
  const [sub, setSub] = useState<Sub>("lists");
  const mentions = useMentions(forge);
  const { load: loadMentions, loaded } = mentions;
  const onMentions = sub === "mentions";
  // Fetched on the first visit only, so the subtab spends no API calls for someone who never opens it.
  useEffect(() => {
    if (onMentions && !loaded) void loadMentions();
  }, [onMentions, loaded, loadMentions]);
  // The badge already counts what the watcher saw, so the subtab can show it before it is ever opened.
  const [known, setKnown] = useState(0);
  useEffect(() => {
    api.mentionsUnread().then((n) => typeof n === "number" && setKnown(n), () => {});
  }, []);
  const unread = mentions.reply?.unread ?? known;
  const busy = onMentions ? mentions.loading : gh.loading;
  const refresh = () => void (onMentions ? loadMentions(true) : gh.load(gh.filter, true, true));
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-faint">
        <span className="min-w-0 truncate">
          @{login}
          {host && ` · ${host}`}
        </span>
        <span className="flex flex-wrap items-center gap-x-3">
          {!onMentions && gh.error && lists && <span className="rounded-full bg-edge px-2 text-muted">{t("common.cached")}</span>}
          {!onMentions && fresh?.fetchedAt && <span title={t("forge.cacheTitle")}>{t("forge.updatedAgo", { ago: timeAgo(fresh.fetchedAt) })}</span>}
          <button type="button" aria-busy={busy} onClick={refresh} disabled={busy} className={BTN}>
            {busy && <Spinner />}
            {t("forge.refresh")}
          </button>
          <ForgeDisconnect onConfirm={onDisconnect} className={BTN} />
        </span>
      </div>
      <SubTabs
        label={t("forge.sub.label")}
        value={sub}
        onChange={setSub}
        tabs={[
          { key: "lists", label: t("forge.sub.lists", { pr: forge === "gitlab" ? "MRs" : "PRs" }) },
          { key: "mentions", label: unread > 0 ? t("forge.sub.mentionsCount", { n: unread }) : t("forge.sub.mentions") },
        ]}
      />
      {onMentions ? (
        <MentionsList forge={forge} mentions={mentions} />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
