import { useEffect, useState } from "react";
import { api, errText, type Task } from "../lib/api";

export default function TasksTab({ today, onError }: { today: string; onError: (m: string) => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  async function reload() {
    try {
      setTasks(await api.tasksForDay(today));
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await api.taskAdd(title, today);
      setTitle("");
      await reload();
    } catch (e) {
      onError(errText(e));
    }
  }

  async function run(fn: () => Promise<unknown>) {
    try {
      await fn();
      await reload();
    } catch (e) {
      onError(errText(e));
    }
  }

  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="flex h-full flex-col gap-2">
      <form onSubmit={add} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="nova tarefa de hoje"
          className="flex-1 rounded-lg border border-edge bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
        />
        <button type="submit" className="rounded-lg bg-edge px-3 text-sm text-fg">
          +
        </button>
      </form>

      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>
          {done}/{tasks.length} concluidas
        </span>
        <button
          type="button"
          onClick={() => run(() => api.carryOver(today))}
          className="underline decoration-dotted hover:text-fg"
        >
          puxar pendencias
        </button>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto pr-1">
        {tasks.map((t) => (
          <li key={t.id} className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-edge/50">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => run(() => api.taskToggle(t.id))}
              className="size-4 accent-[var(--color-accent)]"
            />
            <span
              className={`flex-1 truncate text-sm ${t.done ? "text-faint line-through" : "text-fg"}`}
              title={t.title}
            >
              {t.title}
            </span>
            <button
              type="button"
              onClick={() => run(() => api.itemDelete(t.id))}
              className="hidden text-xs text-faint hover:text-danger group-hover:block"
              aria-label={`excluir ${t.title}`}
            >
              x
            </button>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="px-2 py-6 text-center text-xs text-faint">nada para hoje ainda</li>
        )}
      </ul>
    </div>
  );
}
