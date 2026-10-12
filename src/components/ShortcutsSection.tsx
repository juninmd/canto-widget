import { TOGGLE_LABEL } from "../lib/platform";
import { t } from "../i18n";
import { SettingsSection } from "./SettingsSection";

export default function ShortcutsSection({ onOpen }: { onOpen: () => void }) {
  return (
    <SettingsSection title={t("settings.shortcuts.title")}>
      <p className="text-xs text-muted">
        {t("settings.shortcutHint.before")} <span className="text-fg">{TOGGLE_LABEL}</span> {t("settings.shortcutHint.middle")}{" "}
        <kbd className="rounded border border-line px-1 text-[11px]">?</kbd> {t("settings.shortcutHint.after")}
      </p>
      <button type="button" onClick={onOpen} className="canto-hit min-h-[24px] self-start rounded-lg bg-edge px-3 py-1.5 text-xs text-fg">
        {t("settings.shortcuts.open")}
      </button>
    </SettingsSection>
  );
}
