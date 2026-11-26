import { useState } from "react";
import { api, type ChecksStatus, type ForgeItem } from "../../lib/api";
import type { Forge } from "./forge";
import type { ReviewInfo } from "./forgeChecks";
import { daysSince, timeAgo } from "../../lib/time";
import { loadWatched, toggleWatch } from "./ciWatch";
import { checkKey } from "./forgeChecks";
import { overdue, waitHours, waitLabel, type SnoozeKind } from "./reviewRadar";
import { t } from "../../i18n";
import { CiPill, LabelChip, Pill } from "./ForgePills";
import { IssueIcon, PullIcon } from "../../components/Icons";
import { prSize } from "./forgeSize";

const STALE_DAYS = 7;
// The icon's ring says the PR's state at a glance; the pills below spell it out, so color is never the only signal.
const RING = { bad: "bg-danger/15 text-danger", info: "bg-cat-meet/15 text-cat-meet", ok: "bg-ok/15 text-ok", none: "" };
const ACTION = "canto-hit rounded-md px-1.5 text-[11px] text-muted hover:bg-hover hover:text-fg active:bg-active";

type Props = { item: ForgeItem; login: string; forge: Forge; waiting: boolean; ci?: ChecksStatus; conflict?: boolean; review?: ReviewInfo; news?: number; onOpen?: () => void; onPeek?: () => void; grid?: boolean; avatar?: string; onSnooze?: (kind: SnoozeKind) => void };

function DiffBar({ add, del }: { add: number; del: number }) {
  const total = add + del;
  if (total === 0) return null;
  return (
    <span aria-hidden="true" className="ml-1 inline-flex h-1 w-8 overflow-hidden rounded-full bg-edge align-middle">
      <i className="bg-ok" style={{ width: `${(add / total) * 100}%` }} />
      <i className="flex-1 bg-danger" />
    </span>
  );
}

