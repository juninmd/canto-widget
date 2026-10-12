import { t } from "../i18n";
import { SettingsSection } from "./SettingsSection";
import { useFocusNudge } from "../lib/focusNudge";

export default function FocusSection() {
  const [nudge, setNudge] = useFocusNudge();
  return (
    <SettingsSection title={t("focus.settingsTitle")}>
      <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={nudge} onChange={(e) => setNudge(e.target.checked)} className="canto-box" />
        {t("focus.settingsOverNudge")}
      </label>
      <p className="text-[11px] text-faint">{t("focus.settingsHint")}</p>
    </SettingsSection>
  );
}
