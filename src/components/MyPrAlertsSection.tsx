import { useEffect, useState } from "react";
import { api, errText, type MyPrAlerts } from "../lib/api";
import { t } from "../i18n";

const HOURS = [24, 48, 72];

/** Switches for the pop-ups Rust rings about the user's own PRs: failing CI and PRs nobody reviewed. */
export default function MyPrAlertsSection({ onError }: { onError: (m: string) => void }) {
  const [cfg, setCfg] = useState<MyPrAlerts | null>(null);

  useEffect(() => {
    api.myPrAlertsGet().then(setCfg, (e) => onError(errText(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function change(patch: Partial<MyPrAlerts>) {
    if (!cfg) return;
    try {
      setCfg(await api.myPrAlertsSet({ ...cfg, ...patch }));
    } catch (e) {
      onError(errText(e));
    }
  }

  const box = "canto-box";
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1 text-xs font-semibold text-fg">{t("settings.myPrAlerts.title")}</legend>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={cfg?.ci ?? false} disabled={!cfg} onChange={(e) => void change({ ci: e.target.checked })} className={box} />
        {t("settings.myPrAlerts.ci")}
      </label>
      <label className="flex min-h-[24px] flex-wrap items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={cfg?.stalled ?? false}
          disabled={!cfg}
          onChange={(e) => void change({ stalled: e.target.checked })}
          className={box}
        />
        {t("settings.myPrAlerts.stalled")}
        <select
          aria-label={t("settings.myPrAlerts.stalled")}
          value={cfg?.stalled_hours ?? 48}
          disabled={!cfg?.stalled}
          onChange={(e) => void change({ stalled_hours: Number(e.target.value) })}
          className="rounded border border-edge bg-ink px-1.5 py-0.5 text-xs text-fg"
        >
          {(cfg && !HOURS.includes(cfg.stalled_hours) ? [...HOURS, cfg.stalled_hours] : HOURS).map((h) => (
            <option key={h} value={h}>
              {t("settings.myPrAlerts.hours", { h })}
            </option>
          ))}
        </select>
      </label>
      <p className="text-[11px] text-faint">{t("settings.myPrAlerts.hint")}</p>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={cfg?.mentions ?? false}
          disabled={!cfg}
          onChange={(e) => void change({ mentions: e.target.checked })}
          className={box}
        />
        {t("settings.myPrAlerts.mentions")}
      </label>
      <p className="text-[11px] text-faint">{t("settings.myPrAlerts.mentionsHint")}</p>
    </fieldset>
  );
}