/** One PR/MR/issue. The secondary actions appear on hover or focus-within; they stay in the tab order while hidden. */
export default function ForgeRow({ item, login, forge, waiting, ci, conflict, review, news = 0, onOpen, onPeek, onSnooze, grid = false, avatar }: Props) {
  const kind = item.is_pr ? (item.draft ? t("forge.item.draftPr") : t("forge.item.pr")) : t("forge.item.issue");
  const [checks, setChecks] = useState<ChecksStatus | "loading" | null>(null);
  const wait = waiting && item.is_pr ? waitHours(item) : null;
  // Review requests already show "aguardando"; elsewhere a PR/MR nobody touched for a week is flagged.
  const idle = !waiting && item.is_pr ? daysSince(item.updated_at) : null;
  const badge = ci ?? (checks !== "loading" ? checks : null);
  const [watching, setWatching] = useState(() => checkKey(item.repo, item.number) in loadWatched());
  const ring = !item.is_pr ? "none" : conflict || badge === "failure" ? "bad" : badge === "running" ? "info" : badge === "success" ? "ok" : "none";
  const urgent = item.is_pr && (conflict || badge === "failure" || (wait !== null && overdue(wait)) || (idle !== null && idle >= STALE_DAYS));
  const canWatch = item.is_pr && forge === "github" && (ci === "running" || watching);
  const canCheck = item.is_pr && !ci && checks === null;

  const band = !item.is_pr
    ? null
    : conflict
      ? { label: `⚠ ${t("forge.item.conflict")}`, cls: "bg-danger/15 text-danger", title: t("forge.item.conflictTitle") }
      : badge === "failure"
        ? { label: t("forge.checks.failure"), cls: "bg-danger/15 text-danger", title: undefined }
        : badge === "running"
          ? { label: t("forge.checks.running"), cls: "bg-cat-meet/15 text-cat-meet", title: undefined }
          : badge === "success"
            ? { label: t("forge.checks.success"), cls: "bg-ok/15 text-ok", title: undefined }
            : null;

  async function loadChecks() {
    setChecks("loading");
    try {
      setChecks(forge === "github" ? await api.githubPrChecks(item.repo, item.number) : await api.gitlabMrChecks(item.repo, item.number));
    } catch {
      setChecks("none");
    }
  }

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => {
          onOpen?.();
          if (onPeek && item.is_pr) onPeek();
          else void api.openLink(item.url);
        }}
        title={item.url}
        className={`relative flex w-full overflow-hidden rounded-xl border bg-ink/60 p-2.5 text-left transition-colors hover:bg-ink ${grid ? "h-full flex-col gap-1.5" : "gap-2.5"} ${conflict ? "border-danger/60" : "border-edge hover:border-line"}`}
      >
        {grid && band && (
          <span role="img" aria-label={band.label} className={`-mx-2.5 -mt-2.5 mb-0.5 flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] font-semibold ${band.cls}`} title={band.title}>
            {band.label}
          </span>
        )}
        {urgent && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-danger/80" />}
        <span
          className={`${grid ? "" : "mt-0.5"} grid size-5 shrink-0 place-items-center rounded-full ${RING[ring]} ${ring === "none" ? (item.draft ? "text-faint" : "text-accent-text") : ""}`}
          aria-label={kind}
          role="img"
        >
          {item.is_pr ? <PullIcon /> : <IssueIcon />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-sm text-fg">{item.title}</span>
          {grid && item.snippet && <span className="mt-1 line-clamp-3 block text-[11.5px] leading-snug text-muted">{item.snippet}</span>}
          {grid && !!item.labels?.length && (
            <span className="mt-1.5 flex flex-wrap gap-1">
              {item.labels.map((name) => (
                <LabelChip key={name} name={name} />
              ))}
            </span>
          )}
          <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted">
            {conflict && !(grid && band) && (
              <Pill tone="bad" title={t("forge.item.conflictTitle")}>
                ⚠ {t("forge.item.conflict")}
              </Pill>
            )}
            {news > 0 && (
              <Pill tone="info" title={t("forge.item.newsTitle", { n: news })}>
                {t("forge.item.news", { n: news })}
              </Pill>
            )}
            {item.is_pr && badge && !(grid && band && !conflict) && <CiPill status={badge} />}
            {item.is_pr && review?.changes && (
              <Pill tone="bad" title={t("forge.item.changesTitle")}>
                {t("forge.item.changes")}
              </Pill>
            )}
            {item.is_pr && review && !review.changes && review.approvals > 0 && (
              <Pill tone="ok" title={t("forge.item.approvedTitle", { n: review.approvals })}>
                {t("forge.item.approved", { n: review.approvals })}
              </Pill>
            )}
            {item.is_pr && checks === "loading" && <span className="text-faint">{t("forge.checks.loading")}</span>}
            <span className="truncate">{item.reference}</span>
            {item.is_pr && review && (
              <span title={t("forge.item.diffTitle")} className="shrink-0 font-mono text-[10.5px] tabular-nums">
                <span className="text-ok">+{review.additions}</span> <span className="text-danger">−{review.deletions}</span>
                <DiffBar add={review.additions} del={review.deletions} />
              </span>
            )}
            {grid && item.is_pr && review && (
              <span title={t("forge.size.title", { size: prSize(review.additions, review.deletions) })} className="shrink-0 rounded-md border border-edge px-1.5 font-mono text-[10px] font-semibold leading-4 text-muted">
                {prSize(review.additions, review.deletions)}
              </span>
            )}
            {item.draft && <span className="shrink-0 text-faint">{t("forge.item.draft")}</span>}
            {item.author && item.author !== login && (
              <span className="inline-flex min-w-0 shrink-0 items-center gap-1 text-faint">
                {avatar && <img src={avatar} alt="" className="size-4 rounded-full" />}
                <span className="truncate">@{item.author}</span>
              </span>
            )}
            {wait !== null && (
              <Pill tone={overdue(wait) ? "bad" : "neutral"} title={overdue(wait) ? t("forge.item.overdueTitle") : undefined}>
                {t("forge.item.waiting", { wait: waitLabel(wait) })}
              </Pill>
            )}
            {idle !== null && idle >= STALE_DAYS && (
              <Pill tone="bad" title={t("forge.item.staleTitle", { n: idle })}>
                {t("forge.item.stale", { n: idle })}
              </Pill>
            )}
            <span className="ml-auto shrink-0 text-faint">{timeAgo(item.updated_at)}</span>
          </span>
        </span>
        {!grid && !(onPeek && item.is_pr) && (
          <span aria-hidden="true" title={t("forge.openExternal")} className="shrink-0 self-start text-[11px] text-faint">
            ↗
          </span>
        )}
      </button>
      {(onSnooze || canCheck || onPeek || canWatch) && (
        <div className={`absolute top-1.5 flex items-center gap-0.5 rounded-lg border border-edge bg-panel p-0.5 opacity-0 shadow-raised transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none ${grid ? "inset-x-1.5 flex-wrap justify-end" : "right-7 whitespace-nowrap"}`}>
          {onPeek && (
            <button type="button" onClick={onPeek} aria-label={t("forge.peek.openOf", { title: item.title })} className={ACTION}>
              {t("forge.peek.open")}
            </button>
          )}
          {canWatch && (
            <button
              type="button"
              aria-pressed={watching}
              onClick={() => setWatching(toggleWatch(item.repo, item.number, item.title))}
              aria-label={t(watching ? "forge.watch.offOf" : "forge.watch.onOf", { title: item.title })}
              className={ACTION}
            >
              {t(watching ? "forge.watch.off" : "forge.watch.on")}
            </button>
          )}
          {onSnooze && (
            <>
              <button type="button" onClick={() => onSnooze("h4")} aria-label={t("forge.snoozeOf", { title: item.title })} className={ACTION}>
                {t("forge.snooze")}
              </button>
              {(["h1", "tomorrow", "week"] as const).map((kind) => (
                <button key={kind} type="button" onClick={() => onSnooze(kind)} aria-label={t(`forge.snoozeOf.${kind}`, { title: item.title })} className={ACTION}>
                  {t(`forge.snooze.${kind}`)}
                </button>
              ))}
            </>
          )}
          {canCheck && (
            <button type="button" onClick={() => void loadChecks()} className={ACTION}>
              {t("forge.checks.show")}
            </button>
          )}
        </div>
      )}
    </li>
  );
}
