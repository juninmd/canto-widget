import { useState } from "react";
import { api, type ChecksStatus, type ForgeItem, type ForgeList, type ForgeSection as ForgeSectionKey } from "../lib/api";
import type { Forge } from "../lib/forge";
import { checkKey, type CiMap } from "../lib/forgeChecks";
import { daysSince, timeAgo } from "../lib/time";
import { loadSnoozes, oldestFirst, overdue, snoozeUntil, waitHours, waitLabel } from "../lib/reviewRadar";
import { t, type MessageKey } from "../i18n";
import { IssueIcon, PullIcon } from "./Icons";

type Props = {
  title: string;
  section: ForgeSectionKey;
  forge: Forge;
  list: ForgeList;
  login: string;
  filtered: boolean;
  loadingMore: boolean;
  onMore: () => void;
  /** CI badges loaded in batch (GitHub); a PR missing here keeps the "ver CI" link. */
  ci?: CiMap;
};

export default function ForgeSection({ title, section, forge, list, login, filtered, loadingMore, onMore, ci }: Props) {
  const rest = list.total - list.items.length;
  const radar = section === "review_requested";
  const [snoozed, setSnoozed] = useState(loadSnoozes);
  const [showSnoozed, setShowSnoozed] = useState(false);
  const ordered = radar ? oldestFirst(list.items) : list.items;
  const hidden = radar ? ordered.filter((i) => snoozed[i.url] > Date.now()) : [];
  const shown = radar && !showSnoozed ? ordered.filter((i) => !hidden.includes(i)) : ordered;
  return (
    <section aria-label={title}>
      <h3 className="mb-1 text-xs font-semibold text-fg">
        {title} <span className="font-normal text-faint">({list.total})</span>
      </h3>
      {radar && hidden.length > 0 && (
        <button
          type="button"
          onClick={() => setShowSnoozed(!showSnoozed)}
          className="mb-1 min-h-6 text-[11px] text-muted underline decoration-dotted hover:text-fg"
        >
          {showSnoozed ? t("forge.snoozedHide") : t("forge.snoozedShow", { n: hidden.length })}
        </button>
      )}
      {list.items.length === 0 ? (
        <p className="px-2 py-1 text-[11px] text-faint">{filtered ? t("forge.emptyFiltered") : t("forge.empty")}</p>
      ) : (
        <ul className="space-y-1.5">
          {shown.map((it) => (
            <Row
              key={it.url}
              item={it}
              login={login}
              forge={forge}
              waiting={radar}
              ci={ci?.[checkKey(it.repo, it.number)]}
              onSnooze={radar ? () => setSnoozed(snoozeUntil(it.url)) : undefined}
            />
          ))}
        </ul>
      )}
      {rest > 0 && (
        <button
          type="button"
          onClick={onMore}
          disabled={loadingMore}
          className="mt-1.5 min-h-7 w-full rounded-lg bg-edge text-[11px] text-muted hover:text-fg disabled:opacity-60"
        >
          {loadingMore ? t("forge.loadingMore") : t("forge.showMore", { n: rest })}
        </button>
      )}
    </section>
  );
}

