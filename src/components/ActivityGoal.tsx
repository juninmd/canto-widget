import { t } from "../i18n";
import { secsLabel } from "../lib/activity";
import { GOALS } from "../lib/activityPrefs";

const goalText = (min: number) => (min === 0 ? t("activity.goalOff") : secsLabel(min * 60));

/** Progress of the code time against the daily goal, and how many days in a row it was met. */
export default function ActivityGoal({ codeSecs, goalMin, days, onGoal }: { codeSecs: number; goalMin: number; days: number; onGoal: (min: number) => void }) {
  const pct = goalMin ? Math.min(100, (codeSecs / (goalMin * 60)) * 100) : 0;
  const done = goalMin > 0 && pct >= 100;
  return (
    <section className="flex flex-col gap-1.5 rounded-xl border border-edge p-3">
      <div className="flex items-center justify-between gap-2 text-[11px] text-faint">
        <label htmlFor="activity-goal">{t("activity.goalLabel")}</label>
        <select id="activity-goal" value={goalMin} onChange={(e) => onGoal(Number(e.target.value))} className="rounded border border-edge bg-panel px-1.5 py-0.5 text-xs text-fg">
          {GOALS.map((m) => (
            <option key={m} value={m}>{goalText(m)}</option>
          ))}
        </select>
      </div>
      {goalMin > 0 && (
        <>
          <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-edge">
            <span className={`block h-full ${done ? "bg-ok" : "bg-accent"}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[11px] text-muted">
            <span className="font-mono tabular-nums">{t("activity.goalOf", { time: secsLabel(codeSecs), goal: goalText(goalMin) })}</span>
            {done && ` · ${t("activity.goalDone")}`}
            {days > 0 && ` · ${days === 1 ? t("activity.streakOne") : t("activity.streak", { n: days })}`}
          </p>
        </>
      )}
    </section>
  );
}
