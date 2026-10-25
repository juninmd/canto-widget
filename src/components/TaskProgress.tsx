import { useEffect, useRef, useState, type CSSProperties } from "react";
import { t } from "../i18n";

const SIZE = 30;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Eight specks thrown around the ring: [dx, dy, skin colour].
const CONFETTI = [
  [-20, -16, "accent"], [18, -20, "warn"], [24, 2, "cat-meet"], [16, 20, "cat-chat"],
  [-4, 24, "danger"], [-22, 14, "cat-web"], [-26, -2, "warn"], [2, -26, "cat-meet"],
] as const;

/** A ring plus "2 de 6"; the ring is a progressbar so assistive tech reads the same count the eye sees. */
export default function TaskProgress({ done, total }: { done: number; total: number }) {
  const fraction = total === 0 ? 0 : done / total;
  const complete = total > 0 && done === total;
  const was = useRef(complete);
  const [burst, setBurst] = useState(0);
  // Only the tick that empties the list celebrates: opening the tab on a finished day stays quiet.
  useEffect(() => {
    if (complete && !was.current) setBurst((n) => n + 1);
    was.current = complete;
  }, [complete]);
  // An empty day already says so below; "0 de 0" next to it would read as data.
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <div
        role="progressbar"
        aria-label={t("tasks.doneCount", { done, total })}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className={`relative shrink-0 ${complete && burst ? "canto-ring-done" : ""}`}
        style={{ width: SIZE, height: SIZE }}
      >
        {complete && burst > 0 && (
          <span key={burst} aria-hidden="true" data-confetti className="canto-confetti">
            {CONFETTI.map((c, i) => (
              <i key={i} style={{ "--x": `${c[0]}px`, "--y": `${c[1]}px`, background: `var(--color-${c[2]})` } as CSSProperties} />
            ))}
          </span>
        )}
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
