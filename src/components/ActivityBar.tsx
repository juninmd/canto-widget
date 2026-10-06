import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { ChevronIcon, LockIcon, MoreIcon } from "./Icons";

export type Period = "today" | "week";

const ICON_BUTTON = "canto-hit grid h-[28px] w-[28px] place-items-center rounded-lg text-muted hover:bg-hover hover:text-fg active:bg-active disabled:opacity-30 disabled:hover:bg-transparent";
const ITEM = "canto-hit flex min-h-[32px] w-full items-center rounded-lg px-2.5 text-left text-[12.5px] text-fg hover:bg-hover active:bg-active";

/** Stays on top while the tab scrolls: the period switch, the day stepper, the local-only badge and the actions menu. */
export default function ActivityBar({ period, onPeriod, dayLabel, canPrev, canNext, onPrev, onNext, onCopy, onRefresh, onGoal }: {
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
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const day = period === "today";

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const run = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <div className="sticky top-0 z-10 -mx-1 flex items-center gap-2 bg-ink/90 px-1 pb-2 pt-1 backdrop-blur">
      <div role="group" aria-label={t("activity.periodLabel")} className="flex overflow-hidden rounded-lg border border-edge bg-panel text-xs">
        {(["today", "week"] as const).map((p) => (
          <button key={p} type="button" aria-pressed={period === p} onClick={() => onPeriod(p)} className={`canto-hit min-h-[28px] px-3 ${period === p ? "bg-active font-semibold text-fg" : "text-muted hover:text-fg"}`}>
            {t(p === "today" ? "activity.day" : "activity.week")}
          </button>
        ))}
      </div>
      <div
        ref={root}
        className="relative ml-auto flex items-center gap-0.5"
        onKeyDown={(e) => {
          if (open && e.key === "Escape") {
            e.stopPropagation();
            setOpen(false);
            button.current?.focus();
          }
        }}
      >
        {day && (
          <>
            <button type="button" aria-label={t("activity.prevDay")} disabled={!canPrev} onClick={onPrev} className={ICON_BUTTON}>
              <ChevronIcon dir="left" />
            </button>
            <span className="min-w-[5.2rem] text-center text-xs font-semibold text-fg @max-[380px]:min-w-[4.2rem]">{dayLabel}</span>
            <button type="button" aria-label={t("activity.nextDay")} disabled={!canNext} onClick={onNext} className={ICON_BUTTON}>
              <ChevronIcon dir="right" />
            </button>
          </>
        )}
        <span role="img" aria-label={t("activity.privacy")} title={t("activity.privacyHint")} className="grid h-[28px] w-[28px] place-items-center text-accent-text @max-[380px]:hidden">
          <LockIcon />
        </span>
        <button ref={button} type="button" aria-label={t("activity.more")} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} className={ICON_BUTTON}>
          <MoreIcon />
        </button>
        {open && (
          <div role="menu" className="absolute right-0 top-full z-20 mt-1 min-w-[12.5rem] rounded-xl border border-edge bg-panel p-1 shadow-raised">
            {day && (
              <button type="button" role="menuitem" onClick={run(onCopy)} className={ITEM}>
                {t("activity.copy")}
              </button>
            )}
            <button type="button" role="menuitem" onClick={run(onRefresh)} className={ITEM}>
              {t("activity.refreshNow")}
            </button>
            {day && (
              <>
                <hr className="mx-1 my-1 border-edge" />
                <button type="button" role="menuitem" onClick={run(onGoal)} className={ITEM}>
                  {t("activity.goalMenu")}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
