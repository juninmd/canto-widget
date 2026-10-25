import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { emit, listen } from "@tauri-apps/api/event";
import { t } from "./i18n";
import { api, errText, todayLocal } from "./lib/api";
import { CAPTURE_EVENT, TASKS_CHANGED_EVENT } from "./lib/alertEvents";
import { parseQuickTask } from "./lib/quickAdd";
import Spinner from "./components/Spinner";

/** The shortcut's own window: Enter saves a task for today, Ctrl+Enter a note, Esc leaves without saving. */
export default function CaptureWindow() {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<"task" | "note" | null>(null);
  // A ref, not the state: two Enters in the same frame both see the old state and would save twice.
  const busy = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const open = () => {
      setText("");
      setError("");
      input.current?.focus();
    };
    open();
    const stop = listen(CAPTURE_EVENT, open);
    return () => {
      void stop.then((f) => f());
    };
  }, []);

  async function save(asNote: boolean) {
    const raw = text.trim();
    if (!raw || busy.current) return;
    busy.current = true;
    setSaving(asNote ? "note" : "task");
    setError("");
    try {
      if (asNote) {
        await api.noteSave({ title: raw, body: "", tags: [] });
      } else {
        // Same quick-add syntax as the task list: "Daily às 9h30 !alta" sets the time and priority too.
        const quick = parseQuickTask(raw);
        const created = await api.taskAdd(quick.title, todayLocal());
        // Cleared before the rest: a failed time or priority must not leave the text to be saved twice.
        setText("");
        await emit(TASKS_CHANGED_EVENT);
        if (quick.time) await api.taskSetSchedule(created.id, quick.time, null);
        if (quick.priority) await api.taskSetPriority(created.id, quick.priority);
      }
      setText("");
      await api.captureClose();
    } catch (e) {
      setError(errText(e));
    } finally {
      busy.current = false;
      setSaving(null);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") void api.captureClose().catch((err: unknown) => setError(errText(err)));
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void save(e.ctrlKey || e.metaKey);
    }
  }

  return (
    <div
      onKeyDown={onKeyDown}
      className="flex h-screen flex-col justify-center gap-2 rounded-2xl border border-edge bg-panel p-3 text-fg"
    >
      <input
        ref={input}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label={t("capture.title")}
        placeholder={t("capture.placeholder")}
        autoComplete="off"
        className="min-h-9 rounded-lg border border-edge bg-ink px-3 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[11px] text-faint">{t("capture.hint")}</p>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => void save(false)}
            disabled={saving !== null}
            aria-busy={saving === "task"}
            className="inline-flex min-h-7 items-center gap-1 rounded-lg border border-edge px-2.5 text-xs text-muted hover:text-fg disabled:opacity-60"
          >
            {saving === "task" && <Spinner />}
            {t("capture.task")}
          </button>
          <button
            type="button"
            onClick={() => void save(true)}
            disabled={saving !== null}
            aria-busy={saving === "note"}
            className="inline-flex min-h-7 items-center gap-1 rounded-lg border border-edge px-2.5 text-xs text-muted hover:text-fg disabled:opacity-60"
          >
            {saving === "note" && <Spinner />}
            {t("capture.note")}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
