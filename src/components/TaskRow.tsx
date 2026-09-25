import { t } from "../i18n";
import type { ExtendedRepeat, Priority, Repeat, Task } from "../lib/api";
import TaskDetails, { TaskBadge } from "./TaskDetails";
import TaskSubtasks from "./TaskSubtasks";
import { GripIcon } from "./Icons";
import { ENTER_CLASS, EXIT_CLASS } from "../lib/motion";

type Editing = { id: string; title: string } | null;

type Props = {
  task: Task;
  isNew: boolean;
  isLeaving: boolean;
  checking: boolean;
  editing: Editing;
  detailsOpen: boolean;
  draggable: boolean;
  onToggleDone: () => void;
  onCheckAnimationEnd: () => void;
  onStartEdit: () => void;
  onEditChange: (title: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
  onToggleDetails: () => void;
  onSchedule: (time: string | null, repeat: Repeat | null) => void;
  onExtendedRepeat: (repeat: ExtendedRepeat | null) => void;
  onLinkPr: (url: string | null) => void;
  onPriority: (priority: Priority | null) => void;
  onSubtasksChange: () => void;
  onError: (m: string) => void;
  dragging: boolean;
  dropTarget: boolean;
  onDragStart: () => void;
  onDragHover: () => void;
  onMove: (delta: -1 | 1) => void;
};

/** One task line, plus its expandable schedule/PR/checklist panel. */
export default function TaskRow({
  task,
  isNew,
  isLeaving,
  checking,
  editing,
  detailsOpen,
  draggable,
  onToggleDone,
  onCheckAnimationEnd,
  onStartEdit,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onDelete,
  onToggleDetails,
  onSchedule,
  onExtendedRepeat,
  onLinkPr,
  onPriority,
  onSubtasksChange,
  onError,
  dragging,
  dropTarget,
  onDragStart,
  onDragHover,
  onMove,
}: Props) {
  return (
    <>
      <li
        data-reorder-id={draggable ? task.id : undefined}
        onPointerEnter={draggable ? onDragHover : undefined}
        onPointerMove={draggable ? onDragHover : undefined}
        className={`group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-edge/50 ${isNew ? ENTER_CLASS : ""} ${
          isLeaving ? EXIT_CLASS : ""
        } ${dragging ? "opacity-50" : ""} ${dropTarget ? "ring-1 ring-accent" : ""}`}
      >
        {draggable && (
          <button
            type="button"
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              onDragStart();
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
                onMove(e.key === "ArrowUp" ? -1 : 1);
              }
            }}
            aria-label={t("tasks.dragLabel", { title: task.title })}
            title={t("tasks.dragHint")}
            className="grid size-4 shrink-0 cursor-grab touch-none place-items-center text-faint opacity-0 hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
          >
            <GripIcon />
          </button>
        )}
        <input
          type="checkbox"
          checked={task.done}
          onChange={onToggleDone}
          onAnimationEnd={onCheckAnimationEnd}
          className={`size-4 accent-[var(--color-accent)] ${checking ? "motion-safe:animate-marcar" : ""}`}
        />
        {editing?.id === task.id ? (
          <input
            autoFocus
            value={editing.title}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={onEditCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditCommit();
              if (e.key === "Escape") onEditCancel();
            }}
            className="flex-1 rounded border border-accent bg-ink px-1 py-0.5 text-sm text-fg outline-none"
          />
        ) : (
          <span
            className={`flex-1 truncate text-sm ${task.done ? "text-faint line-through" : "text-fg"}`}
            title={t("tasks.renameHint", { title: task.title })}
            onDoubleClick={onStartEdit}
          >
            {task.title}
          </span>
        )}
        <TaskBadge task={task} open={detailsOpen} onToggle={onToggleDetails} />
        <button
          type="button"
          onClick={onDelete}
          // Also visible on focus: hover-only would leave the keyboard user unable to find it.
          className="grid size-6 shrink-0 place-items-center rounded text-faint opacity-0 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
          aria-label={t("tasks.delete", { title: task.title })}
        >
          ×
        </button>
      </li>
      {detailsOpen && (
        <li className="flex flex-col gap-1">
          <TaskDetails
            task={task}
            onChange={onSchedule}
            onExtendedRepeat={onExtendedRepeat}
            onLinkPr={onLinkPr}
            onPriority={onPriority}
            onClose={onToggleDetails}
          />
          <TaskSubtasks taskId={task.id} subtasks={task.subtasks ?? []} onError={onError} onChange={onSubtasksChange} />
        </li>
      )}
    </>
  );
}
