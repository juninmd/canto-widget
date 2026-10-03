import { t } from "../i18n";
import type { Task } from "../lib/api";
import { focusStore, isOver, minutesOf } from "../lib/focus";
import { useRunning, useTick } from "../lib/useFocus";
import { PauseIcon, PlayIcon } from "./Icons";
import { CHIP } from "./chip";

/** Start or pause the timer on a row; the row's action bar reveals it on hover or focus. */
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
      className={`canto-hit grid size-6 place-items-center rounded-md hover:bg-hover hover:text-fg active:bg-active ${mine ? "text-accent-text" : "text-faint"}`}
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
      className={`${CHIP} tabular-nums ${over ? "!text-danger" : mine ? "!text-accent-text" : ""}`}
      title={over ? t("focus.over") : undefined}
    >
      {est ? t("focus.tracked", { spent, est }) : t("focus.trackedOnly", { spent })}
    </span>
  );
}
