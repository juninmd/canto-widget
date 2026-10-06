import type { Task } from "../lib/api";
import { DEFAULT_TASK_MIN, firstFreeSlot, hhmm, type PlanBlock } from "../lib/dayPlan";
import { t } from "../i18n";

type Props = { tasks: Task[]; blocks: PlanBlock[]; nowMin: number; onSchedule: (task: Task, time: string) => void };

/** Open tasks with no time: one tap books each into the first free slot. */
export default function AgendaTray({ tasks, blocks, nowMin, onSchedule }: Props) {
  if (tasks.length === 0) return null;
  return (
    <section className="space-y-1">
      <p className="flex justify-between gap-2 text-[11px]">
        <span className="font-semibold text-muted">{t("plan.unscheduled")}</span>
        <span className="text-faint">{t("agenda.rail.trayHint")}</span>
      </p>
      <ul className="flex gap-1.5 overflow-x-auto pb-1">
        {tasks.map((task) => {
          const slot = firstFreeSlot(blocks, task.estimate_min ?? DEFAULT_TASK_MIN, nowMin);
          return (
            <li key={task.id} className="shrink-0">
              <button
                type="button"
                disabled={slot === null}
                onClick={() => slot !== null && onSchedule(task, hhmm(slot))}
                title={slot === null ? t("plan.noSlot") : t("plan.schedule", { title: task.title, time: hhmm(slot) })}
                className="canto-hit min-h-[24px] max-w-48 truncate rounded-md border border-line px-2 py-1 text-xs text-fg hover:border-accent disabled:opacity-50"
              >
                {task.title}
                {task.estimate_min ? <span className="ml-1 text-muted">· {t("plan.taskMin", { min: task.estimate_min })}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
