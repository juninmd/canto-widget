import { t } from "../i18n";
import { useEffect, useRef, useState } from "react";
import { api, errText, type AgendaItem, type Priority, type Task } from "../lib/api";
import SummaryPanel from "./SummaryPanel";
import TaskRow from "./TaskRow";
import TaskNow from "./TaskNow";
import { pickNow } from "../lib/nowTask";
import { useRunning } from "../lib/useFocus";
import TaskListHeader from "./TaskListHeader";
import { useUndo } from "../lib/useUndo";
import { useLatestRequest } from "../lib/useLatestRequest";
import { useNewIds, useExit } from "../lib/motion";
import { mergeOrder, useReorder } from "../lib/useReorder";
import { focusStore } from "../lib/focus";
import EmptyState from "./EmptyState";
import Skeleton from "./Skeleton";
import TaskAddForm from "./TaskAddForm";
import { useTaskBulk } from "../lib/useTaskBulk";
import { ChecklistIcon } from "./Icons";
import TaskDoneHeader from "./TaskDoneHeader";

type Props = { today: string; version?: number; agenda?: AgendaItem[]; onError: (m: string) => void };

/** After a delete the focused row is gone; focus goes to the next row (or the add field) instead of falling to <body>. */
function refocusAfterDelete(list: HTMLElement | null, neighborId: string | undefined) {
  if (document.activeElement && document.activeElement !== document.body) return;
  const target = neighborId
    ? list?.querySelector<HTMLElement>(`[data-reorder-id="${neighborId}"] input[type="checkbox"]`)
    : document.querySelector<HTMLElement>('[data-shortcut="new"]');
  target?.focus();
}

export default function TasksTab({ today, version, agenda = [], onError }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editing, setEditing] = useState<{ id: string; title: string } | null>(null);
  // Ending the edit unmounts the still-focused input, and the webview fires a
  // blur on it with the previous render's closure. Without this guard, Esc would save
  // the discarded text and Enter would write to the vault twice.
  const editEnded = useRef(false);

  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [checking, setChecking] = useState("");
  const { leaving, leave } = useExit();
  const { bump, isLatest } = useLatestRequest();
  const listRef = useRef<HTMLUListElement>(null);
  const [details, setDetails] = useState("");
  const [summary, setSummary] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");
  // Finished tasks fold away by default: they are history, and the count in the header says how many there are.
  const [doneOpen, setDoneOpen] = useState(false);

  async function reload() {
    const id = bump();
    try {
      const list = await api.tasksForDay(today);
      if (!isLatest(id)) return;
      setTasks(list);
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
    if (!target.title.trim()) return onError(t("tasks.renameEmpty"));
    if (target.title === tasks.find((task) => task.id === target.id)?.title) return;
    await run(() => api.taskRename(target.id, target.title));
  }

  const runningId = useRunning()?.id ?? null;
  const now = pickNow(tasks, runningId);
  const doneIds = tasks.filter((task) => task.done).map((task) => task.id);
  const done = doneIds.length;
  const bulk = useTaskBulk(today, doneIds, reload, onError);
  const visible = priorityFilter ? tasks.filter((task) => task.priority === priorityFilter) : tasks;
  const openRows = visible.filter((task) => !task.done);
  const doneRows = visible.filter((task) => task.done);
  const shown = doneOpen ? [...openRows, ...doneRows] : openRows;

  // A filtered view reorders its own rows; hidden tasks keep their slots in the day's order.
  const reorder = useReorder(
    shown.map((task) => task.id),
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
    return (
      <SummaryPanel today={today} tasks={tasks} agenda={agenda} onClose={() => setSummary(false)} onError={onError} />
    );
  }

  const renderRow = (task: Task) => (
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
        if (!task.done && focusStore.get()?.id === task.id) void focusStore.stop();
        setChecking(task.id);
        // The row folds into the collapsed "Concluídas" group, so focus would otherwise fall to <body>.
        const neighbor = !task.done && !doneOpen ? (shown[shown.indexOf(task) + 1] ?? shown[shown.indexOf(task) - 1]) : undefined;
        void run(() => api.taskToggle(task.id)).then(() => {
          if (!task.done && !doneOpen) setTimeout(() => refocusAfterDelete(listRef.current, neighbor?.id), 0);
        });
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
      onDelete={() => {
        if (focusStore.get()?.id === task.id) focusStore.discard();
        const neighbor = shown[shown.indexOf(task) + 1] ?? shown[shown.indexOf(task) - 1];
        void leave(task.id, () => run(async () => undoable(await api.itemDelete(task.id), t("tasks.deleted", { title: task.title })))).then(
          () => setTimeout(() => refocusAfterDelete(listRef.current, neighbor?.id), 0),
        );
      }}
      onToggleDetails={() => setDetails(details === task.id ? "" : task.id)}
      onSchedule={(time, repeat) => void run(() => api.taskSetSchedule(task.id, time, repeat))}
      onExtendedRepeat={(repeat) => void run(() => api.taskSetExtendedRepeat(task.id, repeat))}
      onLinkPr={(url) => void run(() => api.taskLinkPr(task.id, url))}
      onPriority={(priority) => void run(() => api.taskSetPriority(task.id, priority))}
      onEstimate={(minutes) => {
        focusStore.setEstimate(task.id, minutes);
        void run(() => api.taskSetEstimate(task.id, minutes));
      }}
      onSubtasksChange={reload}
      onError={onError}
    />
  );

  return (
    <div className="flex h-full flex-col gap-2">
      <TaskAddForm today={today} reload={reload} onError={onError} />

      {now && !priorityFilter && <TaskNow task={now} />}

      <TaskListHeader
        done={done}
        total={tasks.length}
        priorityFilter={priorityFilter}
        onPriorityFilter={setPriorityFilter}
        onSummary={() => setSummary(true)}
        onCarryOver={() => void bulk.carryOver()}
        onClearDone={() => void bulk.clearDone()}
      />

      <ul ref={listRef} className={`flex-1 space-y-0.5 overflow-y-auto pr-1 ${reorder.dragging ? "cursor-grabbing select-none" : ""}`}>
        {openRows.length > 0 && (
          <li aria-hidden="true" className="px-1 pb-0.5 pt-1.5 text-[11px] uppercase tracking-wider text-faint">
            {t("tasks.group.open", { n: openRows.length })}
          </li>
        )}
        {openRows.map(renderRow)}
        {doneRows.length > 0 && <TaskDoneHeader n={doneRows.length} open={doneOpen} onToggle={() => setDoneOpen(!doneOpen)} />}
        {doneOpen && doneRows.map(renderRow)}
        {tasks.length === 0 && loadedFor !== today && (
          <li>
            <Skeleton label={t("tasks.loading")} />
          </li>
        )}
        {tasks.length === 0 && loadedFor === today && (
          <EmptyState icon={<ChecklistIcon />}>
            {t("tasks.empty")}
            <span className="mt-1.5 block text-[11px] text-faint/90">{t("tasks.emptyHint")}</span>
          </EmptyState>
        )}
        {tasks.length > 0 && visible.length === 0 && (
          <EmptyState icon={<ChecklistIcon />}>{t("tasks.emptyPriority")}</EmptyState>
        )}
      </ul>
    </div>
  );
}
