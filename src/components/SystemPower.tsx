import { fixed, minutesLabel, percent } from "../lib/system";
import type { SystemBattery, SystemSnapshot } from "../lib/systemTypes";
import { t } from "../i18n";
import { Card, Meter, Row } from "./SystemBits";

function BatteryGlyph({ b }: { b: SystemBattery }) {
  const low = b.percent <= 20 && b.state === "discharging";
  const plugged = b.state !== "discharging" && b.state !== "unknown";
  return (
    <svg viewBox="0 0 64 32" className="h-10 w-20 shrink-0" aria-hidden="true">
      <rect x="1.5" y="1.5" width="55" height="29" rx="7" fill="none" stroke="var(--color-line)" strokeWidth="2" />
      <rect x="58" y="10" width="4.5" height="12" rx="2" fill="var(--color-line)" />
      <rect x="5" y="5" width={Math.max(3, (48 * b.percent) / 100)} height="22" rx="4.5" className="canto-grow-x" fill={low ? "var(--color-danger)" : "var(--color-accent)"} opacity="0.85" />
      {plugged && <path d="M31 7l-7 10h6l-2 8 8-11h-6z" fill="var(--color-ink)" stroke="var(--color-fg)" strokeWidth="1.2" strokeLinejoin="round" />}
    </svg>
  );
}

/** The battery in the spotlight, its details and how much of its original capacity is left. */
export default function SystemPower({ snap }: { snap: SystemSnapshot }) {
  const b = snap.battery;
  if (!b) {
    return (
      <Card index={0} title={t("system.sub.power")}>
        <p className="text-[11.5px] leading-snug text-muted">{t("system.power.none")}</p>
      </Card>
    );
  }
  const time = b.minutes !== null ? t(b.state === "charging" ? "system.power.toFull" : "system.power.left", { time: minutesLabel(b.minutes) }) : "";
  const worn = b.health > 0 && b.health < 80;
  return (
    <div className="flex flex-col gap-2" data-system-power>
      <section className="wx-glass wx-rise flex flex-col items-center gap-2 p-4">
        <div className="flex items-center gap-3">
          <BatteryGlyph b={b} />
          <span className="tabular-nums text-fg">
            <span className="text-[34px] font-semibold leading-none">{fixed(b.percent)}</span>
            <span className="ml-0.5 text-sm text-muted">%</span>
          </span>
        </div>
        <span className="rounded-full border border-edge px-2.5 py-0.5 text-[11px] text-muted">
          {t(`system.power.state.${b.state}`)}
          {time && ` · ${time}`}
        </span>
      </section>
      <Card index={1} title={t("system.power.details")}>
        <dl>
          {b.rate_w > 0 && <Row label={t("system.power.rate")} value={`${fixed(b.rate_w, 1)} W`} />}
          {b.temp_c !== null && <Row label={t("system.power.temp")} value={`${fixed(b.temp_c)} °C`} />}
          {b.health > 0 && <Row label={t("system.power.health")} value={`${fixed(b.health, 1)}%`} tone={worn ? "text-danger" : "text-warn"} />}
          {b.cycles !== null && <Row label={t("system.power.cycles")} value={fixed(b.cycles)} />}
          {b.voltage_v > 0 && <Row label={t("system.power.voltage")} value={`${fixed(b.voltage_v, 2)} V`} />}
        </dl>
        {b.design_wh > 0 && (
          <div className="mt-1 flex flex-col gap-1.5 border-t border-edge pt-2">
            <div className="flex justify-between text-[10.5px] text-muted">
              <span>{t("system.power.full")}</span>
              <span>{t("system.power.design")}</span>
            </div>
            <div className="flex justify-between text-[15px] font-semibold tabular-nums text-fg">
              <span>{fixed(b.full_wh, 1)} Wh</span>
              <span>{fixed(b.design_wh, 1)} Wh</span>
            </div>
            <Meter value={percent(b.full_wh, b.design_wh)} level={worn ? "danger" : "warn"} label={t("system.power.health")} />
          </div>
        )}
      </Card>
    </div>
  );
}
