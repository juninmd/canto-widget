import type { CSSProperties } from "react";
import { nowcast } from "../lib/weather";
import { LOCALE, t } from "../i18n";

/** A quarter with this much rain fills the bar; heavier rain stays at the top. */
const FULL_MM = 2.5;
const TICKS = ["agora", "+30", "+1h", "+1h30", "+2h"];

/** The next two hours in quarters: when the rain starts or stops, and a bar per quarter for how heavy it gets. */
export default function WeatherNowcast({ quarters, index }: { quarters: number[]; index: number }) {
  const said = nowcast(quarters);
  const total = quarters.reduce((sum, mm) => sum + mm, 0);
  return (
    <section data-weather-nowcast className="wx-glass wx-rise flex shrink-0 flex-col gap-2 px-3 py-2.5" style={{ "--i": index } as CSSProperties}>
      <h3 className="flex items-center justify-between text-[11px] text-faint">
        <span>{t("weather.nowcast.title")}</span>
        {total > 0 && <span className="tabular-nums">{total.toLocaleString(LOCALE, { maximumFractionDigits: 1 })} mm</span>}
      </h3>
      <p className="text-xs font-medium text-fg">{"min" in said ? t(said.key, { min: said.min }) : t(said.key)}</p>
      <div className="grid h-7 grid-flow-col items-end gap-[3px]" aria-hidden="true">
        {quarters.map((mm, i) => (
          <i
            key={i}
            className="block min-h-[3px] rounded-t-[3px] rounded-b-[1px] bg-sky-400 transition-[height] duration-500"
            style={{ height: `${Math.max(3, Math.min(1, mm / FULL_MM) * 28)}px`, opacity: mm >= 0.1 ? 0.45 + Math.min(1, mm / FULL_MM) * 0.55 : 0.25 }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] tabular-nums text-faint" aria-hidden="true">
        {TICKS.map((tick, i) => (
          <span key={tick}>{i === 0 ? t("weather.now") : tick}</span>
        ))}
      </div>
    </section>
  );
}
