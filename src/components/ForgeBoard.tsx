import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { freshness, isFiltered, visibleSections, type Forge } from "../lib/forge";
import type { ForgeListsState } from "../lib/useForgeLists";
import { useMentions } from "../lib/useMentions";
import type { CiMap, ConflictMap } from "../lib/forgeChecks";
import { effectiveFocus, focusList, focusSections, type SummaryFocus } from "../lib/forgeFocus";
import { useForgeCommenters } from "../lib/useForgeCommenters";
import { clockLabel } from "../lib/clockLabel";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import ForgeFilterBar from "./ForgeFilterBar";
import ForgeHeader from "./ForgeHeader";
import ForgeSection from "./ForgeSection";
import ForgeSummary from "./ForgeSummary";
import MentionsList from "./MentionsList";
import PrCommentersCatalog from "./PrCommentersCatalog";
import Skeleton from "./Skeleton";
import SubTabs from "./SubTabs";

type Props = { forge: Forge; login: string; host?: string; lists: ForgeListsState; ci?: CiMap; conflicts?: ConflictMap; onDisconnect: () => void };

type Sub = "lists" | "mentions";

const VIEW_TAB = "canto-hit flex-1 rounded-lg py-1 text-center text-[11px] font-medium transition-colors";

/** Connected forge: header, subtabs (lists vs mentions), PR/issue lists or commenters catalog. */
export default function ForgeBoard({ forge, login, host, lists: gh, ci, conflicts, onDisconnect }: Props) {
  const { lists } = gh;
  const fresh = lists ? freshness(lists) : null;
  const [sub, setSub] = useState<Sub>("lists");
  const [view, setView] = useState<"items" | "commenters">("items");
  const [pressed, setPressed] = useState<SummaryFocus | null>(null);
  const [known, setKnown] = useState(0);
  const focus = effectiveFocus(pressed, ci);

  const mentions = useMentions(forge);
  const { load: loadMentions, loaded } = mentions;
  const onMentions = sub === "mentions";

  useEffect(() => {
    if (onMentions && !loaded) void loadMentions();
  }, [onMentions, loaded, loadMentions]);
  useEffect(() => {
    api.mentionsUnread().then((n) => typeof n === "number" && setKnown(n), () => {});
  }, []);

  const unread = mentions.reply?.unread ?? known;
  const busy = onMentions ? mentions.loading : gh.loading;
  const refresh = () => void (onMentions ? loadMentions(true) : gh.load(gh.filter, true, true));
  const commenters = useForgeCommenters(forge, lists, view === "commenters");
  const shown = lists ? focusSections(visibleSections(forge, gh.filter.kind), focus) : [];

  return (
    <div className="flex h-full flex-col gap-2">
      <ForgeHeader
        login={login}
        host={host}
        cached={!onMentions && !!gh.error && !!lists}
        fetchedAt={onMentions ? null : (fresh?.fetchedAt ?? null)}
        busy={busy}
        onRefresh={refresh}
        onDisconnect={onDisconnect}
      />
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
          {lists && <ForgeSummary forge={forge} lists={lists} ci={ci} focus={focus} onFocus={setPressed} />}

          <div className="flex gap-1 rounded-xl bg-edge/60 p-0.5" role="tablist">
            <button type="button" role="tab" aria-selected={view === "items"} onClick={() => setView("items")} className={`${VIEW_TAB} ${view === "items" ? "bg-ink text-fg shadow-xs" : "text-muted hover:text-fg"}`}>
              {t("forge.view.items")}
            </button>
            <button type="button" role="tab" aria-selected={view === "commenters"} onClick={() => setView("commenters")} className={`${VIEW_TAB} ${view === "commenters" ? "bg-ink text-fg shadow-xs" : "text-muted hover:text-fg"}`}>
              {t("forge.view.commenters", { n: commenters.count })}
            </button>
          </div>

          {view === "items" ? (
            <>
              <ForgeFilterBar forge={forge} filter={gh.filter} onApply={(f) => void gh.load(f, false)} />
              {fresh?.limitedUntil && (
                <p role="status" className="text-[11px] text-muted">
                  {t("forge.rateLimited", { time: clockLabel(fresh.limitedUntil) })}
                </p>
              )}
              {gh.error && <ErrorBanner message={gh.error} onRetry={() => void gh.load(gh.filter, true, true)} busy={gh.loading} />}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {!lists && gh.loading && <Skeleton label={t("forge.loading")} rows={4} />}
                {lists && shown.length === 0 && <p className="rounded-xl border border-dashed border-edge px-3 py-3 text-center text-[11px] text-faint">{t("uiForge.focusEmpty")}</p>}
                {lists &&
                  shown.map(({ key, title }) => (
                    <ForgeSection
                      key={key}
                      title={title}
                      section={key}
                      forge={forge}
                      list={focusList(lists, key, focus, ci)}
                      login={login}
                      filtered={isFiltered(gh.filter) || focus === "failing"}
                      loadingMore={gh.loadingMore.includes(key)}
                      onMore={() => void gh.more(key)}
                      ci={ci}
                      conflicts={conflicts}
                    />
                  ))}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1">
              <PrCommentersCatalog commenters={commenters.commenters} loading={commenters.loading} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
