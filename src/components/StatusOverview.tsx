import { t } from "../i18n";
import type { StatusCounts, StatusFilter } from "../lib/statusView";

type Props = { counts: StatusCounts; bad: number; ok: number; filter: StatusFilter; onFilter: (f: StatusFilter) => void };

const SEGMENTS: { key: "down" | "warn" | "maintenance" | "unknown" | "ok"; color: string }[] = [
  { key: "down", color: "bg-danger" },
  { key: "warn", color: "bg-warn" },
  { key: "maintenance", color: "bg-cat-chat" },
  { key: "unknown", color: "bg-faint" },
  { key: "ok", color: "bg-ok" },
];

const CHIPS: { key: StatusFilter; label: "uiStatus.filter.all" | "uiStatus.filter.problems" | "uiStatus.filter.ok" | "uiStatus.filter.maintenance" }[] = [
  { key: "all", label: "uiStatus.filter.all" },
  { key: "problems", label: "uiStatus.filter.problems" },
  { key: "ok", label: "uiStatus.filter.ok" },
  { key: "maintenance", label: "uiStatus.filter.maintenance" },
];

/** The headline (how many services are in trouble), a bar of the states in proportion and the filter chips with counts. */
export default function StatusOverview({ counts, bad, ok, filter, onFilter }: Props) {
  return (
    <>
      <div className="rounded-xl border border-edge bg-panel px-3.5 py-3">
        <b className={`block whitespace-nowrap text-sm ${bad > 0 ? "text-danger" : "text-fg"}`}>{t("status.summary", { bad, ok })}</b>
        <div
          role="img"
          aria-label={t("uiStatus.bar", { down: counts.down, warn: counts.warn, maint: counts.maintenance, ok: counts.ok })}
          className="mt-2.5 flex h-2 gap-0.5 overflow-hidden rounded-full bg-edge"
        >
          {SEGMENTS.map((s) => (counts[s.key] > 0 ? <i key={s.key} className={`canto-grow-x ${s.color} min-w-1`} style={{ flexGrow: counts[s.key] }} /> : null))}
        </div>
      </div>
      <div role="group" aria-label={t("uiStatus.filter.label")} className="flex flex-wrap gap-1 text-[11px]">
        {CHIPS.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-pressed={filter === c.key}
            onClick={() => onFilter(c.key)}
            className={`canto-hit inline-flex min-h-[24px] items-center gap-1.5 rounded-full px-2.5 ${
              filter === c.key ? "bg-accent font-semibold text-on-accent" : "bg-edge text-muted hover:bg-active hover:text-fg active:bg-active"
            }`}
          >
            {t(c.label)}
            <span className="tabular-nums opacity-80">{counts[c.key]}</span>
          </button>
        ))}
      </div>
    </>
  );
}
