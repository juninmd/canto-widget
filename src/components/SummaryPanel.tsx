import { t } from "../i18n";
import { useRef, useState } from "react";
import type { AgendaItem, Task } from "../lib/api";
import { PERIODS, type Period } from "../lib/period";
import DaySummary from "./DaySummary";
import PeriodReport from "./PeriodReport";

/** The day summary keeps today's live tasks and agenda; week and month load their own data from the period. */
export default function SummaryPanel({
  today,
  tasks,
  agenda,
  onClose,
  onError,
}: {
  today: string;
  tasks: Task[];
  agenda: AgendaItem[];
  onClose: () => void;
  onError: (m: string) => void;
}) {
  const [period, setPeriod] = useState<Period>("day");
  const radios = useRef<Partial<Record<Period, HTMLButtonElement | null>>>({});

  // Radio-group pattern: one Tab stop, the arrows move the choice along with the focus.
  function onArrows(e: React.KeyboardEvent) {
    const i = PERIODS.indexOf(period);
    const target = {
      ArrowRight: (i + 1) % PERIODS.length,
      ArrowDown: (i + 1) % PERIODS.length,
      ArrowLeft: (i - 1 + PERIODS.length) % PERIODS.length,
      ArrowUp: (i - 1 + PERIODS.length) % PERIODS.length,
      Home: 0,
      End: PERIODS.length - 1,
    }[e.key];
    if (target === undefined) return;
    e.preventDefault();
    setPeriod(PERIODS[target]);
    radios.current[PERIODS[target]]?.focus();
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div
        role="radiogroup"
        aria-label={t("report.periodLabel")}
        onKeyDown={(e) => (e.key === "Escape" ? onClose() : onArrows(e))}
        className="flex shrink-0 gap-1.5"
      >
        {PERIODS.map((p) => (
          <button
            key={p}
            ref={(el) => {
              radios.current[p] = el;
            }}
            type="button"
            role="radio"
            aria-checked={period === p}
            tabIndex={period === p ? 0 : -1}
            onClick={() => setPeriod(p)}
            className={`min-h-7 flex-1 rounded-lg border px-2.5 text-xs ${
              period === p ? "border-accent text-fg" : "border-edge text-muted hover:text-fg"
            }`}
          >
            {t(`report.${p}`)}
          </button>
        ))}
      </div>
      {period === "day" ? (
        <DaySummary day={today} tasks={tasks} agenda={agenda} onClose={onClose} onError={onError} />
      ) : (
        <PeriodReport key={period} period={period} today={today} onClose={onClose} onError={onError} />
      )}
    </div>
  );
}
