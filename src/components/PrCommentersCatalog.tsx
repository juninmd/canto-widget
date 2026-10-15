import { useMemo, useState } from "react";
import { api } from "../lib/api";
import { timeAgo } from "../lib/time";
import { t } from "../i18n";
import Avatar from "./Avatar";
import { PullIcon } from "./Icons";
import Skeleton from "./Skeleton";
import { filterCommenters, type CommenterGroup, type EnrichedComment } from "../lib/prCommenters";

const PAGE_SIZE = 18;
const PR_PAGE_SIZE = 10;

type Props = {
  commenters: CommenterGroup[];
  loading?: boolean;
};

export default function PrCommentersCatalog({ commenters, loading }: Props) {
  const [query, setQuery] = useState("");
  const [hideBots, setHideBots] = useState(false);
  const [selectedLogin, setSelectedLogin] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prsCount, setPrsCount] = useState(PR_PAGE_SIZE);

  const filtered = useMemo(() => filterCommenters(commenters, query, hideBots), [commenters, query, hideBots]);
  const visibleCommenters = filtered.slice(0, visibleCount);
  const selected = selectedLogin ? filtered.find((c) => c.login === selectedLogin) ?? null : null;

  const displayPrs = useMemo(() => {
    const prsMap = new Map<string, (typeof commenters)[0]["prs"][0]>();
    const sourcePrs = selected ? selected.prs : filtered.flatMap((c) => c.prs);
    for (const pr of sourcePrs) {
      const key = `${pr.repo}#${pr.number}`;
      const existing = prsMap.get(key);
      if (!existing) {
        prsMap.set(key, { ...pr, comments: [...pr.comments] });
      } else {
        for (const cm of pr.comments) {
          if (!existing.comments.some((ec) => ec.id === cm.id)) existing.comments.push(cm);
        }
      }
    }
    return Array.from(prsMap.values());
  }, [selected, filtered]);

  const visiblePrs = displayPrs.slice(0, prsCount);

  if (loading && commenters.length === 0) {
    return <Skeleton label={t("forge.commenters.loadingComments")} rows={3} />;
  }

  const totalComments = commenters.reduce((acc, c) => acc + c.totalComments, 0);
  const totalPrs = new Set(commenters.flatMap((c) => c.prs.map((p) => `${p.repo}#${p.number}`))).size;

  return (
    <div className="flex flex-col gap-2.5 text-xs text-fg">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold">{t("forge.commenters.title")}</h3>
          <p className="text-[11px] text-faint">
            {t("forge.commenters.subtitle", { people: commenters.length, comments: totalComments, prs: totalPrs })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setHideBots((h) => !h);
            setVisibleCount(PAGE_SIZE);
          }}
          aria-pressed={hideBots}
          className={`canto-hit rounded-md px-2 py-1 text-[11px] border transition-colors ${
            hideBots ? "border-accent-line bg-accent-soft text-accent-text font-medium" : "border-edge bg-ink text-muted hover:text-fg"
          }`}
        >
          {hideBots ? t("forge.commenters.showBots") : t("forge.commenters.hideBots")}
        </button>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setVisibleCount(PAGE_SIZE);
          setPrsCount(PR_PAGE_SIZE);
        }}
        placeholder={t("forge.commenters.searchPlaceholder")}
        className="w-full rounded-xl border border-edge bg-ink/60 px-2.5 py-1.5 text-xs text-fg placeholder:text-faint focus:border-line focus:outline-none"
      />

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-edge px-3 py-4 text-center text-[11px] text-faint">
          {commenters.length === 0 ? t("forge.commenters.empty") : t("forge.commenters.emptyFiltered")}
        </p>
      ) : (
        <>
          <div className="grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3" role="region" aria-label={t("forge.commenters.title")}>
            {visibleCommenters.map((c) => {
              const active = selectedLogin === c.login;
              return (
                <button
                  key={c.login}
                  type="button"
                  onClick={() => {
                    setSelectedLogin(active ? null : c.login);
                    setPrsCount(PR_PAGE_SIZE);
                  }}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-colors ${
                    active ? "border-accent-line bg-accent-soft/40 shadow-xs" : "border-edge bg-ink/60 hover:border-line hover:bg-ink"
                  }`}
                >
                  <Avatar name={c.login} photo={c.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="truncate font-semibold text-[11px] text-fg">{`@${c.login}`}</span>
                      <span className={`shrink-0 rounded-full px-1 text-[9px] ${c.isBot ? "bg-edge text-faint" : "bg-accent-soft text-accent-text"}`}>{c.isBot ? t("forge.commenters.tagBot") : t("forge.commenters.tagHuman")}</span>
                    </div>
                    <span className="text-[10px] text-muted">
                      {t("forge.commenters.commentsCount", { n: c.totalComments })} · {t("forge.commenters.prsCount", { n: c.prsCount })}
                    </span>
                  </div>
                </button>
              );
            })}
            {filtered.length > visibleCount && (
              <button
                type="button"
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                className="col-span-2 sm:col-span-3 canto-hit rounded-xl border border-dashed border-edge py-1.5 text-center text-[11px] text-muted hover:border-line hover:text-fg"
              >
                {t("forge.commenters.showMore", { n: filtered.length - visibleCount })}
              </button>
            )}
          </div>

          <div className="mt-1 space-y-2">
            {selected && (
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>{t("forge.commenters.filterBy", { login: selected.login })}</span>
                <button
                  type="button"
                  onClick={() => setSelectedLogin(null)}
                  className="canto-hit rounded-md px-1.5 py-0.5 text-accent-text hover:underline"
                >
                  {t("forge.commenters.clearFilter")}
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              {visiblePrs.map((pr) => (
                <div key={`${pr.repo}#${pr.number}`} className="rounded-xl border border-edge bg-ink/40 p-2.5">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <button
                      type="button"
                      onClick={() => void api.openLink(pr.url)}
                      className="flex items-center gap-1.5 text-left font-medium text-xs text-fg hover:text-accent-text transition-colors truncate"
                    >
                      <span className="shrink-0 text-accent-text"><PullIcon /></span>
                      <span className="truncate">{pr.title}</span>
                      <span className="shrink-0 text-faint text-[10px]">{`(${pr.repo}#${pr.number})`}</span>
                    </button>
                  </div>
                  <div className="space-y-1 pl-4 border-l border-edge ml-1">
                    {pr.comments.map((cm: EnrichedComment) => (
                      <div key={cm.id} className="text-[11px]">
                        <div className="flex items-center justify-between gap-1 text-[10px] text-faint">
                          <span className="font-medium text-muted">{`@${cm.author}`}</span>
                          <span>{timeAgo(cm.created_at)}</span>
                        </div>
                        <p
                          className="line-clamp-2 text-fg/90 cursor-pointer hover:text-fg hover:underline"
                          onClick={() => void api.openLink(cm.url)}
                        >
                          {cm.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {displayPrs.length > prsCount && (
                <button
                  type="button"
                  onClick={() => setPrsCount((p) => p + PR_PAGE_SIZE)}
                  className="w-full canto-hit rounded-xl border border-dashed border-edge py-1.5 text-center text-[11px] text-muted hover:border-line hover:text-fg"
                >
                  {t("forge.commenters.morePrs", { n: displayPrs.length - prsCount })}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
