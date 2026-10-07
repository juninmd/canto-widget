import { useState } from "react";
import type { AgendaItem, Task } from "../lib/api";
import { duration } from "../lib/agendaFree";
import { fitInGap, minuteOf, railEntries, type RailEntry } from "../lib/agendaRail";
import { dayBlocks, hhmm, unscheduled } from "../lib/dayPlan";
import { t } from "../i18n";
import AgendaCard from "./AgendaCard";

type Props = {
  items: AgendaItem[];
  tasks: Task[];
  now: Date;
  /** False on other days: there is no "now" line to draw. */
  live?: boolean;
  clashes: Map<string, string[]>;
  open: string | null;
  onToggle: (id: string) => void;
  onSchedule: (task: Task, time: string) => void;
};

const DOT = "absolute left-[1px] top-3 h-3 w-3 rounded-full border-2 bg-panel";

/** One row of the line: the rail on the left, the entry on the right. */
function Row({ tone, dot, children }: { tone?: string; dot?: string; children: React.ReactNode }) {
  return (
    <li className={`relative grid grid-cols-[14px_minmax(0,1fr)] gap-x-2 before:absolute before:inset-y-0 before:left-[6px] before:w-0.5 before:bg-edge ${tone ?? ""}`}>
      <span aria-hidden="true" className={dot ? `${DOT} ${dot}` : ""} />
      <div className="col-start-2 min-w-0 py-1">{children}</div>
    </li>
  );
}

/** Reuniões, tarefas com horário e janelas livres numa linha só; o que já passou fica recolhido. */
export default function AgendaRail({ items, tasks, now, live = true, clashes, open, onToggle, onSchedule }: Props) {
  const { past, upcoming } = railEntries(items, tasks, now);
  const [showPast, setShowPast] = useState<boolean | null>(null);
  // Nothing left to look at: the finished meetings are the whole answer, so they start open.
  const pastOpen = showPast ?? !upcoming.some((e) => e.kind !== "gap");
  const at = minuteOf(now);
  const blocks = dayBlocks(items, tasks);
  const pending = unscheduled(tasks);
  const lineAt = !live || upcoming.some((e) => e.kind !== "gap" && e.start <= at) ? -1 : upcoming.findIndex((e) => e.start > at);

  const entry = (e: RailEntry, ended: boolean) => {
    if (e.kind === "event") {
      const live = e.start <= at && at < e.end;
      return (
        <Row key={e.id} tone={`${ended ? "opacity-60" : ""} ${clashes.has(e.id) ? "before:bg-danger" : ""}`} dot={live ? "border-accent bg-accent" : "border-sky-400"}>
          <AgendaCard event={e.item} conflicts={clashes.get(e.id)} open={open === e.id} onToggle={() => onToggle(e.id)} />
        </Row>
      );
    }
    if (e.kind === "task") {
      return (
        <Row key={`task-${e.id}`} tone={ended ? "opacity-60" : ""} dot="border-dashed border-accent">
          <div className="rounded-xl border border-dashed border-line px-3 py-2">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm text-fg">{e.task.title}</span>
              <span className="shrink-0 rounded-full border border-line px-1.5 text-[10px] text-muted">{t("agenda.rail.task")}</span>
            </span>
            <span className="font-mono text-[11px] tabular-nums text-muted">
              {hhmm(e.start)}–{hhmm(e.end)} · {duration(e.end - e.start)}
            </span>
          </div>
        </Row>
      );
    }
    const fit = pending.map((task) => ({ task, slot: fitInGap(blocks, task, e) })).find((f) => f.slot !== null);
    return (
      <Row key={e.id} tone="before:bg-transparent before:[background-image:repeating-linear-gradient(var(--color-ok)_0_4px,transparent_4px_8px)] before:opacity-50">
        <div className="flex min-h-[34px] items-center justify-between gap-2 rounded-xl border border-dashed border-ok/55 px-3 text-xs text-ok">
          <span className="min-w-0">{t("agenda.rail.free", { duration: duration(e.end - e.start), start: hhmm(e.start), end: hhmm(e.end) })}</span>
          {fit && (
            <button
              type="button"
              onClick={() => onSchedule(fit.task, hhmm(fit.slot!))}
              title={t("agenda.rail.bookIn", { title: fit.task.title, time: hhmm(fit.slot!) })}
              className="canto-hit min-h-[24px] max-w-[45%] shrink-0 truncate rounded-md px-1.5 font-bold underline underline-offset-2 hover:bg-hover"
            >
              + {fit.task.title}
            </button>
          )}
        </div>
      </Row>
    );
  };

  return (
    <div className="space-y-1">
      {past.length > 0 && (
        <button
          type="button"
          aria-expanded={pastOpen}
          onClick={() => setShowPast(!pastOpen)}
          className="canto-hit flex min-h-[28px] w-full items-center justify-between rounded-lg border border-dashed border-edge px-3 text-xs text-muted hover:bg-hover"
        >
          <span>{t("agenda.rail.past", { n: past.length })}</span>
          <span aria-hidden="true">{pastOpen ? "▴" : "▾"}</span>
        </button>
      )}
      <ol aria-label={t("agenda.rail.label")}>
        {pastOpen && past.map((e) => entry(e, true))}
        {upcoming.map((e, i) => (
          <span key={`${e.kind}-${e.id}`} className="contents">
            {i === lineAt && (
              <li aria-label={t("plan.nowLine")} className="flex h-5 items-center gap-2 text-[10px] font-bold text-danger">
                <span className="h-0.5 w-3.5 bg-danger" />
                <span className="font-mono tabular-nums">{hhmm(at)}</span>
                <span className="h-0.5 flex-1 bg-danger/70" />
              </li>
            )}
            {entry(e, false)}
          </span>
        ))}
      </ol>
    </div>
  );
}
