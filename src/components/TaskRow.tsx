import { t } from "../i18n";
import type { ExtendedRepeat, Priority, Repeat, Task } from "../lib/api";
import TaskDetails, { TaskBadge, TaskMeta } from "./TaskDetails";
import TaskSubtasks from "./TaskSubtasks";
import { GripIcon } from "./Icons";
import { FocusButton } from "./FocusControls";
import { ENTER_CLASS, EXIT_CLASS } from "../lib/motion";
import { PRIORITY_DOT } from "../lib/priority";

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
  onEstimate: (minutes: number | null) => void;
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
  onEstimate,
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
        className={`group relative flex items-start gap-3 rounded-xl py-2 pl-7 pr-2.5 hover:bg-hover focus-within:bg-hover ${isNew ? ENTER_CLASS : ""} ${
          isLeaving ? EXIT_CLASS : ""
        } ${dragging ? "opacity-50" : ""} ${dropTarget ? "ring-1 ring-accent" : ""}`}
      >
        {task.priority && (
          <span aria-hidden="true" className={`canto-rail absolute inset-y-2.5 left-0 w-0.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
        )}
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
            className="canto-hit absolute left-0 top-2 grid size-6 cursor-grab touch-none place-items-center text-faint opacity-0 hover:text-fg focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <GripIcon />
          </button>
        )}
        {/* The label is the 24 px target (WCAG 2.5.8) around the 20 px circle; the title names the checkbox for screen readers. */}
        <label className="canto-hit -m-[2px] mt-0 grid size-[24px] shrink-0 cursor-pointer place-items-center">
          <input
            type="checkbox"
            checked={task.done}
            aria-label={task.title}
            onChange={onToggleDone}
            onAnimationEnd={onCheckAnimationEnd}
            className={`canto-check ${checking ? "motion-safe:animate-marcar" : ""}`}
          />
        </label>
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
          <span className="flex min-w-0 flex-1 flex-col">
            <span
              className={`whitespace-pre-wrap break-words text-sm leading-snug ${task.done ? "text-faint line-through" : "text-fg"}`}
              title={t("tasks.renameHint", { title: task.title })}
              onDoubleClick={onStartEdit}
            >
              {task.title}
            </span>
            <TaskMeta task={task} />
          </span>
        )}
        {/* Floats over the right edge, so the title keeps the whole line until the pointer or focus arrives. */}
        <span
          className={`canto-raised absolute right-1.5 top-1.5 flex items-center rounded-lg bg-raised p-0.5 shadow-[var(--shadow-raised)] focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${
            detailsOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          <FocusButton task={task} />
          <TaskBadge task={task} open={detailsOpen} onToggle={onToggleDetails} onPriority={onPriority} />
          <button
            type="button"
            onClick={onDelete}
            className="canto-hit grid size-6 shrink-0 place-items-center rounded-md text-faint hover:bg-hover hover:text-danger active:bg-active"
            aria-label={t("tasks.delete", { title: task.title })}
          >
            ×
          </button>
        </span>
      </li>
      {detailsOpen && (
        <li className="flex flex-col gap-1">
          <TaskDetails
            task={task}
            onChange={onSchedule}
            onExtendedRepeat={onExtendedRepeat}
            onLinkPr={onLinkPr}
            onPriority={onPriority}
            onEstimate={onEstimate}
            onClose={onToggleDetails}
          />
          <TaskSubtasks taskId={task.id} subtasks={task.subtasks ?? []} onError={onError} onChange={onSubtasksChange} />
        </li>
      )}
    </>
  );
}
