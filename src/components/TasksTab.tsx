import { t } from "../i18n";
import { useEffect, useRef, useState } from "react";
import { api, errText, type AgendaItem, type Priority, type Task } from "../lib/api";
import { parseQuickTask } from "../lib/quickAdd";
import DaySummary from "./DaySummary";
import TaskRow from "./TaskRow";
import TaskListHeader from "./TaskListHeader";
import { useUndo } from "../lib/useUndo";
import { useNewIds, useExit } from "../lib/motion";
import { mergeOrder, useReorder } from "../lib/useReorder";

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
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");

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
    void api.badgeSetTasks(tasks.filter((task) => !task.done).length).catch(() => {});
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
    tasks.map((task) => task.id),
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
    if (!target.title.trim() || target.title === tasks.find((task) => task.id === target.id)?.title) return;
    await run(() => api.taskRename(target.id, target.title));
  }

  const done = tasks.filter((task) => task.done).length;
  const visible = priorityFilter ? tasks.filter((task) => task.priority === priorityFilter) : tasks;

  // A filtered view reorders its own rows; hidden tasks keep their slots in the day's order.
  const reorder = useReorder(
    visible.map((task) => task.id),
    (visibleIds) => {
      const ids = mergeOrder(
        tasks.map((task) => task.id),
        visibleIds,
      );
      const byId = new Map(tasks.map((task) => [task.id, task]));
      setTasks(ids.flatMap((id) => byId.get(id) ?? []));
      void run(() => api.tasksReorder(today, ids));
    },
  );

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
          placeholder={t("tasks.addPlaceholder")}
          className="flex-1 rounded-lg border border-line bg-ink px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
        />
        <button type="submit" aria-label={t("tasks.add")} className="rounded-lg bg-edge px-3 text-sm text-fg">
          +
        </button>
      </form>

      <TaskListHeader
        done={done}
        total={tasks.length}
        priorityFilter={priorityFilter}
        onPriorityFilter={setPriorityFilter}
        onSummary={() => setSummary(true)}
        onCarryOver={() => void run(() => api.carryOver(today))}
      />

      <ul className={`flex-1 space-y-1 overflow-y-auto pr-1 ${reorder.dragging ? "cursor-grabbing select-none" : ""}`}>
        {visible.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            isNew={isNew(task.id)}
            isLeaving={leaving.has(task.id)}
            checking={checking === task.id}
            editing={editing}
            detailsOpen={details === task.id}
            draggable
            dragging={reorder.dragging === task.id}
            dropTarget={reorder.dragging !== null && reorder.over === task.id && reorder.dragging !== task.id}
            onDragStart={() => reorder.start(task.id)}
            onDragHover={() => reorder.hover(task.id)}
            onMove={(delta) => reorder.step(task.id, delta)}
            onToggleDone={() => {
              setChecking(task.id);
              void run(() => api.taskToggle(task.id));
            }}
            onCheckAnimationEnd={() => setChecking("")}
            onStartEdit={() => {
              editEnded.current = false;
              setEditing({ id: task.id, title: task.title });
            }}
            onEditChange={(value) => setEditing({ id: task.id, title: value })}
            onEditCommit={() => void rename()}
            onEditCancel={() => {
              editEnded.current = true;
              setEditing(null);
            }}
            onDelete={() =>
              void leave(task.id, () => run(async () => undoable(await api.itemDelete(task.id), t("tasks.deleted", { title: task.title }))))
            }
            onToggleDetails={() => setDetails(details === task.id ? "" : task.id)}
            onSchedule={(time, repeat) => void run(() => api.taskSetSchedule(task.id, time, repeat))}
            onExtendedRepeat={(repeat) => void run(() => api.taskSetExtendedRepeat(task.id, repeat))}
            onLinkPr={(url) => void run(() => api.taskLinkPr(task.id, url))}
            onPriority={(priority) => void run(() => api.taskSetPriority(task.id, priority))}
            onSubtasksChange={reload}
            onError={onError}
          />
        ))}
        {tasks.length === 0 && (
          <li className="px-2 py-6 text-center text-xs text-faint">{t("tasks.empty")}</li>
        )}
        {tasks.length > 0 && visible.length === 0 && (
          <li className="px-2 py-6 text-center text-xs text-faint">{t("tasks.emptyPriority")}</li>
        )}
      </ul>
    </div>
  );
}
