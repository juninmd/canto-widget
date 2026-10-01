import { useEffect, useRef } from "react";
import { t } from "../i18n";
import type { AgendaItem, Task } from "../lib/api";
import { DEFAULT_TASK_MIN, dayBlocks, firstFreeSlot, hhmm, hourRange, unscheduled } from "../lib/dayPlan";

const HOUR_PX = 44;
const MIN_BLOCK_PX = 20;

type Props = { agenda: AgendaItem[]; tasks: Task[]; now: Date; onSchedule: (task: Task, time: string) => void };

/** The day as hour rows: events solid, tasks with a time dashed, and the open tasks waiting for a slot above. */
export default function DayPlan({ agenda, tasks, now, onSchedule }: Props) {
  const blocks = dayBlocks(agenda, tasks);
  const [first, last] = hourRange(blocks);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const px = (min: number) => ((min - first * 60) / 60) * HOUR_PX;
  const scroller = useRef<HTMLDivElement>(null);
  const hours = Array.from({ length: last - first }, (_, i) => first + i);

  // Opens near the present, not at 8h, once per mount.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = Math.max(0, px(nowMin) - HOUR_PX);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = unscheduled(tasks);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {pending.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-muted">{t("plan.unscheduled")}</span>
          <ul className="flex gap-1.5 overflow-x-auto pb-1">
            {pending.map((task) => {
              const slot = firstFreeSlot(blocks, task.estimate_min ?? DEFAULT_TASK_MIN, nowMin);
              return (
                <li key={task.id} className="shrink-0">
                  <button
                    type="button"
                    disabled={slot === null}
                    onClick={() => slot !== null && onSchedule(task, hhmm(slot))}
                    title={slot === null ? t("plan.noSlot") : t("plan.schedule", { title: task.title, time: hhmm(slot) })}
                    className="max-w-48 truncate rounded-md border border-line px-2 py-1 text-xs text-fg hover:border-accent disabled:opacity-50"
                  >
                    {task.title}
                    {task.estimate_min ? <span className="ml-1 text-muted">· {t("plan.taskMin", { min: task.estimate_min })}</span> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <p className="text-[11px] text-faint">{t("plan.legend")}</p>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto pr-1" role="group" aria-label={t("plan.gridLabel")}>
        <div className="relative" style={{ height: hours.length * HOUR_PX }}>
          {hours.map((h) => (
            <div key={h} className="absolute inset-x-0 flex border-t border-edge text-[10px] text-faint" style={{ top: px(h * 60) }}>
              <span className="w-9 pt-0.5 font-mono tabular-nums">{String(h).padStart(2, "0")}h</span>
            </div>
          ))}
          <div className="absolute inset-y-0 left-9 right-0">
            {blocks.map((b) => (
              <div
                key={`${b.kind}-${b.id}`}
                className={`absolute overflow-hidden rounded-md border-l-2 px-2 py-0.5 text-xs ${
                  b.kind === "event" ? "border-sky-400 bg-sky-500/15" : "border border-dashed border-accent border-l-2 bg-panel"
                } ${b.clash ? "ring-1 ring-danger" : ""}`}
                style={{
                  top: px(b.start),
                  height: Math.max(MIN_BLOCK_PX, px(b.end) - px(b.start) - 2),
                  left: `calc(${(b.lane / b.lanes) * 100}% + 2px)`,
                  width: `calc(${100 / b.lanes}% - 4px)`,
                }}
                title={`${b.title} ${hhmm(b.start)}–${hhmm(b.end)}`}
              >
                <span className="block truncate text-fg">{b.title}</span>
                <span className="block truncate text-[10px] text-muted">
                  {hhmm(b.start)}–{hhmm(b.end)}
                  {b.clash && <span className="ml-1 text-danger">· {t("plan.clash")}</span>}
                </span>
              </div>
            ))}
            {nowMin >= first * 60 && nowMin <= last * 60 && (
              <div className="pointer-events-none absolute inset-x-0 h-0.5 bg-danger" style={{ top: px(nowMin) }} title={t("plan.nowLine")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
