import type { Priority, Repeat, Task } from "../lib/api";
import TaskDetails, { TaskBadge } from "./TaskDetails";
import TaskSubtasks from "./TaskSubtasks";
import { ENTER_CLASS, EXIT_CLASS } from "../lib/motion";

type Editing = { id: string; title: string } | null;

type Props = {
  task: Task;
  isNew: boolean;
  isLeaving: boolean;
  checking: boolean;
  editing: Editing;
  detailsOpen: boolean;
  onToggleDone: () => void;
  onCheckAnimationEnd: () => void;
  onStartEdit: () => void;
  onEditChange: (title: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
  onToggleDetails: () => void;
  onSchedule: (time: string | null, repeat: Repeat | null) => void;
  onLinkPr: (url: string | null) => void;
  onPriority: (priority: Priority | null) => void;
  onSubtasksChange: () => void;
  onError: (m: string) => void;
};

/** One task line, plus its expandable schedule/PR/checklist panel. */
export default function TaskRow({
  task: t,
  isNew,
  isLeaving,
  checking,
  editing,
  detailsOpen,
  onToggleDone,
  onCheckAnimationEnd,
  onStartEdit,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onDelete,
  onToggleDetails,
  onSchedule,
  onLinkPr,
  onPriority,
  onSubtasksChange,
  onError,
}: Props) {
  return (
    <>
      <li
        className={`group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-edge/50 ${isNew ? ENTER_CLASS : ""} ${
          isLeaving ? EXIT_CLASS : ""
        }`}
      >
        <input
          type="checkbox"
          checked={t.done}
          onChange={onToggleDone}
          onAnimationEnd={onCheckAnimationEnd}
          className={`size-4 accent-[var(--color-accent)] ${checking ? "motion-safe:animate-marcar" : ""}`}
        />
        {editing?.id === t.id ? (
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
            className={`flex-1 truncate text-sm ${t.done ? "text-faint line-through" : "text-fg"}`}
            title={`${t.title}\n(clique duas vezes para renomear)`}
            onDoubleClick={onStartEdit}
          >
            {t.title}
          </span>
        )}
        <TaskBadge task={t} open={detailsOpen} onToggle={onToggleDetails} />
        <button
          type="button"
          onClick={onDelete}
          // Also visible on focus: hover-only would leave the keyboard user unable to find it.
          className="grid size-6 shrink-0 place-items-center rounded text-faint opacity-0 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
          aria-label={`excluir ${t.title}`}
        >
          ×
        </button>
      </li>
      {detailsOpen && (
        <li className="flex flex-col gap-1">
          <TaskDetails task={t} onChange={onSchedule} onLinkPr={onLinkPr} onPriority={onPriority} onClose={onToggleDetails} />
          <TaskSubtasks taskId={t.id} subtasks={t.subtasks ?? []} onError={onError} onChange={onSubtasksChange} />
        </li>
      )}
    </>
  );
}
