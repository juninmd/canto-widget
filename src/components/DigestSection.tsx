import { useEffect, useState } from "react";
import { api, type MorningDigest } from "../lib/api";
import { useSectionError } from "../lib/useSectionError";
import { t } from "../i18n";
import { SettingsSection } from "./SettingsSection";

const HOURS = [6, 7, 8, 9, 10, 11, 12];

/** The morning summary: a switch, the hour it starts at and whether weekends are skipped. */
export default function DigestSection({ onError }: { onError: (m: string) => void }) {
  const [cfg, setCfg] = useState<MorningDigest | null>(null);
  const { error, fail, clear } = useSectionError(onError);

  const load = () => api.morningDigestGet().then(setCfg, fail);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function change(patch: Partial<MorningDigest>) {
    if (!cfg) return;
    clear();
    try {
      setCfg(await api.morningDigestSet({ ...cfg, ...patch }));
    } catch (e) {
      fail(e);
      await load();
    }
  }

  const hours = cfg && !HOURS.includes(cfg.hour) ? [...HOURS, cfg.hour].sort((a, b) => a - b) : HOURS;
  return (
    <SettingsSection title={t("settings.digest.title")} error={error}>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={cfg?.enabled ?? false} disabled={!cfg} onChange={(e) => void change({ enabled: e.target.checked })} className="canto-box" />
        {t("settings.digest.enabled")}
      </label>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        {t("settings.digest.at")}
        <select
          value={cfg?.hour ?? 9}
          disabled={!cfg?.enabled}
          onChange={(e) => void change({ hour: Number(e.target.value) })}
          className="rounded border border-edge bg-ink px-1.5 py-0.5 text-xs text-fg"
        >
          {hours.map((h) => (
            <option key={h} value={h}>
              {t("settings.digest.hourOption", { h })}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={cfg?.weekdays_only ?? true}
          disabled={!cfg?.enabled}
          onChange={(e) => void change({ weekdays_only: e.target.checked })}
          className="canto-box"
        />
        {t("settings.digest.weekdays")}
      </label>
      <p className="text-[11px] text-faint">{t("settings.digest.hint")}</p>
    </SettingsSection>
  );
}
