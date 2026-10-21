import { useCallback, useEffect, useState } from "react";
import { api, errText, type GTask } from "../lib/api";
import { dueDay, googleGate, isLate } from "../lib/google";
import { t } from "../i18n";

type Props = { today: string; onError: (message: string) => void };

const OPEN_KEY = "canto.gtasksOpen";
const savedOpen = () => {
  try {
    return localStorage.getItem(OPEN_KEY) !== "0";
  } catch {
    return true;
  }
};

/** Open tasks of the default Google Tasks list under the day's tasks, with their own capture. Without a Google
 *  login it stays out of the way: the Tasks tab is for everyone. */
export default function GoogleTasksSection({ today, onError }: Props) {
  const [tasks, setTasks] = useState<GTask[] | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(savedOpen);

  const load = useCallback(async () => {
    try {
      setTasks(await api.gtasksList());
    } catch (e) {
      if (googleGate(errText(e)) === null) onError(errText(e));
      setTasks(null);
    }
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  if (tasks === null) return null;

  const add = async () => {
    const title = draft.trim();
    if (!title) return;
    setBusy(true);
    try {
      const task = await api.gtasksAdd(title);
      setTasks((list) => [...(list ?? []), task]);
      setDraft("");
    } catch (e) {
      onError(errText(e));
    } finally {
      setBusy(false);
    }
  };
  const complete = async (task: GTask) => {
    setTasks((list) => list?.filter((x) => x.id !== task.id) ?? null);
    try {
      await api.gtasksComplete(task.id);
    } catch (e) {
      onError(errText(e));
      void load();
    }
  };

  return (
    <section aria-label={t("gtasks.title")} className="wx-glass flex max-h-[38%] shrink-0 flex-col gap-1 overflow-y-auto p-2">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => {
            setOpen(!open);
            try {
              localStorage.setItem(OPEN_KEY, open ? "0" : "1");
            } catch {
              // A blocked storage only forgets the choice.
            }
          }}
          className="canto-hit flex w-full items-center gap-1 px-1 text-[11px] uppercase tracking-wider text-faint hover:text-fg"
        >
          <span className="flex-1 text-left">
            {t("gtasks.title")} · {tasks.length}
          </span>
          <span aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>
      </h3>
      {open && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void add();
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={busy}
              maxLength={1024}
              placeholder={t("gtasks.add")}
              aria-label={t("gtasks.add")}
              className="canto-field w-full rounded-lg border border-edge bg-panel px-2.5 py-1.5 text-xs text-fg outline-none placeholder:text-faint focus:border-accent"
            />
          </form>
          {tasks.length === 0 && <p className="px-1 py-1 text-[11px] text-faint">{t("gtasks.empty")}</p>}
          <ul>
            {tasks.map((task) => (
              <li key={task.id} data-gtask={task.id} className="flex items-center gap-2 rounded-md px-1 py-1 text-xs hover:bg-hover">
                <button
                  type="button"
                  onClick={() => void complete(task)}
                  aria-label={t("gtasks.complete", { title: task.title })}
                  className="canto-hit group grid shrink-0 place-items-center"
                >
                  <span aria-hidden="true" className="size-3.5 rounded-[4px] border-[1.5px] border-faint group-hover:border-accent" />
                </button>
                <span className="min-w-0 flex-1 truncate text-fg">{task.title}</span>
                {task.due && (
                  <span
                    className={`rounded-md px-1.5 text-[10px] ${isLate(task.due, today) ? "bg-danger/15 text-danger" : "bg-edge/60 text-muted"}`}
                  >
                    {dueDay(task.due)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
