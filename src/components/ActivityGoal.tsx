import { t } from "../i18n";
import { secsLabel } from "../lib/activity";
import { GOALS } from "../lib/activityPrefs";

export type GoalDay = { met: boolean; label: string; selected: boolean };

const goalText = (min: number) => (min === 0 ? t("activity.goalOff") : secsLabel(min * 60));

/** Code time against the daily goal, the streak and one dot per day of the last week. */
export default function ActivityGoal({ codeSecs, goalMin, streakDays, days, editing, onEditing, onGoal }: {
  codeSecs: number;
  goalMin: number;
  streakDays: number;
  days: GoalDay[];
  editing: boolean;
  onEditing: (open: boolean) => void;
  onGoal: (min: number) => void;
}) {
  const goalSecs = goalMin * 60;
  const pct = goalSecs ? Math.min(100, (codeSecs / goalSecs) * 100) : 0;
  const done = goalSecs > 0 && pct >= 100;
  return (
    <section className="grid gap-2.5 rounded-2xl border border-edge bg-panel p-3.5" aria-label={t("activity.goalLabel")}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted">{t("activity.goalLabel")}</span>
        <button type="button" aria-expanded={editing} onClick={() => onEditing(!editing)} className="canto-hit min-h-[24px] text-[11.5px] text-accent-text underline underline-offset-2">
          {t(editing ? "activity.goalClose" : "activity.goalAdjust")}
        </button>
      </div>
      {editing && (
        <div role="group" aria-label={t("activity.goalPick")} className="flex flex-wrap gap-1.5">
          {GOALS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={goalMin === m}
              onClick={() => onGoal(m)}
              className={`canto-hit min-h-[24px] rounded-full border px-2.5 text-[11.5px] ${goalMin === m ? "border-accent bg-accent font-semibold text-on-accent" : "border-edge text-muted hover:text-fg"}`}
            >
              {goalText(m)}
            </button>
          ))}
        </div>
      )}
      {goalSecs > 0 ? (
        <>
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="font-mono tabular-nums text-fg">{t("activity.goalOf", { time: secsLabel(codeSecs), goal: goalText(goalMin) })}</span>
            <span className={done ? "text-ok" : "text-muted"}>{done ? t("activity.goalDone") : t("activity.goalLeft", { time: secsLabel(goalSecs - codeSecs) })}</span>
          </div>
          <div role="progressbar" aria-label={t("activity.goalLabel")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} className="h-2 overflow-hidden rounded-full bg-edge">
            <span className={`block h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500 ${done ? "bg-ok" : "bg-accent"}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-faint">{streakDays === 0 ? t("activity.noStreak") : streakDays === 1 ? t("activity.streakOne") : t("activity.streak", { n: streakDays })}</span>
            <span className="flex gap-1.5" role="img" aria-label={t("activity.weekDays")}>
              {days.map((d, i) => (
                <span
                  key={i}
                  title={d.label}
                  className={`grid h-[15px] w-[15px] place-items-center rounded-full border-[1.5px] ${d.met ? "border-accent bg-accent" : "border-line"} ${d.selected ? "outline outline-2 outline-offset-2 outline-fg/35" : ""}`}
                >
                  {d.met && (
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-2.5 w-2.5 text-on-accent" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  )}
                </span>
              ))}
            </span>
          </div>
        </>
      ) : (
        <p className="text-xs text-faint">{t("activity.goalNone")}</p>
      )}
    </section>
  );
}
