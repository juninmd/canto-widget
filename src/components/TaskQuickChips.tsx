import { t } from "../i18n";
import type { Priority } from "../lib/api";
import { PRIORITY_LABEL } from "../lib/priority";
import { insertPriority, insertTime, type TokenEdit } from "../lib/quickAddTokens";
import { ClockIcon } from "./Icons";

const CHIP_BTN =
  "canto-hit inline-flex min-h-[24px] items-center gap-1 rounded-md bg-edge px-1.5 text-[11px] text-muted hover:bg-active hover:text-fg active:bg-active";

const PRIORITIES: Priority[] = ["high", "medium", "low"];
const TOKEN_KEY = { high: "uiTasksNotes.chip.high", medium: "uiTasksNotes.chip.medium", low: "uiTasksNotes.chip.low" } as const;

type Props = { value: string; onEdit: (edit: TokenEdit | null) => void };

/** Shortcuts under the new-task field: each drops the token the quick-add parser reads into the text. */
export default function TaskQuickChips({ value, onEdit }: Props) {
  return (
    <div role="group" aria-label={t("uiTasksNotes.chip.group")} className="flex flex-wrap items-center gap-1">
      <span aria-hidden="true" className="mr-0.5 text-[11px] text-faint">
        {t("uiTasksNotes.chip.label")}
      </span>
      <button type="button" onClick={() => onEdit(insertTime(value))} title={t("uiTasksNotes.chip.timeHint")} className={CHIP_BTN}>
        <ClockIcon />
        {t("uiTasksNotes.chip.time")}
      </button>
      {PRIORITIES.map((priority) => {
        const token = t(TOKEN_KEY[priority]);
        return (
          <button
            key={priority}
            type="button"
            onClick={() => onEdit(insertPriority(value, token))}
            title={t("uiTasksNotes.chip.priorityHint", { label: PRIORITY_LABEL[priority] })}
            className={CHIP_BTN}
          >
            {token}
          </button>
        );
      })}
    </div>
  );
}
