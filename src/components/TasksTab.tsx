import { useEffect, useRef, useState } from "react";
import { api, errText, type AgendaItem, type Task } from "../lib/api";
import { parseQuickTask } from "../lib/quickAdd";
import DaySummary from "./DaySummary";
import TaskRow from "./TaskRow";
import { useUndo } from "../lib/useUndo";
import { useNewIds, useExit } from "../lib/motion";

type Props = { today: string; version?: number; agenda?: AgendaItem[]; onError: (m: string) => void };

export default function TasksTab({ today, version, agenda = [], onError }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [editing, setEditing] = useState<{ id: string; title: string } | null>(null);
  // Ending the edit unmounts the still-focused input, and the webview fires a
  // blur on it with the previous render's closure. Without this guard, Esc would save
  // the discarded text and Enter would write to the vault twice.
  const editEnded = useRef(false);

  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [checking, setChecking] = useState("");
  const { leaving, leave } = useExit();
  const [details, setDetails] = useState("");
  const [summary, setSummary] = useState(false);

  async function reload() {
    try {
      setTasks(await api.tasksForDay(today));
      setLoadedFor(today);
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today, version]);

  // Only this tab knows "today" correctly; the tray badge just reflects whatever it last pushed.
  useEffect(() => {
    if (loadedFor !== today) return;
    void api.badgeSetTasks(tasks.filter((t) => !t.done).length).catch(() => {});
  }, [tasks, loadedFor, today]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const quick = parseQuickTask(title);
      const created = await api.taskAdd(quick.title, today);
      if (quick.time) await api.taskSetSchedule(created.id, quick.time, null);
      setTitle("");
      await reload();
    } catch (e) {
      onError(errText(e));
    }
  }

  const undoable = useUndo(onError, reload);
  const isNew = useNewIds(
    tasks.map((t) => t.id),
    loadedFor,
  );

  async function run(fn: () => Promise<unknown>) {
    try {
      await fn();
      await reload();
    } catch (e) {
      onError(errText(e));
    }
  }

  async function rename() {
    if (editEnded.current || !editing) return;
    editEnded.current = true;
    const target = editing;
    setEditing(null);
    if (!target.title.trim() || target.title === tasks.find((t) => t.id === target.id)?.title) return;
    await run(() => api.taskRename(target.id, target.title));
  }

  const done = tasks.filter((t) => t.done).length;

  if (summary) {
    return <DaySummary day={today} tasks={tasks} agenda={agenda} onClose={() => setSummary(false)} onError={onError} />;
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <form onSubmit={add} className="flex gap-2">
        <input
          value={title}
          data-shortcut="new"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="nova tarefa (ex.: Daily às 9h30)"
          className="flex-1 rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
        />
        <button type="submit" aria-label="adicionar tarefa" className="rounded-lg bg-edge px-3 text-sm text-fg">
          +
        </button>
      </form>

      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>
          {done}/{tasks.length} concluídas
        </span>
        <span className="flex gap-3">
          <button
            type="button"
            onClick={() => setSummary(true)}
            title="texto com o que foi feito, o que ficou e as reuniões, pronto para copiar"
            className="min-h-6 underline decoration-dotted hover:text-fg"
          >
            resumo do dia
          </button>
          <button
            type="button"
            onClick={() => run(() => api.carryOver(today))}
            title="traz para hoje as tarefas não concluídas dos dias anteriores"
            className="min-h-6 underline decoration-dotted hover:text-fg"
          >
            puxar pendências
          </button>
        </span>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto pr-1">
        {tasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            isNew={isNew(t.id)}
            isLeaving={leaving.has(t.id)}
            checking={checking === t.id}
            editing={editing}
            detailsOpen={details === t.id}
            onToggleDone={() => {
              setChecking(t.id);
              void run(() => api.taskToggle(t.id));
            }}
            onCheckAnimationEnd={() => setChecking("")}
            onStartEdit={() => {
              editEnded.current = false;
              setEditing({ id: t.id, title: t.title });
            }}
            onEditChange={(value) => setEditing({ id: t.id, title: value })}
            onEditCommit={() => void rename()}
            onEditCancel={() => {
              editEnded.current = true;
              setEditing(null);
            }}
            onDelete={() =>
              void leave(t.id, () => run(async () => undoable(await api.itemDelete(t.id), `tarefa "${t.title}" excluída`)))
            }
            onToggleDetails={() => setDetails(details === t.id ? "" : t.id)}
            onSchedule={(time, repeat) => void run(() => api.taskSetSchedule(t.id, time, repeat))}
            onLinkPr={(url) => void run(() => api.taskLinkPr(t.id, url))}
            onSubtasksChange={reload}
            onError={onError}
          />
        ))}
        {tasks.length === 0 && (
          <li className="px-2 py-6 text-center text-xs text-faint">nada para hoje ainda — escreva acima e tecle Enter</li>
        )}
      </ul>
    </div>
  );
}
