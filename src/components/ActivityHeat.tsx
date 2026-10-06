import { LOCALE, t } from "../i18n";
import { hourlyHeat, peakWindow } from "../lib/activity";
import type { Day } from "../lib/activityView";

/** Hours of the day against the last days: the darker the cell, the more active time in that hour. */
export default function ActivityHeat({ days }: { days: Day[] }) {
  const rows = [...days].reverse().map((d) => ({ day: d.day, hours: hourlyHeat(d.spans, Math.floor(d.day / 1000)) }));
  const used = rows.flatMap((r) => r.hours.flatMap((v, h) => (v > 0 ? [h] : [])));
  if (used.length === 0) return null;
  const from = Math.min(8, ...used);
  const to = Math.max(18, ...used);
  const cols = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const max = Math.max(...rows.flatMap((r) => r.hours));
  const peak = peakWindow(rows.map((r) => r.hours));
  const name = (ms: number) => new Date(ms).toLocaleDateString(LOCALE, { weekday: "short" });
  return (
    <section className="rounded-2xl border border-edge bg-panel p-3.5" aria-label={t("activity.heat")}>
      <h3 className="mb-2.5 flex items-baseline justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {t("activity.heat")}
        <span className="text-[10.5px] font-normal normal-case tracking-normal text-faint">{t("activity.heatHint")}</span>
      </h3>
      <div className="grid gap-[3px] text-[10px] text-faint" style={{ gridTemplateColumns: `2.2rem repeat(${cols.length}, minmax(0, 1fr))` }}>
        <span />
        {cols.map((h) => (
          <span key={h} className="text-center font-mono tabular-nums">{h % 2 === 0 ? h : ""}</span>
        ))}
        {rows.map((r) => (
          <div key={r.day} className="contents">
            <span className="flex items-center truncate">{name(r.day)}</span>
            {cols.map((h) => (
              <span key={h} title={`${name(r.day)} ${h}h`} className="h-[17px] rounded bg-accent" style={{ opacity: r.hours[h] ? 0.16 + (r.hours[h] / max) * 0.84 : 0.06 }} />
            ))}
          </div>
        ))}
      </div>
      {peak && <p className="mt-2.5 text-[11px] text-faint">{t("activity.peak", { from: peak[0], to: peak[1] })}</p>}
    </section>
  );
}
