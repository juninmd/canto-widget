import { useState } from "react";
import { api, errText, type Subtask } from "../lib/api";

type Props = { taskId: string; subtasks: Subtask[]; onError: (m: string) => void; onChange: () => void };

/** Checklist under a task. Each change saves immediately, same as the schedule fields. */
export default function TaskSubtasks({ taskId, subtasks, onError, onChange }: Props) {
  const [title, setTitle] = useState("");

  async function run(fn: () => Promise<unknown>) {
    try {
      await fn();
      onChange();
    } catch (e) {
      onError(errText(e));
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const value = title;
    setTitle("");
    await run(() => api.subtaskAdd(taskId, value));
  }

  const done = subtasks.filter((s) => s.done).length;

  return (
    <div className="ml-6 flex flex-col gap-1.5 rounded-lg border border-edge bg-ink/60 p-2 text-xs text-muted motion-safe:animate-aba">
      {subtasks.length > 0 && (
        <span className="text-[11px] text-faint">
          {done}/{subtasks.length} subtarefas
        </span>
      )}
      <ul className="flex flex-col gap-1">
        {subtasks.map((s) => (
          <li key={s.id} className="group flex items-center gap-2">
            <input
              type="checkbox"
              checked={s.done}
              aria-label={s.title}
              onChange={() => void run(() => api.subtaskToggle(taskId, s.id))}
              className="size-3.5 shrink-0 accent-[var(--color-accent)]"
            />
            <span className={`flex-1 truncate ${s.done ? "text-faint line-through" : "text-fg"}`}>{s.title}</span>
            <button
              type="button"
              onClick={() => void run(() => api.subtaskRemove(taskId, s.id))}
              className="grid size-5 shrink-0 place-items-center rounded text-faint opacity-0 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
              aria-label={`excluir subtarefa ${s.title}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex gap-1">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="nova subtarefa"
          aria-label="nova subtarefa"
          className="flex-1 rounded border border-line bg-ink px-1.5 py-0.5 text-fg outline-none focus:border-accent"
        />
        <button type="submit" aria-label="adicionar subtarefa" className="rounded bg-edge px-2 text-fg">
          +
        </button>
      </form>
    </div>
  );
}
