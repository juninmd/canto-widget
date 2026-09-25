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
  return (
    <div className="flex items-center justify-between text-[11px] text-muted">
      <span>{t("tasks.doneCount", { done, total })}</span>
      <span className="flex gap-3">
        <button
          type="button"
          onClick={onSummary}
          title={t("tasks.summaryHint")}
          className="min-h-6 underline decoration-dotted hover:text-fg"
        >
          {t("summary.heading")}
        </button>
        <button
          type="button"
          onClick={onCarryOver}
          title={t("tasks.carryOverHint")}
          className="min-h-6 underline decoration-dotted hover:text-fg"
        >
          {t("tasks.carryOver")}
        </button>
        <select
          aria-label={t("priority.filter")}
          value={priorityFilter}
          onChange={(e) => onPriorityFilter(e.target.value as Priority | "")}
          className="rounded border border-line bg-ink px-1 py-0.5 text-[11px] text-muted outline-none focus:border-accent"
        >
          <option value="">{t("priority.all")}</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
}
