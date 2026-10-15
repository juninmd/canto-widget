import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSectionError } from "../lib/useSectionError";
import { t } from "../i18n";
import { SettingsSection } from "./SettingsSection";

/** On/off for holding alerts, which Rust does while a full-screen app (a game) is in front. */
export default function FullscreenHoldSection({ onError }: { onError: (m: string) => void }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const { error, fail, clear } = useSectionError(onError);

  const load = () => api.fullscreenHoldGet().then(setEnabled, fail);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(next: boolean) {
    clear();
    try {
      setEnabled(await api.fullscreenHoldSet(next));
    } catch (e) {
      fail(e);
      await load();
    }
  }

  return (
    <SettingsSection title={t("settings.fullscreenHold.title")} error={error}>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={enabled ?? false}
          disabled={enabled === null}
          onChange={(e) => void toggle(e.target.checked)}
          className="canto-box"
        />
        {t("settings.fullscreenHold.label")}
      </label>
      <p className="text-[11px] text-faint">{t("settings.fullscreenHold.hint")}</p>
    </SettingsSection>
  );
}
