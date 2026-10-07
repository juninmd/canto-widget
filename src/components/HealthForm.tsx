import { useState } from "react";
import { t } from "../i18n";
import { blankEndpoint, draftError, everyLabel, INTERVALS, LIMITS } from "../lib/health";
import type { HealthEndpoint, HealthKind } from "../lib/healthTypes";

const KINDS: HealthKind[] = ["http", "dns", "tcp"];
const FIELD = "canto-field w-full px-2.5 py-1.5 text-xs";

/** New endpoint, in the same wide shape as an open one: the kind picks which target fields exist. */
export default function HealthForm({ onSave, onCancel }: { onSave: (e: HealthEndpoint) => void; onCancel: () => void }) {
  const [e, setE] = useState<HealthEndpoint>(() => blankEndpoint("http"));
  const [error, setError] = useState<ReturnType<typeof draftError>>(null);
  const set = (patch: Partial<HealthEndpoint>) => setE((cur) => ({ ...cur, ...patch }));

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const bad = draftError(e);
    setError(bad);
    if (!bad) onSave({ ...e, name: e.name.trim(), url: e.url?.trim(), host: e.host?.trim() });
  }

  return (
    <form onSubmit={submit} aria-label={t("health.newTitle")} className="col-span-2 flex flex-col gap-2 rounded-xl border border-accent bg-panel p-3 text-xs text-muted">
      <div role="group" aria-label={t("health.field.kind")} className="flex">
        {KINDS.map((k, i) => (
          <button
            key={k}
            type="button"
            aria-pressed={e.kind === k}
            onClick={() => {
              setError(null);
              setE({ ...blankEndpoint(k), name: e.name });
            }}
            className={`canto-hit min-h-[28px] flex-1 border border-edge px-2 ${i === 0 ? "rounded-l-lg" : ""} ${i === KINDS.length - 1 ? "rounded-r-lg" : ""} ${e.kind === k ? "border-accent bg-accent/10 text-accent-text" : "hover:bg-hover"}`}
          >
            {t(`health.kind.${k}`)}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1">
        {t("health.field.name")}
        <input value={e.name} onChange={(ev) => set({ name: ev.target.value })} maxLength={60} className={FIELD} />
      </label>
      {e.kind === "http" ? (
        <label className="flex flex-col gap-1">
          {t("health.field.url")}
          <input value={e.url ?? ""} onChange={(ev) => set({ url: ev.target.value })} placeholder="https://api.exemplo.dev/health" className={FIELD} />
        </label>
      ) : (
        <div className="grid grid-cols-[1fr_5.5rem] gap-2">
          <label className="flex flex-col gap-1">
            {t("health.field.host")}
            <input value={e.host ?? ""} onChange={(ev) => set({ host: ev.target.value })} placeholder={e.kind === "dns" ? "exemplo.dev" : "db.interno"} className={FIELD} />
          </label>
          <label className="flex flex-col gap-1">
            {t("health.field.port")}
            <input
              type="number"
              min={1}
              max={65535}
              value={e.port ?? ""}
              onChange={(ev) => set({ port: ev.target.value === "" ? undefined : Number(ev.target.value) })}
              className={FIELD}
            />
          </label>
        </div>
      )}
      {e.kind === "dns" && <p className="text-[11px] text-faint">{t("health.dnsHint")}</p>}
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          {t("health.field.every")}
          <select value={e.every_secs} onChange={(ev) => set({ every_secs: Number(ev.target.value) })} className={FIELD}>
            {INTERVALS.map((v) => (
              <option key={v} value={v}>
                {everyLabel(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          {t("health.field.limit")}
          <select value={e.limit_ms} onChange={(ev) => set({ limit_ms: Number(ev.target.value) })} className={FIELD}>
            {LIMITS.map((v) => (
              <option key={v} value={v}>
                {v} ms
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
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
      {error && (
        <p role="alert" className="text-danger">
          {t(`health.err.${error}`)}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className="canto-hit min-h-[28px] rounded-lg bg-accent px-3 font-semibold text-on-accent hover:brightness-110">
          {t("health.save")}
        </button>
        <button type="button" onClick={onCancel} className="canto-hit min-h-[28px] rounded-lg border border-edge px-3 hover:bg-hover">
          {t("health.cancel")}
        </button>
      </div>
    </form>
  );
}
