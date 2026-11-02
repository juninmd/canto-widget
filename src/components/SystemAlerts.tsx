import { useEffect, useState, type CSSProperties } from "react";
import { api, errText, SYSTEM_ALERT_KINDS, type SystemAlertKind } from "../lib/api";
import { t } from "../i18n";
import { BellIcon } from "./Icons";

const CHIP = "canto-hit flex min-h-[28px] items-center gap-1.5 rounded-md border px-2 text-left text-[11.5px] transition";

/** Which system alerts ring: one switch per kind, folded by default so the numbers stay first. */
export default function SystemAlerts({ index }: { index: number }) {
  const [on, setOn] = useState<string[] | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.systemAlertsGet().then((kinds) => setOn(kinds ?? []), (e) => setError(errText(e)));
  }, []);

  async function save(next: string[]) {
    const before = on;
    setOn(next);
    try {
      setOn((await api.systemAlertsSet(next)) ?? next);
      setError("");
    } catch (e) {
      setOn(before);
      setError(errText(e));
    }
  }

  const list = on ?? [];
  const toggle = (kind: SystemAlertKind) =>
    void save(list.includes(kind) ? list.filter((k) => k !== kind) : SYSTEM_ALERT_KINDS.filter((k) => k === kind || list.includes(k)));
  const all = list.length === SYSTEM_ALERT_KINDS.length;

  return (
    <section data-system-alerts className="wx-glass wx-rise flex shrink-0 flex-col gap-2 p-2" style={{ "--i": index } as CSSProperties}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="canto-hit flex min-h-[28px] items-center gap-2 rounded-md text-left text-xs text-fg">
        <span className={list.length > 0 ? "text-accent-text" : "text-faint"}>
          <BellIcon on={list.length > 0} />
        </span>
        <span className="flex-1 font-semibold">{t("system.alerts.title")}</span>
        <span className="text-[11px] text-muted tabular-nums">
          {list.length > 0 ? t("system.alerts.count", { n: list.length, total: SYSTEM_ALERT_KINDS.length }) : t("system.alerts.off")}
        </span>
        <span aria-hidden="true" className={`text-faint transition-transform ${open ? "rotate-90" : ""}`}>
          ›
        </span>
      </button>
      {open && (
        <>
          <p className="text-[11px] leading-snug text-muted">{t("system.alerts.hint")}</p>
          <div className="grid grid-cols-2 gap-1">
            {SYSTEM_ALERT_KINDS.map((kind) => {
              const active = list.includes(kind);
              return (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={active}
                  disabled={on === null}
                  onClick={() => toggle(kind)}
                  className={`${CHIP} ${active ? "border-accent/50 bg-accent/10 text-fg" : "border-edge text-muted hover:bg-hover"}`}
                >
                  <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${active ? "bg-accent" : "bg-edge"}`} />
                  <span className="truncate">{t(`system.alerts.kind.${kind}`)}</span>
                </button>
              );
            })}
          </div>
          <button type="button" disabled={on === null} onClick={() => void save(all ? [] : [...SYSTEM_ALERT_KINDS])} className="canto-hit self-end rounded-md px-2 text-[11px] text-accent-text hover:bg-hover">
            {all ? t("system.alerts.none") : t("system.alerts.all")}
          </button>
        </>
      )}
      {error && (
        <p role="alert" className="text-[11px] text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
