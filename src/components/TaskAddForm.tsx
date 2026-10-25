import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { api, errText } from "../lib/api";
import { parseQuickTask } from "../lib/quickAdd";
import { splitPastedTasks } from "../lib/pasteTasks";
import { useToast } from "../lib/toast";
import type { TokenEdit } from "../lib/quickAddTokens";
import { PlusIcon } from "./Icons";
import TaskQuickChips from "./TaskQuickChips";

type Props = { today: string; reload: () => Promise<void>; onError: (m: string) => void };

/** The quick-add line: "Daily às 9h30 !alta" creates the task, its time and its priority in one go. */
export default function TaskAddForm({ today, reload, onError }: Props) {
  const [title, setTitle] = useState("");
  const [select, setSelect] = useState<{ start: number; end: number } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const busy = useRef(false);
  const queued = useRef<string[]>([]);
  const toast = useToast();

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

  // Runs one line or a pasted list in order; a line that fails comes back to the field with the ones after it
  // queued, so Enter retries them instead of losing them. The busy flag keeps a second Enter or paste from
  // interleaving with a list still being created.
  async function batch(lines: string[]) {
    busy.current = true;
    queued.current = [];
    setTitle("");
    let failure: string | null = null;
    let created = 0;
    try {
      for (const [i, line] of lines.entries()) {
        try {
          failure = (await create(line)) ?? failure;
          created++;
        } catch (err) {
          failure = errText(err);
          setTitle(line);
          queued.current = lines.slice(i);
          break;
        }
      }
      if (created) await reload();
    } finally {
      busy.current = false;
    }
    if (queued.current.length > 1) toast({ message: t("tasks.pasteLeft", { n: queued.current.length }) });
    if (failure) onError(failure);
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current || !title.trim()) return;
    void batch(queued.current[0] === title ? queued.current : [title]);
  }

  // A list pasted into the empty field becomes one task per line instead of one long title.
  function paste(e: React.ClipboardEvent<HTMLInputElement>) {
    if (title.trim()) return;
    const split = splitPastedTasks(e.clipboardData.getData("text/plain"));
    if (!split) return;
    e.preventDefault();
    if (busy.current) return;
    if (split.dropped) toast({ message: t("tasks.pasteCapped", { n: split.lines.length, dropped: split.dropped }) });
    void batch(split.lines);
  }

  function edit(value: string) {
    // Typing another task over the failed line means the user gave up on the rest of that list.
    if (value !== queued.current[0]) queued.current = [];
    setTitle(value);
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
            onChange={(e) => edit(e.target.value)}
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
