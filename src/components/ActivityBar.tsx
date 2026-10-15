import { t } from "../i18n";
import { secsLabel } from "../lib/activity";
import { ChevronIcon, LockIcon } from "./Icons";
import ActivityMenu from "./ActivityMenu";
import { RefreshIcon } from "./RefreshIcon";
import Spinner from "./Spinner";

export type Period = "today" | "week";

const ICON_BUTTON = "canto-hit grid h-[28px] w-[28px] place-items-center rounded-lg text-muted hover:bg-hover hover:text-fg active:bg-active disabled:opacity-30 disabled:hover:bg-transparent";

/** Stays on top while the tab scrolls: the period switch, the day stepper, the goal chip, refresh and the actions menu. */
export default function ActivityBar({ period, onPeriod, dayLabel, canPrev, canNext, onPrev, onNext, onCopy, onRefresh, onGoal, goalMin, showGoal, loading }: {
  period: Period;
  onPeriod: (p: Period) => void;
  dayLabel: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onCopy: () => void;
  onRefresh: () => void;
  onGoal: () => void;
  goalMin: number;
  /** The editor lives in the day view, which an empty day does not render. */
  showGoal: boolean;
  loading: boolean;
}) {
  const day = period === "today";
  return (
    <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center gap-x-2 gap-y-1 bg-ink/90 px-1 pb-2 pt-1 backdrop-blur">
      <div role="group" aria-label={t("activity.periodLabel")} className="flex overflow-hidden rounded-lg border border-edge bg-panel text-xs">
        {(["today", "week"] as const).map((p) => (
          <button key={p} type="button" aria-pressed={period === p} onClick={() => onPeriod(p)} className={`canto-hit min-h-[28px] px-3 ${period === p ? "bg-active font-semibold text-fg" : "text-muted hover:text-fg"}`}>
            {t(p === "today" ? "activity.day" : "activity.week")}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-0.5">
        {day && (
          <>
            <button type="button" aria-label={t("activity.prevDay")} disabled={!canPrev} onClick={onPrev} className={ICON_BUTTON}>
              <ChevronIcon dir="left" />
            </button>
            <span className="min-w-[5.2rem] text-center text-xs font-semibold text-fg @max-[380px]:min-w-[4.2rem]">{dayLabel}</span>
            <button type="button" aria-label={t("activity.nextDay")} disabled={!canNext} onClick={onNext} className={ICON_BUTTON}>
              <ChevronIcon dir="right" />
            </button>
            {showGoal && (
              <button type="button" onClick={onGoal} className="canto-hit mx-1 min-h-[24px] rounded-full border border-edge px-2.5 text-[11.5px] text-muted hover:bg-hover hover:text-fg active:bg-active">
                {goalMin === 0 ? t("activity.goalChipSet") : t("activity.goalChip", { goal: secsLabel(goalMin * 60) })}
              </button>
            )}
          </>
        )}
        <span role="img" aria-label={t("activity.privacy")} title={t("activity.privacyHint")} className="grid h-[28px] w-[28px] place-items-center text-accent-text @max-[380px]:hidden">
          <LockIcon />
        </span>
        <button type="button" aria-label={t("common.refresh")} aria-busy={loading} disabled={loading} onClick={onRefresh} className={ICON_BUTTON}>
          {loading ? <Spinner /> : <RefreshIcon />}
        </button>
        <ActivityMenu day={day} onCopy={onCopy} onRefresh={onRefresh} onGoal={onGoal} />
      </div>
    </div>
  );
}
