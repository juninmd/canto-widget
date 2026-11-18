import { useEffect, useState } from "react";
import { api, type BarAgendaConfig } from "../../lib/api";
import { useSectionError } from "./useSectionError";
import { t } from "../../i18n";
import { SettingsSection } from "./SettingsSection";

/** Off by default: the next events in the OS bar (menu bar, tray label, or a strip over the Windows taskbar). */
export default function BarAgendaSection({ onError }: { onError: (m: string) => void }) {
  const [cfg, setCfg] = useState<BarAgendaConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const { error, fail, clear } = useSectionError(onError);

  const load = () => api.barAgendaGet().then(setCfg, fail);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Held while saving: a second change before Rust answers would race the first.
  async function save(next: BarAgendaConfig) {
    if (saving) return;
    setSaving(true);
    clear();
    try {
      setCfg(await api.barAgendaSet(next));
    } catch (e) {
      fail(e);
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSection title={t("settings.barAgenda.title")} error={error}>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={cfg?.enabled ?? false}
          disabled={!cfg || saving}
          onChange={(e) => cfg && void save({ ...cfg, enabled: e.target.checked })}
          className="canto-box"
        />
        {t("settings.barAgenda.label")}
      </label>
      {cfg?.enabled && (
        <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
          {t("settings.barAgenda.count")}
          <select
            value={cfg.count}
            disabled={saving}
            onChange={(e) => void save({ ...cfg, count: Number(e.target.value) })}
            className="rounded border border-line bg-transparent px-1 py-0.5 text-xs"
          >
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="text-[11px] text-faint">{t("settings.barAgenda.hint")}</p>
    </SettingsSection>
  );
}
