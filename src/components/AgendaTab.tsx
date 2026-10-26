import { useEffect, useMemo, useRef, useState } from "react";
import { api, errText, todayLocal, type Task } from "../lib/api";
import { t } from "../i18n";
import AgendaDayBar from "./AgendaDayBar";
import AgendaHero from "./AgendaHero";
import AgendaRail from "./AgendaRail";
import AgendaRibbon from "./AgendaRibbon";
import AgendaTray from "./AgendaTray";
import AgendaEmpty from "./AgendaEmpty";
import AgendaToolbar from "./AgendaToolbar";
import AgendaViewTabs from "./AgendaViewTabs";
import ErrorBanner from "./ErrorBanner";
import { conflicts, freeLabel, nextFree } from "../lib/agendaFree";
import { minuteOf } from "../lib/agendaRail";
import { dayBlocks, unscheduled } from "../lib/dayPlan";
import Skeleton from "./Skeleton";
import type { Agenda } from "../lib/useAgenda";
import TranscriptsTab from "./TranscriptsTab";
import { readView, saveView, type AgendaView } from "../lib/agendaView";
import { clockFor, shiftDay } from "../lib/agendaDay";
import { useDayAgenda } from "../lib/useDayAgenda";
import { useDayTasks } from "../lib/useDayTasks";
import { useAgendaKeys } from "../lib/useAgendaKeys";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { readPicked, savePicked } from "../lib/agendaPicked";
import { notConnected } from "../lib/agendaState";
import { testEvent } from "../lib/agendaTestEvent";
import { clockLabel } from "../lib/clockLabel";

const systemNow = () => new Date();

export default function AgendaTab({
  agenda: live,
  privacy = false,
  onError,
  onOpenSettings,
  onBooked,
  now = systemNow,
  today = todayLocal(),
  version = 0,
}: {
  agenda: Agenda;
  onError: (m: string) => void;
  privacy?: boolean;
  onOpenSettings?: () => void;
  onBooked?: (message: string) => void;
  now?: () => Date;
  today?: string;
  version?: number;
}) {
  // Following `today` (null) keeps the tab on the live day across midnight; picking a date pins it.
  const [picked, setPicked] = useState<string | null>(readPicked);
  const day = picked ?? today;
  const isToday = day === today;
  const pickDay = (d: string) => {
    const next = d === today ? null : d;
    savePicked(next);
    setPicked(next);
  };
  const { items, loading, error, fetchedAt, reload } = useDayAgenda(day, today, live);
  const [open, setOpen] = useState<string | null>(null);
  const [clock, setClock] = useState(now);
  useEffect(() => {
    const tick = setInterval(() => setClock(now()), 30_000);
    return () => clearInterval(tick);
  }, [now]);
  const at = clockFor(day, today, clock, items);
  const clashes = useMemo(() => conflicts(items), [items]);
  const allDay = items.filter((e) => e.all_day);
  const [view, setView] = useState<AgendaView>(readView);
  const [reloadTasks, setReloadTasks] = useState(0);
  const { tasks, error: tasksError } = useDayTasks(day, view === "today", version, reloadTasks);
  const hasDay = items.length > 0 || tasks.some((k) => !k.done && k.hora);
  const pick = (v: AgendaView) => {
    setView(v);
    saveView(v);
  };
  useAgendaKeys(view !== "meetings", (k) => pickDay(k === "today" ? today : shiftDay(day, k === "prev" ? -1 : 1)));

  // A double click on "+ task" would book it twice and toast twice before the list reloads.
  const booking = useRef(new Set<string>());
  function schedule(task: Task, time: string) {
    if (booking.current.has(task.id)) return;
    booking.current.add(task.id);
    api
      .taskSetSchedule(task.id, time, task.repetir ?? null)
      .then(() => {
        setReloadTasks((n) => n + 1);
        onBooked?.(t("agenda.booked", { title: task.title, time }));
      })
      .catch((e) => onError(errText(e)))
      .finally(() => booking.current.delete(task.id));
  }
  const openLink = (url: string) => void api.openLink(url).catch((e) => onError(errText(e)));

  const refresh = () => {
    void reload();
    setReloadTasks((n) => n + 1);
  };
  useRefreshEvent("agenda", refresh);
  const disconnected = notConnected(error);
  const stale = fetchedAt && items.length > 0 ? t("common.staleFailed", { time: clockLabel(fetchedAt), error }) : t("common.loadFailed", { error });

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <AgendaViewTabs view={view} onPick={pick} />
        {view !== "meetings" && (
          <div className="ml-auto flex flex-wrap items-center justify-end gap-0.5">
            <AgendaDayBar day={day} today={today} onPick={pickDay} />
            <AgendaToolbar
              loading={loading}
              fetchedAt={fetchedAt}
              onTestAlert={() => void api.alertOpen(testEvent()).catch((e) => onError(errText(e)))}
              onRefresh={refresh}
            />
          </div>
        )}
      </div>

      {view !== "meetings" && error && !(disconnected && !hasDay) && <ErrorBanner message={stale} onRetry={() => void reload()} busy={loading} />}
      {view !== "meetings" && tasksError && <ErrorBanner message={t("agenda.tasksFailed", { error: tasksError })} onRetry={() => setReloadTasks((n) => n + 1)} />}

      {view === "today" && isToday && items.length > 0 && (
        <p role="status" className="rounded-md bg-edge/60 px-2 py-1 text-[11px] font-medium text-muted">
          {freeLabel(nextFree(items, at), at)}
        </p>
      )}

      {view === "meetings" ? (
        <div key="meetings" className="min-h-0 flex-1 motion-safe:animate-aba">
          <TranscriptsTab privacy={privacy} onError={onError} />
        </div>
      ) : (
        <div key={`today-${day}`} className="flex-1 space-y-3 overflow-y-auto pr-1 motion-safe:animate-aba">
          {hasDay && (
            <>
              <AgendaHero items={items} now={at} relative={isToday} clashes={clashes} onDetails={setOpen} onOpen={openLink} />
              <AgendaRibbon items={items} tasks={tasks} now={at} />
              {allDay.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {allDay.map((e) => (
                    <li key={e.id} className="rounded-full bg-hover px-2.5 py-0.5 text-[11px] text-muted">
                      {e.title} · {t("agenda.allDay")}
                    </li>
                  ))}
                </ul>
              )}
              <AgendaRail items={items} tasks={tasks} now={at} live={isToday} clashes={clashes} open={open} onToggle={(id) => setOpen(open === id ? null : id)} onSchedule={schedule} onOpen={openLink} />
            </>
          )}
          {!hasDay && loading && !error && <Skeleton label={t("agenda.loading")} />}
          {!hasDay && !loading && (!error || disconnected) && <AgendaEmpty notConnected={disconnected} isToday={isToday} onOpenSettings={onOpenSettings} />}
          <AgendaTray tasks={unscheduled(tasks)} blocks={dayBlocks(items, tasks)} nowMin={minuteOf(at)} onSchedule={schedule} />
        </div>
      )}
    </div>
  );
}
