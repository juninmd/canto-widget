import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSectionError } from "../lib/useSectionError";
import { t } from "../i18n";
import { SettingsSection } from "./SettingsSection";

export default function AutostartSection({ onError }: { onError: (m: string) => void }) {
  const [autostart, setAutostart] = useState(false);
  const [busy, setBusy] = useState(false);
  const { error, fail, clear } = useSectionError(onError);

  async function reload() {
    try {
      setAutostart(await api.autostartStatus());
    } catch (e) {
      fail(e);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(enabled: boolean) {
    setBusy(true);
    clear();
    try {
      await api.autostartSet(enabled);
    } catch (e) {
      fail(e);
    } finally {
      // Reloads even on failure: the OS registry is the source of truth, not the screen.
      await reload();
      setBusy(false);
    }
  }

  return (
    <SettingsSection title={t("settings.autostart.title")} error={error}>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={autostart} disabled={busy} onChange={(e) => void toggle(e.target.checked)} className="canto-box" />
        {t("settings.autostart")}
      </label>
    </SettingsSection>
  );
}
