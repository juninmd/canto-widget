import { t } from "../i18n";
import { barBox, byCategory, categoryOf, CATEGORY_COLOR, focusStats, hourRange, secsLabel, timelineRows, weekStats } from "../lib/activity";
import type { ActivitySpan } from "../lib/api";

type Apps = { app: string; secs: number }[];
export type Day = { day: number; apps: Apps; spans: ActivitySpan[] };

const H3 = "text-[11px] font-semibold uppercase tracking-wide text-muted";
const clock = (sec: number) => new Date(sec * 1000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

export function TodayView({ spans, apps, yesterdaySpans, dayStartMs, nowSec }: {
  spans: ActivitySpan[];
  apps: Apps;
  yesterdaySpans: ActivitySpan[];
  dayStartMs: number;
  nowSec: number;
}) {
  const daySec = Math.floor(dayStartMs / 1000);
  const range = hourRange(spans, daySec);
  const total = apps.reduce((s, a) => s + a.secs, 0);
  const now = barBox({ app: "", start: nowSec, end: nowSec }, daySec, range).left;
  const showNow = nowSec >= daySec + range[0] * 3600 && nowSec <= daySec + range[1] * 3600;
  const stats = focusStats(spans);
  const ticks = [range[0], Math.round((range[0] * 2 + range[1]) / 3), Math.round((range[0] + range[1] * 2) / 3), range[1]];
  const top = apps.slice(0, 6);
  return (
    <>
      <section className="flex flex-col gap-1.5" aria-label={t("activity.timeline")}>
        <h3 className={H3}>{t("activity.timeline")}</h3>
        {timelineRows(spans, apps).map((r) => (
          <div key={r.app} className="grid grid-cols-[4.5rem_1fr] items-center gap-2 text-[11px]">
            <span className="truncate text-muted" title={r.app}>{r.app}</span>
            <span className="relative h-3.5 overflow-hidden rounded bg-edge">
              {r.spans.map((s) => {
                const box = barBox(s, daySec, range);
                return <span key={s.start} title={`${r.app} ${clock(s.start)}–${clock(s.end)} (${secsLabel(s.end - s.start)})`} className={`absolute inset-y-0 min-w-[2px] ${CATEGORY_COLOR[categoryOf(s.app)]}`} style={{ left: `${box.left}%`, width: `${box.width}%` }} />;
              })}
              {showNow && <span title={t("activity.now")} className="absolute inset-y-0 w-0.5 bg-fg opacity-70" style={{ left: `${now}%` }} />}
            </span>
          </div>
        ))}
        <div className="grid grid-cols-[4.5rem_1fr] gap-2 text-[10px] text-faint">
          <span />
          <span className="flex justify-between font-mono tabular-nums">{ticks.map((h) => <span key={h}>{h}h</span>)}</span>
        </div>
        {showNow && <p className="text-[10px] text-faint">{t("activity.nowHint")}</p>}
      </section>
      <section className="flex flex-col gap-1">
        <h3 className={H3}>{t("activity.topApps")}</h3>
        <ul className="flex flex-col gap-2 text-xs">
          {top.map((a) => (
            <li key={a.app} className="grid grid-cols-[0.5rem_1fr_auto] items-center gap-x-2 gap-y-1">
              <span className={`h-2 w-2 rounded-full ${CATEGORY_COLOR[categoryOf(a.app)]}`} />
              <span className="truncate text-fg">{a.app}</span>
              <span className="font-mono tabular-nums text-muted">{secsLabel(a.secs)}<span className="ml-1.5 text-[11px] text-faint">{Math.round((a.secs / total) * 100)}%</span></span>
              <span className="col-span-2 col-start-2 h-1 overflow-hidden rounded-full bg-edge">
                <span className={`block h-full ${CATEGORY_COLOR[categoryOf(a.app)]}`} style={{ width: `${(a.secs / top[0].secs) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-1.5">
        <h3 className={H3}>{t("activity.focusDay")}</h3>
        <div className="grid grid-cols-2 gap-2">
          <Stat label={t("activity.longest")} value={secsLabel(stats.longest.secs)} sub={`${stats.longest.app} · ${clock(stats.longest.start)}`} />
          <Stat label={t("activity.switches")} value={String(stats.switches)} sub={yesterdaySpans.length ? t("activity.yesterdaySwitches", { n: focusStats(yesterdaySpans).switches }) : ""} />
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg border border-edge p-2">
      <span className="text-[11px] text-faint">{label}</span>
      <span className="font-mono text-lg font-bold tabular-nums text-fg">{value}</span>
      <span className="truncate text-[11px] text-faint">{sub}</span>
    </div>
  );
}

export function WeekView({ days }: { days: Day[] }) {
  const totals = days.map((d) => d.apps.reduce((sum, a) => sum + a.secs, 0));
  const max = Math.max(1, ...totals);
  const { average, best } = weekStats(totals);
  const label = (ms: number) => new Date(ms).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "2-digit" });
  return (
    <section className="flex flex-col gap-2" aria-label={t("activity.weekDays")}>
      <h3 className={H3}>{t("activity.weekDays")}</h3>
      <ul className="relative flex flex-col gap-2">
        {days.map((d, i) => (
          <li key={d.day} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2 text-xs">
            <span className={`truncate ${i === 0 ? "font-semibold text-fg" : "text-muted"}`}>{label(d.day)}</span>
            <span className="relative flex h-3 items-center">
              <span className="flex h-3 overflow-hidden rounded bg-edge" style={{ width: `${(totals[i] / max) * 100}%`, minWidth: totals[i] ? "2px" : 0 }}>
                {byCategory(d.apps).map((c) => (
                  <span key={c.category} className={CATEGORY_COLOR[c.category]} title={`${t(`activity.cat.${c.category}` as const)} ${secsLabel(c.secs)}`} style={{ width: `${(c.secs / totals[i]) * 100}%` }} />
                ))}
              </span>
              {average > 0 && <span aria-hidden className="absolute -inset-y-0.5 border-l-2 border-dashed border-faint" style={{ left: `${(average / max) * 100}%` }} />}
            </span>
            <span className="text-right font-mono tabular-nums text-muted">{totals[i] ? secsLabel(totals[i]) : "—"}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-faint">{t("activity.avgHint")}</p>
      {best >= 0 && <p className="text-xs text-muted">{t("activity.bestDay", { day: label(days[best].day), time: secsLabel(totals[best]), avg: secsLabel(average) })}</p>}
    </section>
  );
}
