import { t } from "../i18n";
import type { Task } from "../lib/api";
import { clock, focusStore, isOver } from "../lib/focus";
import { PRIORITY_DOT, PRIORITY_LABEL } from "../lib/priority";
import { useRunning, useTick } from "../lib/useFocus";
import { PauseIcon, PlayIcon } from "./Icons";

/** Top of the list: what is running now, or the next open task with a one-click start. */
export default function TaskNow({ task }: { task: Task }) {
  const run = useRunning();
  const mine = run?.id === task.id;
  useTick(mine);
  const secs = mine ? focusStore.totalSecs() : (task.tracked_secs ?? 0);
  const est = task.estimate_min ?? null;
  const over = isOver(secs, est);
  const pct = est ? Math.min(100, (secs / (est * 60)) * 100) : 0;
  const label = t(mine ? "focus.pause" : "focus.start", { title: task.title });
  return (
    <section aria-label={t("tasks.now.label")} className={`rounded-xl border bg-panel p-3 ${mine ? "border-accent" : "border-edge"}`}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-faint">
        <span className="flex-1">{t(mine ? "tasks.now.running" : "tasks.now.next")}</span>
        {task.hora && <span className="tabular-nums normal-case tracking-normal">{task.hora}</span>}
        {task.priority && (
          <span className="flex items-center gap-1 normal-case tracking-normal">
            <span aria-hidden="true" className={`size-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
            {PRIORITY_LABEL[task.priority]}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-3">
        <p className="min-w-0 flex-1 text-sm font-semibold text-fg [overflow-wrap:anywhere]">{task.title}</p>
        <span role="timer" className={`font-mono text-lg tabular-nums ${over ? "text-danger" : mine ? "text-accent-text" : "text-muted"}`}>
          {clock(secs)}
        </span>
        <button
          type="button"
          aria-label={label}
          title={label}
          onClick={() =>
            void (mine
              ? focusStore.stop()
              : focusStore.start({ id: task.id, title: task.title, estimateMin: est, trackedSecs: task.tracked_secs }))
          }
          className="canto-hit grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-on-accent hover:brightness-110"
        >
          {mine ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      {est && (
        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-edge" role="presentation">
            <div className={`h-full rounded-full ${over ? "bg-danger" : "bg-accent"}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="tabular-nums">{t("tasks.now.estimate", { est })}</span>
        </div>
      )}
    </section>
  );
}
