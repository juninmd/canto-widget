import type { CSSProperties } from "react";
import { t } from "../i18n";
import { appName, barBox, categoryOf, CATEGORY_COLOR, hourRange, secsLabel, timelineRows } from "../lib/activity";
import type { ActivityAway, ActivitySpan } from "../lib/api";
import { axisTicks, clockOf, type Apps } from "../lib/activityView";

const HATCH = "repeating-linear-gradient(45deg, color-mix(in oklab, var(--color-faint) 60%, transparent) 0 2px, transparent 2px 5px)";
const LABEL = "truncate text-[11.5px] text-muted";

/** The day on one time axis: every row (the whole day, the idle stretches, the busiest apps) lines up under the same hours. */
export default function ActivityTimeline({ spans, allSpans, idle, apps, dayStartMs, nowSec }: {
  spans: ActivitySpan[];
  allSpans: ActivitySpan[];
  idle: ActivityAway[];
  apps: Apps;
  dayStartMs: number;
  nowSec: number | null;
}) {
  const daySec = Math.floor(dayStartMs / 1000);
  const range = hourRange(allSpans, daySec);
  const ticks = axisTicks(range);
  const at = (hour: number) => `${((hour - range[0]) / (range[1] - range[0])) * 100}%`;
  const place = (start: number, end: number): CSSProperties => {
    const box = barBox({ app: "", start, end }, daySec, range);
    return { left: `${box.left}%`, width: `${box.width}%` };
  };
  const tip = (app: string, s: ActivitySpan) => `${appName(app)} ${clockOf(s.start)}–${clockOf(s.end)} (${secsLabel(s.end - s.start)})`;
  const lanes = timelineRows(spans, apps, 4);
  const rowCount = 1 + (idle.length ? 1 : 0) + lanes.length;
  const nowHour = nowSec === null ? null : (nowSec - daySec) / 3600;

  return (
    <section className="rounded-2xl border border-edge bg-panel p-3.5" aria-label={t("activity.timeline")}>
      <h3 className="mb-2.5 flex items-baseline justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {t("activity.timeline")}
        <span className="text-[10.5px] font-normal normal-case tracking-normal text-faint">{`${range[0]}h – ${range[1]}h`}</span>
      </h3>
      {spans.length === 0 ? (
        <p className="text-xs text-faint">{t("activity.noneSelected")}</p>
      ) : (
        <div className="relative grid grid-cols-[4.9rem_minmax(0,1fr)] items-center gap-x-2 gap-y-[7px] pt-3.5">
          <span className="col-start-1 row-start-1 truncate text-[11.5px] font-semibold text-fg">{t("activity.rowAll")}</span>
          <div className="relative col-start-2 row-start-1 h-6 overflow-hidden rounded-lg bg-edge">
            {spans.map((s) => (
              <span key={`${s.app}-${s.start}`} title={tip(s.app, s)} className={`absolute inset-y-0 min-w-[2px] ${CATEGORY_COLOR[categoryOf(s.app)]}`} style={place(s.start, s.end)} />
            ))}
          </div>
          {idle.length > 0 && (
            <>
              <span className={`${LABEL} col-start-1 row-start-2`}>{t("activity.idle")}</span>
              <div className="relative col-start-2 row-start-2 h-3 rounded-[5px] bg-edge/60">
                {idle.map((a) => (
                  <span
                    key={a.start}
                    title={`${t("activity.idleHint")} ${clockOf(a.start)}–${clockOf(a.end)} (${secsLabel(a.end - a.start)})`}
                    className="absolute inset-y-0 min-w-[2px] rounded-[3px] border border-dashed border-line"
                    style={{ ...place(a.start, a.end), backgroundImage: HATCH }}
                  />
                ))}
              </div>
            </>
          )}
          {lanes.map((r, i) => {
            const row = i + 1 + (idle.length ? 2 : 1);
            return (
              <div key={r.app} className="contents">
                <span className={`${LABEL} col-start-1`} style={{ gridRow: row }} title={r.app}>{appName(r.app)}</span>
                <div className="relative col-start-2 h-[13px] rounded bg-edge/60" style={{ gridRow: row }}>
                  {r.spans.map((s) => (
                    <span key={s.start} title={tip(r.app, s)} className={`absolute inset-y-0 min-w-[2px] rounded-[3px] ${CATEGORY_COLOR[categoryOf(r.app)]}`} style={place(s.start, s.end)} />
                  ))}
                </div>
              </div>
            );
          })}
          <div aria-hidden="true" className="pointer-events-none relative col-start-2 self-stretch" style={{ gridRow: `1 / span ${rowCount}` }}>
            {ticks.map((h) => (
              <span key={h} className="absolute inset-y-0 w-px bg-fg/10" style={{ left: at(h) }} />
            ))}
            {nowHour !== null && nowHour >= range[0] && nowHour <= range[1] && (
              <span className="absolute -bottom-1 -top-1.5 w-0.5 rounded bg-fg/90" style={{ left: at(nowHour) }}>
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded bg-panel px-1 text-[9.5px] text-muted">{t("activity.now")}</span>
              </span>
            )}
          </div>
          <div aria-hidden="true" className="relative col-start-2 h-3.5 text-[10px] text-faint" style={{ gridRow: rowCount + 1 }}>
            {ticks.map((h) => (
              <span key={h} className="absolute -translate-x-1/2 font-mono tabular-nums" style={{ left: at(h) }}>{h}h</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
