import { useEffect, useState } from "react";
import { api, type ForgeItem } from "../../lib/api";
import { freshness, isFiltered, visibleSections, type Forge } from "./forge";
import type { ForgeListsState } from "./useForgeLists";
import { useMentions } from "./useMentions";
import type { CiMap, ConflictMap, ReviewMap } from "./forgeChecks";
import { ATTENTION_SECTIONS, attentionCount, needsAttention } from "./forgeAttention";
import { effectiveFocus, focusList, focusSections, type SummaryFocus } from "./forgeFocus";
import { useForgeCommenters } from "./useForgeCommenters";
import { useRepos } from "./useRepos";
import { clockLabel } from "../../lib/clockLabel";
import { t } from "../../i18n";
import ErrorBanner from "../../components/ErrorBanner";
import ForgeFilterBar from "./ForgeFilterBar";
import ForgeHeader from "./ForgeHeader";
import ForgeNextCard from "./ForgeNextCard";
import { nextAction } from "./forgeNext";
import { savedLayout, saveLayout, type ForgeLayout } from "./forgeLayout";
import ForgeSection from "./ForgeSection";
import ForgeSummary from "./ForgeSummary";
import MentionsList from "./MentionsList";
import { savedHideDrafts, saveHideDrafts } from "./forgeDrafts";
import PrPeek from "./PrPeek";
import PrCommentersCatalog from "./PrCommentersCatalog";
import ReposList, { savedStats } from "./ReposList";
import Skeleton from "../../components/Skeleton";
import SubTabs from "../../components/SubTabs";

type Props = { forge: Forge; login: string; host?: string; lists: ForgeListsState; ci?: CiMap; conflicts?: ConflictMap; reviews?: ReviewMap; onDisconnect: () => void };

type Sub = "lists" | "mentions" | "repos";

const VIEW_TAB = "canto-hit flex-1 rounded-lg py-1 text-center text-[11px] font-medium transition-colors";

/** Connected forge: header, subtabs (lists vs mentions), PR/issue lists or commenters catalog. */
export default function ForgeBoard({ forge, login, host, lists: gh, ci, conflicts, reviews, onDisconnect }: Props) {
  const { lists } = gh;
  const fresh = lists ? freshness(lists) : null;
  const [sub, setSub] = useState<Sub>("lists");
  const [view, setView] = useState<"items" | "commenters">("items");
  const [pressed, setPressed] = useState<SummaryFocus | null>(null);
  const [known, setKnown] = useState(0);
  const [hideDrafts, setHideDrafts] = useState(savedHideDrafts);
  const [attention, setAttention] = useState(false);
  const [peeked, setPeeked] = useState<ForgeItem | null>(null);
  const [layout, setLayout] = useState<ForgeLayout>(savedLayout);
  const focus = effectiveFocus(pressed, ci);

  const mentions = useMentions(forge);
  const { load: loadMentions, loaded } = mentions;
  const onMentions = sub === "mentions";
  const onRepos = sub === "repos";
  const [stats, setStats] = useState(savedStats);
  const repos = useRepos(forge, onRepos, stats);

  useEffect(() => {
    if (onMentions && !loaded) void loadMentions();
  }, [onMentions, loaded, loadMentions]);
  useEffect(() => {
    api.mentionsUnread().then((n) => typeof n === "number" && setKnown(n), () => {});
  }, []);

  const unread = mentions.reply?.unread ?? known;
  const busy = onRepos ? repos.loading : onMentions ? mentions.loading : gh.loading;
  const refresh = () => (onRepos ? repos.refresh() : void (onMentions ? loadMentions(true) : gh.load(gh.filter, true, true)));
  const commenters = useForgeCommenters(forge, lists, view === "commenters");
  const signals = { ci, conflicts, reviews };
  const stuck = lists ? attentionCount(lists, new Date(), signals) : 0;
  const attending = attention && stuck > 0;
  const next = lists ? nextAction(lists, ci, conflicts) : null;
  const base = lists ? focusSections(visibleSections(forge, gh.filter.kind), focus) : [];
  const shown = attending ? base.filter((s) => ATTENTION_SECTIONS.includes(s.key)) : base;

  return (
    <div className="flex h-full flex-col gap-2">
      <ForgeHeader
        login={login}
        host={host}
        cached={!onMentions && !onRepos && !!gh.error && !!lists}
        fetchedAt={onRepos ? repos.fetchedAt : onMentions ? null : (fresh?.fetchedAt ?? null)}
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
          { key: "repos", label: t("forge.sub.repos") },
        ]}
      />
      {onRepos ? (
        <ReposList forge={forge} repos={repos} stats={stats} onStats={setStats} />
      ) : onMentions ? (
        <MentionsList forge={forge} mentions={mentions} />
      ) : (
        <>
          {next && <ForgeNextCard next={next} onOpen={() => (forge === "github" ? setPeeked(next.item) : void api.openLink(next.item.url))} />}
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
              <div className="flex flex-wrap gap-1.5">
                {stuck > 0 && (
                  <button
                    type="button"
                    aria-pressed={attention}
                    title={t("forge.attentionTitle")}
                    onClick={() => setAttention(!attention)}
                    className={`canto-hit min-h-[24px] rounded-full px-2.5 text-[11px] ${attention ? "bg-accent font-semibold text-on-accent" : "bg-edge text-muted hover:bg-active hover:text-fg"}`}
                  >
                    {t("forge.attention", { n: stuck })}
                  </button>
                )}
                <button
                  type="button"
                  aria-pressed={hideDrafts}
                  onClick={() => {
                    saveHideDrafts(!hideDrafts);
                    setHideDrafts(!hideDrafts);
                  }}
                  className={`canto-hit min-h-[24px] rounded-full px-2.5 text-[11px] ${hideDrafts ? "bg-accent font-semibold text-on-accent" : "bg-edge text-muted hover:bg-active hover:text-fg"}`}
                >
                  {t("forge.hideDrafts")}
                </button>
                <div role="group" aria-label={t("forge.layout.label")} className="ml-auto flex gap-0.5 rounded-full bg-edge/60 p-0.5">
                  {(["list", "grid"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      aria-pressed={layout === l}
                      onClick={() => {
                        saveLayout(l);
                        setLayout(l);
                      }}
                      className={`canto-hit min-h-[22px] rounded-full px-2.5 text-[11px] ${layout === l ? "bg-ink font-semibold text-fg shadow-xs" : "text-muted hover:text-fg"}`}
                    >
                      {t(`forge.layout.${l}`)}
                    </button>
                  ))}
                </div>
              </div>
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
                      reviews={reviews}
                      hideDrafts={hideDrafts}
                      grid={layout === "grid"}
                      onPeek={forge === "github" ? setPeeked : undefined}
                      needs={attending ? (it) => needsAttention(key, it, new Date(), signals) : undefined}
                    />
                  ))}
              </div>
              {peeked && forge === "github" && <PrPeek item={peeked} login={login} onClose={() => setPeeked(null)} />}
            </>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1">
              <PrCommentersCatalog commenters={commenters.commenters} loading={commenters.loading} profiles={forge === "github"} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
