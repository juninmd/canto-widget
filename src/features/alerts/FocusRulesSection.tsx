import { useEffect, useState } from "react";
import { api, type FocusConfig } from "../../lib/api";
import { useSectionError } from "../settings/useSectionError";
import { t } from "../../i18n";
import { SettingsSection } from "../settings/SettingsSection";
import { localOffsetMin, minutesToTime, timeToMinutes } from "./focusMode";

/** Focus mode: the schedule and the meeting rule that switch do-not-disturb on without a click. */
export default function FocusRulesSection({ onError }: { onError: (m: string) => void }) {
  const [cfg, setCfg] = useState<FocusConfig | null>(null);
  const { error, fail, clear } = useSectionError(onError);

  const load = () => api.focusGet().then(setCfg, fail);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function change(patch: Partial<FocusConfig>) {
    if (!cfg) return;
    clear();
    try {
      setCfg(await api.focusSet({ ...cfg, ...patch, offset_min: localOffsetMin() }));
    } catch (e) {
      fail(e);
      await load();
    }
  }

  function pick(key: "start_min" | "end_min", value: string) {
    const minutes = timeToMinutes(value);
    if (minutes !== null) void change({ [key]: minutes });
  }

  const off = !cfg?.schedule;
  return (
    <SettingsSection title={t("settings.focusRules.title")} error={error}>
      <p className="text-xs text-muted">{t("settings.focusRules.hint")}</p>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={cfg?.schedule ?? false} disabled={!cfg} onChange={(e) => void change({ schedule: e.target.checked })} className="canto-box" />
        {t("settings.focusRules.schedule")}
      </label>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <label className="flex items-center gap-1.5">
          {t("settings.focusRules.from")}
          <input
            type="time"
            value={minutesToTime(cfg?.start_min ?? 540)}
            disabled={off}
            onChange={(e) => pick("start_min", e.target.value)}
            className="rounded border border-edge bg-ink px-1.5 py-0.5 text-xs text-fg"
          />
        </label>
        <label className="flex items-center gap-1.5">
          {t("settings.focusRules.to")}
          <input
            type="time"
            value={minutesToTime(cfg?.end_min ?? 720)}
            disabled={off}
            onChange={(e) => pick("end_min", e.target.value)}
            className="rounded border border-edge bg-ink px-1.5 py-0.5 text-xs text-fg"
          />
        </label>
      </div>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={cfg?.weekdays_only ?? true} disabled={off} onChange={(e) => void change({ weekdays_only: e.target.checked })} className="canto-box" />
        {t("settings.focusRules.weekdays")}
      </label>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={cfg?.in_meeting ?? false} disabled={!cfg} onChange={(e) => void change({ in_meeting: e.target.checked })} className="canto-box" />
        {t("settings.focusRules.meeting")}
      </label>
    </SettingsSection>
  );
}
