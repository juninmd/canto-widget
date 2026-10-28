import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { api, errText, type Subtask } from "../lib/api";
import { CrossIcon, PlusIcon } from "./Icons";

type Props = { taskId: string; subtasks: Subtask[]; onError: (m: string) => void; onChange: () => void };

/** Checklist under a task. Each change saves immediately, same as the schedule fields. */
export default function TaskSubtasks({ taskId, subtasks, onError, onChange }: Props) {
  const [title, setTitle] = useState("");
  const list = useRef<HTMLUListElement>(null);
  const field = useRef<HTMLInputElement>(null);
  // Where focus lands once a removed item leaves the list: its neighbour, or the capture when none is left.
  const landing = useRef<string | null | undefined>(undefined);
  const removing = useRef<string | null>(null);

  useEffect(() => {
    const to = landing.current;
    if (to === undefined || subtasks.some((s) => s.id === removing.current)) return;
    landing.current = undefined;
    const box = [...(list.current?.querySelectorAll<HTMLInputElement>("input[data-subtask]") ?? [])].find((el) => el.dataset.subtask === to);
    (box ?? field.current)?.focus();
  }, [subtasks]);

  async function run(fn: () => Promise<unknown>): Promise<boolean> {
    try {
      await fn();
      onChange();
      return true;
    } catch (e) {
      onError(errText(e));
      return false;
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const value = title;
    setTitle("");
    // A failed save gives the text back instead of losing what was typed.
    if (!(await run(() => api.subtaskAdd(taskId, value)))) setTitle((now) => now || value);
  }

  async function remove(id: string) {
    const at = subtasks.findIndex((s) => s.id === id);
    removing.current = id;
    landing.current = (subtasks[at + 1] ?? subtasks[at - 1])?.id ?? null;
    if (!(await run(() => api.subtaskRemove(taskId, id)))) landing.current = undefined;
  }

  const done = subtasks.filter((s) => s.done).length;

  return (
    <div className="ml-6 flex flex-col gap-1.5 rounded-lg border border-edge bg-ink/60 p-2 text-xs text-muted motion-safe:animate-aba">
      {subtasks.length > 0 && (
        <span className="text-[11px] text-faint">{t("tasks.subtaskCount", { done, total: subtasks.length })}</span>
      )}
      <ul ref={list} className="flex flex-col gap-1">
        {subtasks.map((s) => (
          <li key={s.id} className="group flex items-center gap-2">
            <input
              type="checkbox"
              checked={s.done}
              data-subtask={s.id}
              aria-label={s.title}
              onChange={() => void run(() => api.subtaskToggle(taskId, s.id))}
              className="canto-box"
            />
            <span className={`flex-1 truncate ${s.done ? "text-faint line-through" : "text-fg"}`}>{s.title}</span>
            <button
              type="button"
              onClick={() => void remove(s.id)}
              className="grid size-5 shrink-0 place-items-center rounded text-faint opacity-0 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
              aria-label={t("tasks.subtaskDelete", { title: s.title })}
            >
              <CrossIcon />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex gap-1">
        <input
          ref={field}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("tasks.subtaskNew")}
          aria-label={t("tasks.subtaskNew")}
          className="flex-1 canto-field !rounded-md px-1.5 py-0.5"
        />
        <button type="submit" aria-label={t("tasks.subtaskAdd")} className="grid place-items-center rounded bg-edge px-2 text-fg">
          <PlusIcon />
        </button>
      </form>
    </div>
  );
}
