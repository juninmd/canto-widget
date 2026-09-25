import { useState } from "react";
import { t } from "../i18n";
import { api } from "../lib/api";
import type { ExtendedRepeat, Priority, Repeat, Task } from "../lib/api";
import { REPEAT_LABEL } from "../lib/reminders";
import { PRIORITY_DOT, PRIORITY_LABEL } from "../lib/priority";
import RepeatControl from "./RepeatControl";
import { ClockIcon, PullIcon } from "./Icons";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

function extendedLabel(r: ExtendedRepeat): string {
  return r.tipo === "monthly" ? t("repeat.monthlyOn", { day: r.day }) : t("repeat.specificDaysLower");
}

/** A task's time, repeat rule, priority and linked PR/MR. Every change saves immediately: there's no "save" to forget. */
export default function TaskDetails({
  task,
  onChange,
  onExtendedRepeat,
  onLinkPr,
  onPriority,
  onClose,
}: {
  task: Task;
  onChange: (time: string | null, repeat: Repeat | null) => void;
  onExtendedRepeat: (repeat: ExtendedRepeat | null) => void;
  onLinkPr: (url: string | null) => void;
  onPriority: (priority: Priority | null) => void;
  onClose: () => void;
}) {
  const [prUrl, setPrUrl] = useState(task.pr_url ?? "");
  const repeat = task.repetir ?? null;

  return (
    <div
      className="ml-6 flex flex-wrap items-center gap-2 rounded-lg border border-edge bg-ink/60 p-2 text-xs text-muted motion-safe:animate-aba"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <label className="flex items-center gap-1">
        {t("tasks.remindAt")}
        <input
          type="time"
          aria-label={t("tasks.reminderTime", { title: task.title })}
          value={task.hora ?? ""}
          onChange={(e) => onChange(e.target.value || null, repeat)}
          className="rounded border border-line bg-ink px-1 py-0.5 text-fg outline-none focus:border-accent"
        />
      </label>
      <RepeatControl task={task} onLegacy={(r) => onChange(task.hora ?? null, r)} onExtended={onExtendedRepeat} />
      <select
        aria-label={t("tasks.priorityOf", { title: task.title })}
        value={task.priority ?? ""}
        onChange={(e) => onPriority((e.target.value || null) as Priority | null)}
        className="rounded border border-line bg-ink px-1 py-0.5 text-fg outline-none focus:border-accent"
      >
        <option value="">{t("priority.none")}</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABEL[p]}
          </option>
        ))}
      </select>
      <label className="flex flex-1 items-center gap-1">
        {t("tasks.prLabel")}
        <input
          type="url"
          aria-label={t("tasks.prLink", { title: task.title })}
          value={prUrl}
          placeholder="https://..."
          onChange={(e) => setPrUrl(e.target.value)}
          onBlur={() => prUrl.trim() !== (task.pr_url ?? "") && onLinkPr(prUrl.trim() || null)}
          onKeyDown={(e) => e.key === "Enter" && onLinkPr(prUrl.trim() || null)}
          className="min-w-0 flex-1 rounded border border-line bg-ink px-1 py-0.5 text-fg outline-none focus:border-accent"
        />
      </label>
      <button type="button" onClick={onClose} className="ml-auto min-h-6 px-1 hover:text-fg">
        {t("tasks.close")}
      </button>
    </div>
  );
}

/** Time and ↻ visible on the row, plus the button that opens the details. */
export function TaskBadge({ task, open, onToggle }: { task: Task; open: boolean; onToggle: () => void }) {
  return (
    <>
      {task.priority && <span className={`size-2 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} title={t("priority.dot", { label: PRIORITY_LABEL[task.priority] })} />}
      {(task.hora || task.repetir || task.extended_repeat) && (
        <span
          className="shrink-0 text-[11px] text-muted"
          title={task.repetir ? REPEAT_LABEL[task.repetir.tipo] : task.extended_repeat ? extendedLabel(task.extended_repeat) : undefined}
        >
          {task.hora}
          {task.repetir && <span aria-label={t("repeat.repeats", { label: REPEAT_LABEL[task.repetir.tipo] })}> ↻</span>}
          {task.extended_repeat && <span aria-label={t("repeat.repeats", { label: extendedLabel(task.extended_repeat) })}> ↻</span>}
        </span>
      )}
      {task.subtasks && task.subtasks.length > 0 && (
        <span className="shrink-0 text-[11px] text-muted" title={t("tasks.subtasks")}>
          {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length}
        </span>
      )}
      {task.pr_url && (
        <button
          type="button"
          onClick={() => void api.openLink(task.pr_url!)}
          className="grid size-6 shrink-0 place-items-center rounded text-faint hover:text-fg"
          aria-label={t("tasks.openPrOf", { title: task.title })}
          title={t("tasks.openPr")}
        >
          <PullIcon />
        </button>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="grid size-6 shrink-0 place-items-center rounded text-faint opacity-0 hover:text-fg focus-visible:opacity-100 group-hover:opacity-100 aria-expanded:opacity-100"
        aria-label={t("tasks.scheduleOf", { title: task.title })}
        title={t("tasks.schedule")}
      >
        <ClockIcon />
      </button>
    </>
  );
}
