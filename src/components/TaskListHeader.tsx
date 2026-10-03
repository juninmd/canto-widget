import { t } from "../i18n";
import type { Priority } from "../lib/api";
import { PRIORITY_LABEL } from "../lib/priority";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

type Props = {
  done: number;
  total: number;
  priorityFilter: Priority | "";
  onPriorityFilter: (p: Priority | "") => void;
  onSummary: () => void;
  onCarryOver: () => void;
};

export default function TaskListHeader({ done, total, priorityFilter, onPriorityFilter, onSummary, onCarryOver }: Props) {
  const ghost = "canto-hit min-h-[24px] whitespace-nowrap rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 text-[11px] text-muted">
        <span className="whitespace-nowrap tabular-nums">{t("tasks.doneCount", { done, total })}</span>
        <div
          role="progressbar"
          aria-label={t("tasks.doneCount", { done, total })}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          className="h-1 flex-1 overflow-hidden rounded-full bg-edge"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: total === 0 ? "0%" : `${Math.round((done / total) * 100)}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted">
        <span className="flex items-center gap-0.5">
          <button type="button" onClick={onSummary} title={t("tasks.summaryHint")} className={`${ghost} -ml-1.5`}>
            {t("summary.heading")}
          </button>
          <button type="button" onClick={onCarryOver} title={t("tasks.carryOverHint")} className={ghost}>
            {t("tasks.carryOver")}
          </button>
        </span>
        <select
          aria-label={t("priority.filter")}
          value={priorityFilter}
          onChange={(e) => onPriorityFilter(e.target.value as Priority | "")}
          className="canto-hit rounded-md border border-edge bg-ink px-1.5 py-0.5 text-[11px] text-muted outline-none focus:border-accent"
        >
          <option value="">{t("priority.all")}</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
