import { LOCALE, t } from "../i18n";
import { dateOf, relativeDay, shiftDay } from "../lib/agendaDay";
import { ChevronIcon } from "./Icons";

const BTN = "canto-hit grid h-[28px] w-[28px] place-items-center rounded-lg text-muted hover:bg-hover hover:text-fg active:bg-active";

/** Steps through the days and jumps to any date; "hoje" brings back the live view. */
export default function AgendaDayBar({ day, today, onPick }: { day: string; today: string; onPick: (day: string) => void }) {
  const rel = relativeDay(day, today);
  const label = rel
    ? t(`agenda.day.${rel}`)
    : dateOf(day).toLocaleDateString(LOCALE, { weekday: "short", day: "2-digit", month: "2-digit" });
  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label={t("agenda.day.prev")} onClick={() => onPick(shiftDay(day, -1))} className={BTN}>
        <ChevronIcon dir="left" />
      </button>
      <span aria-live="polite" className="min-w-[5.2rem] text-center text-xs font-semibold text-fg">
        {label}
      </span>
      <button type="button" aria-label={t("agenda.day.next")} onClick={() => onPick(shiftDay(day, 1))} className={BTN}>
        <ChevronIcon dir="right" />
      </button>
      <input
        type="date"
        value={day}
        aria-label={t("agenda.day.pick")}
        onChange={(e) => e.target.value && onPick(e.target.value)}
        className="canto-hit min-h-[28px] rounded-lg border border-edge bg-ink px-1.5 text-[11px] text-muted outline-none focus:border-accent"
      />
      {day !== today && (
        <button type="button" onClick={() => onPick(today)} className="canto-hit min-h-[28px] rounded-lg px-2 text-xs text-accent-text hover:bg-hover active:bg-active">
          {t("agenda.day.back")}
        </button>
      )}
    </div>
  );
}
