import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useGithubConnected } from "../lib/useGithubConnected";
import { useSectionError } from "../lib/useSectionError";
import { t } from "../i18n";
import { SettingsSection } from "./SettingsSection";

/** On/off for the OS notification Rust sends when someone asks for the user's review on GitHub. */
export default function ReviewAlertsSection({ onError }: { onError: (m: string) => void }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const connected = useGithubConnected();
  const { error, fail, clear } = useSectionError(onError);

  const load = () => api.reviewAlertsGet().then(setEnabled, fail);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Held while saving: a second click before Rust answers would race the first and could leave the opposite state.
  async function toggle(next: boolean) {
    if (saving) return;
    setSaving(true);
    clear();
    try {
      setEnabled(await api.reviewAlertsSet(next));
    } catch (e) {
      fail(e);
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSection title={t("settings.reviewAlerts.title")} error={error}>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={enabled ?? false}
          disabled={enabled === null || saving}
          onChange={(e) => void toggle(e.target.checked)}
          className="canto-box"
        />
        {t("settings.reviewAlerts.label")}
      </label>
      <p className="text-[11px] text-faint">{t("settings.reviewAlerts.hint")}</p>
      {connected === false && (
        <p role="status" className="text-[11px] text-accent-text">
          {t("settings.githubHint")}
        </p>
      )}
    </SettingsSection>
  );
}
