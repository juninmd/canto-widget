import { t } from "../i18n";
import type { Priority } from "../lib/api";
import { PRIORITY_LABEL } from "../lib/priority";

const OPTIONS: Priority[] = ["high", "medium", "low"];

type Props = { value: Priority | ""; onChange: (p: Priority | "") => void };

/** "Todas / Alta / Média / Baixa" as one segmented control; the same filter state the old select drove. */
export default function TaskPriorityFilter({ value, onChange }: Props) {
  const seg = (active: boolean) =>
    `canto-hit min-h-[24px] whitespace-nowrap rounded-md px-2 text-[11px] capitalize transition-colors ${
      active ? "bg-raised font-semibold text-accent-text shadow-[var(--shadow-raised)]" : "text-muted hover:bg-hover hover:text-fg active:bg-active"
    }`;
  return (
    <div role="group" aria-label={t("priority.filter")} className="flex shrink-0 gap-0.5 rounded-lg border border-edge bg-ink/60 p-0.5">
      <button type="button" aria-pressed={value === ""} onClick={() => onChange("")} title={t("priority.all")} className={seg(value === "")}>
        {t("uiTasksNotes.prio.all")}
      </button>
      {OPTIONS.map((p) => (
        <button key={p} type="button" aria-pressed={value === p} onClick={() => onChange(p)} className={seg(value === p)}>
          {PRIORITY_LABEL[p]}
        </button>
      ))}
    </div>
  );
}
