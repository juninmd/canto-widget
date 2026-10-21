import { LOCALE, t } from "../i18n";
import { dateOf, relativeDay, shiftDay } from "../lib/agendaDay";
import { ChevronIcon } from "./Icons";

const BTN = "canto-hit grid h-[28px] w-[28px] shrink-0 place-items-center rounded-lg text-muted hover:bg-hover hover:text-fg active:bg-active";

/** Steps through the days; the date between the arrows is also the picker, and "hoje" brings back the live view. */
export default function AgendaDayBar({ day, today, onPick }: { day: string; today: string; onPick: (day: string) => void }) {
  const rel = relativeDay(day, today);
  const label = rel
    ? t(`agenda.day.${rel}`)
    : dateOf(day).toLocaleDateString(LOCALE, { weekday: "short", day: "2-digit", month: "2-digit" });
  return (
    <>
      <button type="button" aria-label={t("agenda.day.prev")} title="[" onClick={() => onPick(shiftDay(day, -1))} className={BTN}>
        <ChevronIcon dir="left" />
      </button>
      <span className="canto-hit relative inline-grid min-h-[28px] min-w-[3.25rem] place-items-center rounded-lg px-1.5 hover:bg-hover focus-within:ring-2 focus-within:ring-accent">
        <span aria-live="polite" className="text-xs font-semibold text-fg">
          {label}
        </span>
        <input
          type="date"
          value={day}
          aria-label={t("agenda.day.pick")}
          title={t("agenda.day.pick")}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker();
            } catch {
              // Without showPicker (or outside a user gesture) the browser's own calendar button stays.
            }
          }}
          onChange={(e) => e.target.value && onPick(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </span>
      <button type="button" aria-label={t("agenda.day.next")} title="]" onClick={() => onPick(shiftDay(day, 1))} className={BTN}>
        <ChevronIcon dir="right" />
      </button>
      {day !== today && (
        <button type="button" title="H" onClick={() => onPick(today)} className="canto-hit min-h-[28px] shrink-0 rounded-lg px-1.5 text-xs text-accent-text hover:bg-hover active:bg-active">
          {t("agenda.day.back")}
        </button>
      )}
    </>
  );
}
