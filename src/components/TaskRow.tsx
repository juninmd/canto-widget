import { t } from "../i18n";
import type { ExtendedRepeat, Priority, Repeat, Task, TaskContext } from "../lib/api";
import TaskDetails, { TaskBadge, TaskMeta } from "./TaskDetails";
import TaskSubtasks from "./TaskSubtasks";
import { CrossIcon, GripIcon } from "./Icons";
import { FocusButton } from "./FocusControls";
import { ENTER_CLASS, EXIT_CLASS } from "../lib/motion";
import { PRIORITY_DOT } from "../lib/priority";

const MAX_TITLE = 300;
const TEXT_FIELDS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

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
  onContext: (context: TaskContext | null) => void;
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
  onContext,
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
        // Renaming and deleting also work from the keyboard, as in file managers: F2 renames, Delete removes (with undo).
        onKeyDown={(e) => {
          if (e.key === "F2" && editing?.id !== task.id) {
            e.preventDefault();
            onStartEdit();
          }
          const el = e.target as HTMLElement;
          const typing = TEXT_FIELDS.has(el.tagName) && (el as HTMLInputElement).type !== "checkbox";
          if ((e.key === "Delete" || e.key === "Backspace") && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            onDelete();
          }
          // Alt+↑/↓ moves the task from anywhere in the row; the grip already handles its own arrows (defaultPrevented).
          const arrow = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
          if (draggable && arrow && e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && !typing && !e.defaultPrevented) {
            e.preventDefault();
            onMove(arrow);
          }
        }}
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
            maxLength={MAX_TITLE}
            aria-label={t("tasks.renameLabel", { title: task.title })}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={onEditCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditCommit();
              if (e.key === "Escape") onEditCancel();
            }}
            className="flex-1 rounded border border-accent bg-ink px-1 py-0.5 text-sm text-fg outline-none"
          />
        ) : (
          <span className="flex min-w-0 flex-1 flex-col pr-20">
            <span
              data-fresh={checking && task.done ? "" : undefined}
              className={`whitespace-pre-wrap break-words text-sm leading-snug ${task.done ? "canto-strike text-faint line-through" : "text-fg"}`}
              title={t("tasks.renameHint", { title: task.title })}
              onDoubleClick={onStartEdit}
            >
              {task.title}
            </span>
            <TaskMeta task={task} />
          </span>
        )}
        {/* Floats over the right edge; the title reserves that strip (pr-20) so long text never runs under it. */}
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
            <CrossIcon />
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
            onContext={onContext}
            onClose={onToggleDetails}
          />
          <TaskSubtasks taskId={task.id} subtasks={task.subtasks ?? []} onError={onError} onChange={onSubtasksChange} />
        </li>
      )}
    </>
  );
}
