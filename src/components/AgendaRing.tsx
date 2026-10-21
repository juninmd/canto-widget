import { ringText } from "../lib/agendaRing";

const R = 22;
const LENGTH = 2 * Math.PI * R;

/** Countdown for the meeting in progress: the arc is how much of it has passed, the number is the minutes left. */
export default function AgendaRing({ left, pct, label }: { left: number; pct: number; label: string }) {
  const { value, unit } = ringText(left);
  return (
    <div role="progressbar" aria-label={label} aria-valuetext={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)} className="relative size-14 shrink-0">
      <svg viewBox="0 0 56 56" aria-hidden="true" className="size-full -rotate-90">
        <circle cx="28" cy="28" r={R} fill="none" strokeWidth="5" className="stroke-edge" />
        <circle
          cx="28"
          cy="28"
          r={R}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-accent motion-safe:transition-[stroke-dashoffset] motion-safe:duration-500"
          strokeDasharray={LENGTH}
          strokeDashoffset={LENGTH * (1 - Math.min(1, Math.max(0, pct)))}
        />
      </svg>
      <span aria-hidden="true" className="absolute inset-0 grid place-content-center text-center leading-none">
        <b className="font-mono text-sm tabular-nums text-fg">{value}</b>
        {unit && <small className="mt-0.5 text-[9px] text-faint">{unit}</small>}
      </span>
    </div>
  );
}
