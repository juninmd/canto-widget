import { useEffect, useRef, useState } from "react";
import { api, errText, type Task } from "../lib/api";

export default function TasksTab({ today, onError }: { today: string; onError: (m: string) => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [editando, setEditando] = useState<{ id: string; title: string } | null>(null);
  // Encerrar a edicao desmonta o input ainda focado, e o webview dispara um
  // blur nele com a closure do render anterior. Sem esta trava, Esc salvaria o
  // texto descartado e Enter gravaria o cofre duas vezes.
  const edicaoEncerrada = useRef(false);

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

  async function renomear() {
    if (edicaoEncerrada.current || !editando) return;
    edicaoEncerrada.current = true;
    const alvo = editando;
    setEditando(null);
    if (!alvo.title.trim() || alvo.title === tasks.find((t) => t.id === alvo.id)?.title) return;
    await run(() => api.taskRename(alvo.id, alvo.title));
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
            {editando?.id === t.id ? (
              <input
                autoFocus
                value={editando.title}
                onChange={(e) => setEditando({ id: t.id, title: e.target.value })}
                onBlur={() => void renomear()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void renomear();
                  if (e.key === "Escape") {
                    edicaoEncerrada.current = true;
                    setEditando(null);
                  }
                }}
                className="flex-1 rounded border border-accent bg-ink px-1 py-0.5 text-sm text-fg outline-none"
              />
            ) : (
              <span
                className={`flex-1 truncate text-sm ${t.done ? "text-faint line-through" : "text-fg"}`}
                title={`${t.title}\n(clique duas vezes para renomear)`}
                onDoubleClick={() => {
                  edicaoEncerrada.current = false;
                  setEditando({ id: t.id, title: t.title });
                }}
              >
                {t.title}
              </span>
            )}
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
