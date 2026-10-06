import type { AgendaItem, Task } from "../lib/api";
import { duration } from "../lib/agendaFree";
import { dayStats, horizonMin, minuteOf, ribbon, type RibbonSegment } from "../lib/agendaRail";
import { hhmm } from "../lib/dayPlan";
import { t } from "../i18n";

const LOOK: Record<RibbonSegment["kind"], string> = {
  gap: "bg-ok/25 border-x border-dashed border-ok/60",
  event: "bg-sky-500/80",
  task: "top-[62%] bg-accent/80 [background-image:repeating-linear-gradient(45deg,transparent_0_3px,var(--color-ink)_3px_6px)]",
};
const TONE = {
  solid: "",
  tentative: "[background-image:repeating-linear-gradient(45deg,transparent_0_4px,var(--color-ink)_4px_8px)] bg-warn/70",
  pending: "!bg-transparent border border-dashed border-line",
};

function Kpi({ label, value, hint, bad }: { label: string; value: string; hint: string; bad?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl border border-edge bg-ink/60 px-2 py-1.5">
      <span className="block truncate text-[10px] text-faint">{label}</span>
      <b className={`block truncate font-mono text-sm tabular-nums ${bad ? "text-danger" : "text-fg"}`}>{value}</b>
      <span className="block truncate text-[10px] text-muted">{hint}</span>
    </div>
  );
}

/** The whole day on one strip, with three numbers about it. */
export default function AgendaRibbon({ items, tasks, now }: { items: AgendaItem[]; tasks: Task[]; now: Date }) {
  const r = ribbon(items, tasks, now);
  const stats = dayStats(items, tasks, now);
  const pos = (m: number) => `${((m - r.from) / (r.to - r.from)) * 100}%`;
  const size = (s: RibbonSegment) => `${((Math.min(s.end, r.to) - Math.max(s.start, r.from)) / (r.to - r.from)) * 100}%`;
  const at = minuteOf(now);
  return (
    <section aria-label={t("agenda.ribbon.title")} className="rounded-2xl border border-edge bg-ink/60 p-3">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{t("agenda.ribbon.title")}</h3>
      <div role="img" aria-label={t("agenda.ribbon.label", { from: r.from / 60, to: r.to / 60 })} className="relative h-6 overflow-hidden rounded-lg bg-edge">
        {r.segments.map((s) => (
          <i key={s.id} className={`absolute inset-y-0 min-w-[3px] ${LOOK[s.kind]} ${s.kind === "event" ? TONE[s.tone] : ""}`} style={{ left: pos(Math.max(s.start, r.from)), width: size(s) }} />
        ))}
        {at >= r.from && at <= r.to && <span className="absolute -inset-y-0.5 w-0.5 bg-fg" style={{ left: pos(at) }} />}
      </div>
      <div aria-hidden="true" className="relative mt-1 h-3 text-[10px] text-faint">
        {r.ticks.map((h) => (
          <span key={h} className="absolute -translate-x-1/2 font-mono tabular-nums" style={{ left: pos(h * 60) }}>
            {h}h
          </span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <Kpi label={t("agenda.ribbon.meetings")} value={duration(stats.meetings)} hint={t("agenda.ribbon.events", { n: stats.events })} />
        <Kpi
          label={t("agenda.ribbon.free", { end: hhmm(horizonMin(now) % (24 * 60)) })}
          value={duration(stats.free)}
          hint={stats.nextFree === null ? "—" : t("agenda.ribbon.nextAt", { start: hhmm(stats.nextFree) })}
        />
        <Kpi
          label={t("agenda.ribbon.clashes")}
          value={String(stats.clashes)}
          hint={stats.clashes ? t("agenda.ribbon.seeCards") : t("agenda.ribbon.none")}
          bad={stats.clashes > 0}
        />
      </div>
    </section>
  );
}
