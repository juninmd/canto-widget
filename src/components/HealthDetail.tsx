import { t } from "../i18n";
import { certDays, everyLabel, INTERVALS, LIMITS, stats, targetLabel, lastOf } from "../lib/health";
import type { HealthEndpoint, HealthView } from "../lib/healthTypes";
import LatencyChart from "./LatencyChart";

const PILL = { up: "bg-ok/15 text-ok", slow: "bg-warn/15 text-warn", down: "bg-danger/15 text-danger", unknown: "bg-edge text-muted" } as const;
const BIG = { up: "text-fg", slow: "text-warn", down: "text-danger", unknown: "text-faint" } as const;
const GHOST = "canto-hit min-h-[28px] rounded-lg border border-edge px-2.5 text-xs text-muted hover:bg-hover hover:text-fg active:bg-active";

type Props = {
  view: HealthView;
  busy: boolean;
  onClose: () => void;
  onChange: (e: HealthEndpoint) => void;
  onCheck: () => void;
  onRemove: () => void;
};

/** Open state of an endpoint: it takes the whole row, with the chart, the numbers and the settings. */
export default function HealthDetail({ view, busy, onClose, onChange, onCheck, onRemove }: Props) {
  const { endpoint: e, health, samples } = view;
  const s = stats(samples);
  const last = lastOf(samples);
  const days = certDays(samples);
  const set = (patch: Partial<HealthEndpoint>) => onChange({ ...e, ...patch });
  return (
    <section aria-label={e.name} className="col-span-2 flex flex-col gap-2.5 rounded-xl border border-edge border-t-[3px] bg-panel p-3">
      <button type="button" aria-expanded onClick={onClose} aria-label={t("health.collapse", { name: e.name })} className="canto-hit flex w-full items-center gap-2 text-left">
        <span className="min-w-0 flex-1">
          <b className="block text-sm [overflow-wrap:anywhere]">{e.name}</b>
          <span className="block text-[11px] text-faint [overflow-wrap:anywhere]">{targetLabel(e)}</span>
        </span>
        <span className={`rounded-full px-2 text-[11px] font-bold ${PILL[health]}`}>{t(`health.state.${health}`)}</span>
        <span aria-hidden="true" className="text-faint">
          ▴
        </span>
      </button>
      <div className={`text-[26px] font-bold leading-none tabular-nums ${BIG[health]}`}>
        {health === "down" ? t("health.state.down") : last?.ms != null ? `${last.ms}` : "—"}
        {health !== "down" && last?.ms != null && <small className="text-xs font-semibold text-faint"> {t("health.msNow")}</small>}
      </div>
      {health === "down" && last?.err && <p className="text-xs text-danger">{last.err}</p>}
      <LatencyChart name={e.name} samples={samples} limit={e.limit_ms} state={health} />
      {s && (
        <dl className="grid grid-cols-4 gap-1.5 text-center">
          {[
            [s.median, t("health.stat.median")],
            [s.p95, t("health.stat.p95")],
            [s.peak, t("health.stat.peak")],
            [`${s.uptime}%`, t("health.stat.uptime")],
          ].map(([v, label]) => (
            <div key={label}>
              <dd className="text-[15px] font-semibold tabular-nums">{v}</dd>
              <dt className="text-[10px] text-faint">{label}</dt>
            </div>
          ))}
        </dl>
      )}
      {e.kind === "dns" && days !== null && (
        <p className={`text-xs ${days <= 14 ? "text-warn" : "text-muted"}`}>{days < 0 ? t("health.cert.expired") : t("health.cert.long", { n: days })}</p>
      )}
      <div className="grid grid-cols-2 items-end gap-2 text-xs text-muted">
        <div role="group" aria-label={t("health.field.every")} className="flex flex-col gap-1">
          {t("health.field.every")}
          <span className="flex">
            {INTERVALS.map((v, i) => (
              <button
                key={v}
                type="button"
                aria-pressed={e.every_secs === v}
                onClick={() => set({ every_secs: v })}
                className={`canto-hit min-h-[28px] flex-1 border border-edge px-2 ${i === 0 ? "rounded-l-lg" : ""} ${i === INTERVALS.length - 1 ? "rounded-r-lg" : ""} ${e.every_secs === v ? "border-accent bg-accent/10 text-accent-text" : "hover:bg-hover"}`}
              >
                {everyLabel(v)}
              </button>
            ))}
          </span>
        </div>
        <label className="flex flex-col gap-1">
          {t("health.field.limit")}
          <select
            value={e.limit_ms}
            onChange={(ev) => set({ limit_ms: Number(ev.target.value) })}
            className="canto-hit min-h-[28px] rounded-lg border border-edge bg-ink px-2 text-fg outline-none focus:border-accent"
          >
            {[...new Set([...LIMITS, e.limit_ms])].sort((a, b) => a - b).map((v) => (
              <option key={v} value={v}>
                {v} ms
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={e.alert_down} onChange={(ev) => set({ alert_down: ev.target.checked })} />
          {t("health.alert.down")}
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={e.alert_slow} onChange={(ev) => set({ alert_slow: ev.target.checked })} />
          {t("health.alert.slow")}
        </label>
        {e.kind === "dns" && (
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={e.alert_cert} onChange={(ev) => set({ alert_cert: ev.target.checked })} />
            {t("health.alert.cert", { days: 14 })}
          </label>
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCheck} disabled={busy} className={GHOST}>
          {busy ? "..." : t("health.checkNow")}
        </button>
        <button type="button" onClick={onRemove} className={`${GHOST} ml-auto hover:!text-danger`}>
          {t("health.remove")}
        </button>
      </div>
    </section>
  );
}
