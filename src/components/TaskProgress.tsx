import { t } from "../i18n";

const SIZE = 30;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** A ring plus "2 de 6"; the ring is a progressbar so assistive tech reads the same count the eye sees. */
export default function TaskProgress({ done, total }: { done: number; total: number }) {
  const fraction = total === 0 ? 0 : done / total;
  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-label={t("tasks.doneCount", { done, total })}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="shrink-0"
        style={{ width: SIZE, height: SIZE }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true" className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={STROKE} className="stroke-edge" />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
            className="stroke-accent motion-safe:transition-[stroke-dashoffset] motion-safe:duration-300"
          />
        </svg>
      </div>
      <b className="whitespace-nowrap text-[13px] font-semibold tabular-nums text-fg">{t("uiTasksNotes.progress", { done, total })}</b>
    </div>
  );
}