const STALE_DAYS = 7;
type RowProps = { item: ForgeItem; login: string; forge: Forge; waiting: boolean; ci?: ChecksStatus; onSnooze?: () => void };
function Row({ item, login, forge, waiting, ci, onSnooze }: RowProps) {
  const kind = item.is_pr ? (item.draft ? t("forge.item.draftPr") : t("forge.item.pr")) : t("forge.item.issue");
  const [checks, setChecks] = useState<ChecksStatus | "loading" | null>(null);
  const wait = waiting && item.is_pr ? waitHours(item) : null;
  // Review requests already show "aguardando"; elsewhere a PR/MR nobody touched for a week is flagged.
  const idle = !waiting && item.is_pr ? daysSince(item.updated_at) : null;

  async function loadChecks() {
    setChecks("loading");
    try {
      setChecks(forge === "github" ? await api.githubPrChecks(item.repo, item.number) : await api.gitlabMrChecks(item.repo, item.number));
    } catch {
      setChecks("none");
    }
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => void api.openLink(item.url)}
        title={item.url}
        className="flex w-full gap-2 rounded-lg border border-edge bg-ink/60 p-2 text-left hover:border-line"
      >
        <span className={`mt-0.5 shrink-0 ${item.draft ? "text-faint" : "text-accent"}`} aria-label={kind} role="img">
          {item.is_pr ? <PullIcon /> : <IssueIcon />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-sm text-fg">{item.title}</span>
          <span className="mt-0.5 flex gap-2 text-[11px] text-muted">
            {item.is_pr && ci && <CiPill status={ci} />}
            <span className="truncate">{item.reference}</span>
            {item.draft && <span className="shrink-0 text-faint">{t("forge.item.draft")}</span>}
            {item.author && item.author !== login && <span className="shrink-0 truncate text-faint">@{item.author}</span>}
            {wait !== null && (
              <span className={`shrink-0 ${overdue(wait) ? "text-danger" : "text-faint"}`} title={overdue(wait) ? t("forge.item.overdueTitle") : undefined}>
                {t("forge.item.waiting", { wait: waitLabel(wait) })}
              </span>
            )}
            {idle !== null && idle >= STALE_DAYS && (
              <span className="shrink-0 text-danger" title={t("forge.item.staleTitle", { n: idle })}>
                {t("forge.item.stale", { n: idle })}
              </span>
            )}
            <span className="ml-auto shrink-0 text-faint">{timeAgo(item.updated_at)}</span>
          </span>
        </span>
      </button>
      {item.is_pr && !ci && (
        <div className="mt-1 flex items-center gap-2 pl-7 text-[11px]">
          {onSnooze && (
            <button
              type="button"
              onClick={onSnooze}
              aria-label={t("forge.snoozeOf", { title: item.title })}
              className="text-muted underline decoration-dotted hover:text-fg"
            >
              {t("forge.snooze")}
            </button>
          )}
          {checks === null ? (
            <button type="button" onClick={() => void loadChecks()} className="text-muted underline decoration-dotted hover:text-fg">
              {t("forge.checks.show")}
            </button>
          ) : (
            <ChecksBadge status={checks} />
          )}
        </div>
      )}
    </li>
  );
}

function ChecksBadge({ status }: { status: ChecksStatus | "loading" }) {
  const map: Record<ChecksStatus | "loading", { label: string; className: string }> = {
    loading: { label: t("forge.checks.loading"), className: "text-faint" },
    success: { label: t("forge.checks.success"), className: "text-accent" },
    failure: { label: t("forge.checks.failure"), className: "text-danger" },
    running: { label: t("forge.checks.running"), className: "text-muted" },
    none: { label: t("forge.checks.none"), className: "text-faint" },
  };
  const { label, className } = map[status];
  return <span className={className}>{label}</span>;
}

const PILL: Record<ChecksStatus, { glyph: string; label: MessageKey; className: string }> = {
  success: { glyph: "✓", label: "forge.checks.success", className: "text-accent" },
  failure: { glyph: "✗", label: "forge.checks.failure", className: "text-danger" },
  running: { glyph: "●", label: "forge.checks.running", className: "text-muted" },
  none: { glyph: "○", label: "forge.checks.none", className: "text-faint" },
};

/** Compact so the reference still fits on a narrow widget; the full wording is the accessible name. */
function CiPill({ status }: { status: ChecksStatus }) {
  const { glyph, label, className } = PILL[status];
  const text = t(label);
  return (
    <span role="img" aria-label={text} title={text} className={`shrink-0 rounded-full border border-edge px-1.5 leading-4 ${className}`}>
      {glyph} CI
    </span>
  );
}
