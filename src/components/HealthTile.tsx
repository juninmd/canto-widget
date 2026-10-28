import { t } from "../i18n";
import { certDays, lastOf, stats } from "../lib/health";
import type { HealthState, HealthView } from "../lib/healthTypes";
import { ChevronIcon } from "./Icons";
import StatePill, { type StateTone } from "./StatePill";

const BORDER = { up: "border-t-ok", slow: "border-t-warn", down: "border-t-danger", unknown: "border-t-edge" } as const;
const BIG = { up: "text-fg", slow: "text-warn", down: "text-danger", unknown: "text-faint" } as const;
const TONE: Record<HealthState, StateTone> = { up: "ok", slow: "warn", down: "bad", unknown: "neutral" };

/** Closed state of an endpoint: its state as a word, the latest latency, the last 24 readings as bars and one line of numbers.
 *  `shrink-0`: the list is a scrolling flex column and `canto-hit` sets min-height, which drops the flex
 *  `min-height: auto` floor; without it the tiles shrink to fit and the next one covers the latency and bars. */
export default function HealthTile({ view, onOpen }: { view: HealthView; onOpen: () => void }) {
  const { endpoint: e, health, samples } = view;
  const last = lastOf(samples);
  const s = stats(samples);
  const days = certDays(samples);
  return (
    <button
      type="button"
      aria-expanded={false}
      onClick={onOpen}
      className={`canto-hit flex min-w-0 shrink-0 flex-col gap-1.5 rounded-xl border border-t-[3px] border-edge bg-panel p-2.5 text-left hover:bg-hover ${BORDER[health]}`}
    >
      <span className="flex items-center gap-2">
        <b className="min-w-0 flex-1 text-xs [overflow-wrap:anywhere]">{e.name}</b>
        {(e.alert_down || e.alert_slow || e.alert_cert) && <span aria-label={t("health.alertsOn")} role="img" className="text-[11px]">🔔</span>}
        <StatePill tone={TONE[health]} pulse={health === "down"}>
          {t(`health.state.${health}`)}
        </StatePill>
        <span aria-hidden="true" className="shrink-0 text-faint">
          <ChevronIcon dir="right" />
        </span>
      </span>
      <span className="flex items-end gap-3">
        <span className={`text-[22px] font-bold leading-none tabular-nums ${BIG[health]}`}>
          {health !== "down" && last?.ms != null ? last.ms : "—"}
          {health !== "down" && last?.ms != null && <small className="text-[11px] font-semibold text-faint"> ms</small>}
        </span>
        <span aria-hidden="true" className="flex h-[18px] min-w-0 flex-1 items-end gap-px">
          {samples.slice(-24).map((x, i) => (
            <i
              key={i}
              className={`min-w-[2px] flex-1 rounded-sm ${x.ms === null ? "bg-danger" : x.ms > e.limit_ms ? "bg-warn" : "bg-ok"}`}
              style={{ height: x.ms === null ? "100%" : `${Math.max(25, Math.min(100, (x.ms / e.limit_ms) * 60))}%` }}
            />
          ))}
        </span>
      </span>
      <span className="text-[11px] text-faint">
        {e.kind === "dns" && days !== null
          ? days < 0
            ? t("health.cert.expired")
            : t("health.cert.short", { n: days })
          : s
            ? t("health.tileStats", { up: s.uptime, p95: s.p95 })
            : t("health.waiting")}
      </span>
    </button>
  );
}
