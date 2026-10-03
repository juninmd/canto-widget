import { useEffect, useMemo, useState } from "react";
import { api, errText, todayLocal, type AgendaItem, type Task } from "../lib/api";
import { t } from "../i18n";
import AgendaCard from "./AgendaCard";
import { conflicts, freeLabel, nextFree } from "../lib/agendaFree";
import Skeleton from "./Skeleton";
import type { Agenda } from "../lib/useAgenda";
import DayPlan from "./DayPlan";
import TranscriptsTab from "./TranscriptsTab";
import { readView, saveView, type AgendaView } from "../lib/agendaView";

const systemNow = () => new Date();

const VIEWS: AgendaView[] = ["list", "day", "meetings"];
const LABEL = { list: "plan.viewList", day: "plan.viewDay", meetings: "plan.viewMeetings" } as const;

/// Synthetic event so the user can check the pop-up and sound without waiting for a meeting.
function testEvent(): AgendaItem {
  const now = new Date();
  return {
    id: `teste-${now.getTime()}`,
    title: t("agenda.test.title"),
    start: now.toISOString(),
    end: new Date(now.getTime() + 30 * 60_000).toISOString(),
    all_day: false,
    location: t("agenda.test.location"),
    meet: "https://meet.google.com/abc-defg-hij",
    link: "",
    organizer: t("agenda.test.organizer"),
    guests: 3,
    description: t("agenda.test.description"),
  };
}

export default function AgendaTab({
  agenda,
  onError,
  now = systemNow,
  today = todayLocal(),
  version = 0,
}: {
  agenda: Agenda;
  onError: (m: string) => void;
  now?: () => Date;
  today?: string;
  version?: number;
}) {
  const { items, loading, error, reload } = agenda;
  const [open, setOpen] = useState<string | null>(null);
  const [at, setAt] = useState(now);
  useEffect(() => {
    const tick = setInterval(() => setAt(now()), 30_000);
    return () => clearInterval(tick);
  }, [now]);
  const clashes = useMemo(() => conflicts(items), [items]);
  const [view, setView] = useState<AgendaView>(readView);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reloadTasks, setReloadTasks] = useState(0);
  const pick = (v: AgendaView) => {
    setView(v);
    saveView(v);
  };

  // The day view is the only one that needs tasks, so the list view never reads the vault for them.
  useEffect(() => {
    if (view !== "day") return;
    let live = true;
    api
      .tasksForDay(today)
      .then((list) => live && setTasks(list))
      .catch((e) => live && onError(errText(e)));
    return () => {
      live = false;
    };
  }, [view, today, version, reloadTasks, onError]);

  function schedule(task: Task, time: string) {
    api
      .taskSetSchedule(task.id, time, task.repetir ?? null)
      .then(() => setReloadTasks((n) => n + 1))
      .catch((e) => onError(errText(e)));
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div role="group" aria-label={t("plan.viewLabel")} className="flex gap-0.5 self-start rounded-xl border border-edge bg-ink/60 p-0.5 text-xs">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => pick(v)}
            className={`canto-hit min-h-7 rounded-lg px-3 transition-colors ${view === v ? "bg-raised font-semibold text-accent-text shadow-[var(--shadow-raised)]" : "text-muted hover:bg-hover hover:text-fg active:bg-active"}`}
          >
            {t(LABEL[v])}
          </button>
        ))}
      </div>

      {view !== "meetings" && (
        <div className="flex items-center justify-between text-[11px] text-faint">
          <span>{t("agenda.header")}</span>
          <span className="flex gap-0.5">
            <button
              type="button"
              title={t("agenda.testAlertTitle")}
              onClick={() => void api.alertOpen(testEvent()).catch((e) => onError(errText(e)))}
              className="canto-hit min-h-[24px] rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active"
            >
              {t("agenda.testAlert")}
            </button>
            <button
              type="button"
              onClick={() => void reload()}
              className="canto-hit min-h-[24px] rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active"
            >
              {loading ? "..." : t("agenda.refresh")}
            </button>
          </span>
        </div>
      )}

      {view !== "meetings" && items.length > 0 && (
        <p role="status" className="rounded-md bg-edge/60 px-2 py-1 text-[11px] font-medium text-muted">
          {freeLabel(nextFree(items, at), at)}
        </p>
      )}

      {view === "meetings" ? (
        <div className="min-h-0 flex-1">
          <TranscriptsTab onError={onError} />
        </div>
      ) : view === "day" ? (
        <DayPlan agenda={items} tasks={tasks} now={at} onSchedule={schedule} />
      ) : (
        <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
          {items.map((e) => (
            <AgendaCard key={e.id} event={e} conflicts={clashes.get(e.id)} open={open === e.id} onToggle={() => setOpen(open === e.id ? null : e.id)} />
          ))}
          {items.length === 0 && loading && !error && (
            <li>
              <Skeleton label={t("agenda.loading")} />
            </li>
          )}
          {items.length === 0 && !loading && (
            <li className="px-2 py-6 text-center text-xs text-faint">
              {error || t("agenda.empty")}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
