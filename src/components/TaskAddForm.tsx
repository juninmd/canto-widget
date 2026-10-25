import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { api, errText } from "../lib/api";
import { parseQuickTask } from "../lib/quickAdd";
import { splitPastedTasks } from "../lib/pasteTasks";
import type { TokenEdit } from "../lib/quickAddTokens";
import { PlusIcon } from "./Icons";
import TaskQuickChips from "./TaskQuickChips";

type Props = { today: string; reload: () => Promise<void>; onError: (m: string) => void };

/** The quick-add line: "Daily às 9h30 !alta" creates the task, its time and its priority in one go. */
export default function TaskAddForm({ today, reload, onError }: Props) {
  const [title, setTitle] = useState("");
  const [select, setSelect] = useState<{ start: number; end: number } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // A chip steals focus; hand it back with the inserted token selected so typing replaces the placeholder time.
  useEffect(() => {
    if (!select) return;
    input.current?.focus();
    input.current?.setSelectionRange(select.start, select.end);
    setSelect(null);
  }, [select]);

  function applyToken(edit: TokenEdit | null) {
    if (!edit) return input.current?.focus();
    setTitle(edit.value);
    setSelect({ start: edit.start, end: edit.end });
  }

  /** Creates one quick-add line; null when it all landed, else the error to show. */
  async function create(raw: string): Promise<string | null> {
    const quick = parseQuickTask(raw);
    const created = await api.taskAdd(quick.title, today);
    try {
      if (quick.time) await api.taskSetSchedule(created.id, quick.time, null);
      if (quick.priority) await api.taskSetPriority(created.id, quick.priority);
    } catch (err) {
      return errText(err);
    }
    return null;
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    let failure: string | null;
    try {
      failure = await create(title);
    } catch (err) {
      onError(errText(err));
      return;
    }
    // The task exists from here on: clearing the field keeps a retry from adding a duplicate.
    setTitle("");
    await reload();
    if (failure) onError(failure);
  }

  // A list pasted into the empty field becomes one task per line instead of one long title.
  async function paste(e: React.ClipboardEvent<HTMLInputElement>) {
    if (title.trim()) return;
    const lines = splitPastedTasks(e.clipboardData.getData("text/plain"));
    if (!lines) return;
    e.preventDefault();
    let failure: string | null = null;
    for (const line of lines) {
      try {
        failure = (await create(line)) ?? failure;
      } catch (err) {
        failure = errText(err);
        break;
      }
    }
    await reload();
    if (failure) onError(failure);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <form onSubmit={add} className="flex gap-2">
        <div className="relative flex-1">
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
            <PlusIcon />
          </span>
          <input
            ref={input}
            value={title}
            data-shortcut="new"
            onChange={(e) => setTitle(e.target.value)}
            onPaste={paste}
            placeholder={t("tasks.addPlaceholder")}
            className="canto-field w-full py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <button
          type="submit"
          aria-label={t("tasks.add")}
          className="grid w-10 place-items-center rounded-xl bg-accent text-on-accent shadow-[var(--shadow-raised)] hover:brightness-110"
        >
          <PlusIcon />
        </button>
      </form>
      <TaskQuickChips value={title} onEdit={applyToken} />
    </div>
  );
}
