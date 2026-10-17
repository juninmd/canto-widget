import { LOCALE, t } from "../i18n";
import { sparkline, WEATHER } from "../lib/protos";
import ProtoFrame from "./ProtoFrame";

const WEEKDAY = new Intl.DateTimeFormat(LOCALE, { weekday: "short" });

function weekday(offset: number): string {
  const day = new Date();
  day.setDate(day.getDate() + offset);
  return WEEKDAY.format(day);
}

/** Prototype: the weather now, the next hours as a curve and the next days; the city would come from the vault. */
export default function ProtoWeather() {
  const points = sparkline(
    WEATHER.hours.map((h) => h.temp),
    260,
    40,
  );
  return (
    <ProtoFrame needs={t("protos.weather.needs")}>
      <div data-proto-now className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-fg">
          {WEATHER.now} °C
        </span>
        <span className="text-xs text-muted">{t(`protos.weather.${WEATHER.condition}`)}</span>
        <span className="ml-auto text-[11px] text-faint">{t("protos.weather.feels", { temp: WEATHER.feels })}</span>
      </div>
      <p className="text-[11px] text-accent-text">{t("protos.weather.rainFrom", { time: WEATHER.rainFrom })}</p>

      <h3 className="text-[11px] text-faint">{t("protos.weather.hours")}</h3>
      <svg viewBox="0 0 260 40" className="h-10 w-full text-accent" aria-hidden="true">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <div className="flex justify-between text-[10px] text-faint tabular-nums">
        {WEATHER.hours.map((hour) => (
          <span key={hour.hour} title={t(`protos.weather.${hour.condition}`)}>
            {hour.hour}h {hour.temp}°
          </span>
        ))}
      </div>

      <h3 className="text-[11px] text-faint">{t("protos.weather.days")}</h3>
      <ul>
        {WEATHER.days.map((day) => (
          <li key={day.offset} data-proto-day={day.offset} className="flex items-center gap-2 px-1.5 py-1">
            <span className="w-10 text-[11px] text-muted">{weekday(day.offset)}</span>
            <span className="text-[11px] tabular-nums text-fg">
              {day.max}° / {day.min}°
            </span>
            <span className="ml-auto text-[10px] text-faint">{t(`protos.weather.${day.condition}`)}</span>
          </li>
        ))}
      </ul>
    </ProtoFrame>
  );
}
