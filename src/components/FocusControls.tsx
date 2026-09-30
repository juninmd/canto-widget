import { t } from "../i18n";
import type { Task } from "../lib/api";
import { focusStore, isOver, minutesOf } from "../lib/focus";
import { useRunning, useTick } from "../lib/useFocus";
import { PauseIcon, PlayIcon } from "./Icons";

/** Start or pause the timer on a row; the row (`relative`, `group`) reveals it on hover or focus. */
export function FocusButton({ task }: { task: Task }) {
  const mine = useRunning()?.id === task.id;
  if (task.done && !mine) return null;
  const label = t(mine ? "focus.pause" : "focus.start", { title: task.title });
  return (
    <button
      type="button"
      onClick={() =>
        void (mine
          ? focusStore.stop()
          : focusStore.start({ id: task.id, title: task.title, estimateMin: task.estimate_min, trackedSecs: task.tracked_secs }))
      }
      aria-label={label}
      aria-pressed={mine}
      title={label}
      // Floats over the row's right edge instead of taking a slot: at the minimum width a fifth button costs the title 30px.
      className={`absolute right-[6.75rem] top-1 grid size-6 place-items-center rounded bg-panel opacity-0 hover:text-fg focus-visible:opacity-100 group-hover:opacity-100 ${
        mine ? "text-accent" : "text-faint"
      }`}
    >
      {mine ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}

/** "12/45 min" under the title: red past the estimate, live while this task runs. */
export function FocusBadge({ task }: { task: Task }) {
  const mine = useRunning()?.id === task.id;
  useTick(mine);
  const secs = mine ? focusStore.totalSecs() : (task.tracked_secs ?? 0);
  const est = task.estimate_min ?? null;
  if (!est && secs < 60 && !mine) return null;
  const over = isOver(secs, est);
  const spent = minutesOf(secs);
  return (
    <span
      className={`shrink-0 text-[11px] ${over ? "text-danger" : mine ? "text-accent" : "text-muted"}`}
      title={over ? t("focus.over") : undefined}
    >
      {est ? t("focus.tracked", { spent, est }) : t("focus.trackedOnly", { spent })}
    </span>
  );
}
