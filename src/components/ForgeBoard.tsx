import { useEffect, useMemo, useState } from "react";
import { api, type PrComment } from "../lib/api";
import { freshness, isFiltered, visibleSections, type Forge } from "../lib/forge";
import type { ForgeListsState } from "../lib/useForgeLists";
import { useMentions } from "../lib/useMentions";
import type { CiMap, ConflictMap } from "../lib/forgeChecks";
import { fetchInBatches, groupCommenters, prsWithComments, type EnrichedComment } from "../lib/prCommenters";
import { timeAgo } from "../lib/time";
import { clockLabel } from "../lib/clockLabel";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import ForgeDisconnect from "./ForgeDisconnect";
import ForgeFilterBar from "./ForgeFilterBar";
import ForgeSection from "./ForgeSection";
import ForgeSummary from "./ForgeSummary";
import MentionsList from "./MentionsList";
import PrCommentersCatalog from "./PrCommentersCatalog";
import Skeleton from "./Skeleton";
import Spinner from "./Spinner";
import SubTabs from "./SubTabs";

type Props = { forge: Forge; login: string; host?: string; lists: ForgeListsState; ci?: CiMap; conflicts?: ConflictMap; onDisconnect: () => void };

type Sub = "lists" | "mentions";

const BTN = "canto-hit inline-flex min-h-[24px] items-center gap-1 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active disabled:opacity-60";

/** Connected forge: header, subtabs (lists vs mentions), PR/issue lists or commenters catalog. */
export default function ForgeBoard({ forge, login, host, lists: gh, ci, conflicts, onDisconnect }: Props) {
  const { lists } = gh;
  const fresh = lists ? freshness(lists) : null;
  const [sub, setSub] = useState<Sub>("lists");
  const [view, setView] = useState<"items" | "commenters">("items");
  const [commentsCache, setCommentsCache] = useState<Record<string, PrComment[]>>({});
  const [loadingComments, setLoadingComments] = useState(false);
  const [known, setKnown] = useState(0);

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

  const myPrsWithComments = lists ? prsWithComments(lists.my_prs.items) : [];

  useEffect(() => {
    if (view !== "commenters" || !lists?.my_prs?.items) return;
    const targets = myPrsWithComments.filter((p) => !commentsCache[`${p.repo}#${p.number}`]);
    if (targets.length === 0) return;

    let live = true;
    setLoadingComments(true);
    fetchInBatches(targets, 4, async (pr) => {
      try {
        const cms = forge === "github" ? await api.githubPrComments(pr.repo, pr.number) : [];
        return { key: `${pr.repo}#${pr.number}`, comments: cms };
      } catch {
        return { key: `${pr.repo}#${pr.number}`, comments: [] };
      }
    })
      .then((res) => {
        if (!live) return;
        setCommentsCache((prev) => {
          const next = { ...prev };
          for (const r of res) next[r.key] = r.comments;
          return next;
        });
      })
      .finally(() => {
        if (live) setLoadingComments(false);
      });

    return () => {
      live = false;
    };
  }, [view, lists?.my_prs?.items, forge, myPrsWithComments, commentsCache]);

  const commenters = useMemo(() => {
    const enrichedComments: EnrichedComment[] = [];
    if (!lists?.my_prs?.items) return [];
    for (const pr of lists.my_prs.items) {
      const cms = commentsCache[`${pr.repo}#${pr.number}`] || [];
      for (const c of cms) {
        enrichedComments.push({
          ...c,
          repo: pr.repo,
          prNumber: pr.number,
          prTitle: pr.title,
          prUrl: pr.url,
        });
      }
    }
    return groupCommenters(enrichedComments);
  }, [lists?.my_prs?.items, commentsCache]);

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

          <div className="flex gap-1 rounded-xl bg-edge/60 p-0.5" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={view === "items"}
              onClick={() => setView("items")}
              className={`canto-hit flex-1 rounded-lg py-1 text-center text-[11px] font-medium transition-colors ${
                view === "items" ? "bg-ink text-fg shadow-xs" : "text-muted hover:text-fg"
              }`}
            >
              {t("forge.view.items")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "commenters"}
              onClick={() => setView("commenters")}
              className={`canto-hit flex-1 rounded-lg py-1 text-center text-[11px] font-medium transition-colors ${
                view === "commenters" ? "bg-ink text-fg shadow-xs" : "text-muted hover:text-fg"
              }`}
            >
              {t("forge.view.commenters", { n: myPrsWithComments.length })}
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
                      conflicts={conflicts}
                    />
                  ))}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1">
              <PrCommentersCatalog commenters={commenters} loading={loadingComments} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
