import { useState } from "react";
import { api, type ChecksStatus, type ForgeItem } from "../lib/api";
import type { Forge } from "../lib/forge";
import { daysSince, timeAgo } from "../lib/time";
import { overdue, waitHours, waitLabel } from "../lib/reviewRadar";
import { t } from "../i18n";
import { CiPill, Pill } from "./ForgePills";
import { IssueIcon, PullIcon } from "./Icons";

const STALE_DAYS = 7;
const ACTION = "canto-hit rounded-md px-1.5 text-[11px] text-muted hover:bg-hover hover:text-fg active:bg-active";

type Props = { item: ForgeItem; login: string; forge: Forge; waiting: boolean; ci?: ChecksStatus; conflict?: boolean; onSnooze?: () => void };

/** One PR/MR/issue. The secondary actions appear on hover or focus-within; they stay in the tab order while hidden. */
export default function ForgeRow({ item, login, forge, waiting, ci, conflict, onSnooze }: Props) {
  const kind = item.is_pr ? (item.draft ? t("forge.item.draftPr") : t("forge.item.pr")) : t("forge.item.issue");
  const [checks, setChecks] = useState<ChecksStatus | "loading" | null>(null);
  const wait = waiting && item.is_pr ? waitHours(item) : null;
  // Review requests already show "aguardando"; elsewhere a PR/MR nobody touched for a week is flagged.
  const idle = !waiting && item.is_pr ? daysSince(item.updated_at) : null;
  const badge = ci ?? (checks !== "loading" ? checks : null);
  const canCheck = item.is_pr && !ci && checks === null;

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
        onClick={() => void api.openLink(item.url)}
        title={item.url}
        className={`flex w-full gap-2.5 rounded-xl border bg-ink/60 p-2.5 text-left transition-colors hover:bg-ink ${conflict ? "border-danger/60" : "border-edge hover:border-line"}`}
      >
        <span className={`mt-0.5 shrink-0 ${item.draft ? "text-faint" : "text-accent-text"}`} aria-label={kind} role="img">
          {item.is_pr ? <PullIcon /> : <IssueIcon />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-sm text-fg">{item.title}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted">
            {conflict && (
              <Pill tone="bad" title={t("forge.item.conflictTitle")}>
                ⚠ {t("forge.item.conflict")}
              </Pill>
            )}
            {item.is_pr && badge && <CiPill status={badge} />}
            {item.is_pr && checks === "loading" && <span className="text-faint">{t("forge.checks.loading")}</span>}
            <span className="truncate">{item.reference}</span>
            {item.draft && <span className="shrink-0 text-faint">{t("forge.item.draft")}</span>}
            {item.author && item.author !== login && <span className="shrink-0 truncate text-faint">@{item.author}</span>}
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
        <span aria-hidden="true" title={t("forge.openExternal")} className="shrink-0 self-start text-[11px] text-faint">
          ↗
        </span>
      </button>
      {(onSnooze || canCheck) && (
        <div className="absolute right-7 top-1.5 flex items-center gap-0.5 rounded-lg border border-edge bg-panel p-0.5 opacity-0 shadow-raised transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none">
          {onSnooze && (
            <button type="button" onClick={onSnooze} aria-label={t("forge.snoozeOf", { title: item.title })} className={ACTION}>
              {t("forge.snooze")}
            </button>
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
