import { useEffect, useState } from "react";
import { TOGGLE_LABEL } from "../lib/platform";
import { api, errText } from "../lib/api";
import BackupSection from "./BackupSection";
import SyncSection from "./SyncSection";
import GoogleSection from "./GoogleSection";
import WindowSection from "./WindowSection";
import SecuritySection from "./SecuritySection";
import SkinPicker from "./SkinPicker";
import DensityPicker from "./DensityPicker";
import LanguagePicker from "./LanguagePicker";
import UpdateSection from "./UpdateSection";
import TabsSection from "./TabsSection";
import RemindersSection from "./RemindersSection";
import FocusSection from "./FocusSection";
import ActivitySection from "./ActivitySection";
import DoNotDisturbSection from "./DoNotDisturbSection";
import MyPrAlertsSection from "./MyPrAlertsSection";
import ReviewAlertsSection from "./ReviewAlertsSection";
import FullscreenHoldSection from "./FullscreenHoldSection";
import type { Tab } from "./TabBar";
import type { LeadMinutes } from "../lib/reminderLead";
import { t } from "../i18n";

type Props = {
  onError: (m: string) => void;
  hiddenTabs: Tab[];
  onHiddenTabs: (hidden: Tab[]) => void;
  reminderLead: LeadMinutes;
  onReminderLead: (lead: LeadMinutes) => void;
};

export default function SettingsTab({ onError, hiddenTabs, onHiddenTabs, reminderLead, onReminderLead }: Props) {
  const [autostart, setAutostart] = useState(false);
  const [busy, setBusy] = useState(false);

  async function reload() {
    try {
      setAutostart(await api.autostartStatus());
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(enabled: boolean) {
    setBusy(true);
    try {
      await api.autostartSet(enabled);
    } catch (e) {
      onError(errText(e));
    } finally {
      // Reloads even on failure: the OS registry is the source of truth, not the screen.
      await reload();
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1 text-sm [&>fieldset]:rounded-xl [&>fieldset]:border [&>fieldset]:border-edge [&>fieldset]:bg-ink/40 [&>fieldset]:p-3 [&>section]:rounded-xl [&>section]:border [&>section]:border-edge [&>section]:bg-ink/40 [&>section]:p-3 [&_legend]:float-left [&_legend]:mb-1.5 [&_legend]:w-full [&_legend]:p-0 [&_legend+*]:clear-both">
      <section className="flex flex-col gap-2">
        <p className="text-xs text-muted">
          {t("settings.shortcutHint.before")} <span className="text-muted">{TOGGLE_LABEL}</span> {t("settings.shortcutHint.middle")}{" "}
          <kbd className="rounded border border-line px-1 text-[11px]">?</kbd> {t("settings.shortcutHint.after")}
        </p>
        <label className="flex min-h-[24px] items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={autostart}
            disabled={busy}
            onChange={(e) => void toggle(e.target.checked)}
            className="canto-box"
          />
          {t("settings.autostart")}
        </label>
      </section>
      <SkinPicker />
      <DensityPicker />
      <LanguagePicker />
      <TabsSection hidden={hiddenTabs} onChange={onHiddenTabs} />
      <FocusSection />
      <ActivitySection onError={onError} />
      <RemindersSection lead={reminderLead} onChange={onReminderLead} />
      <DoNotDisturbSection onError={onError} />
      <FullscreenHoldSection onError={onError} />
      <ReviewAlertsSection onError={onError} />
      <MyPrAlertsSection onError={onError} />
      <SecuritySection onError={onError} />
      <WindowSection onError={onError} />
      <BackupSection onError={onError} />
      <SyncSection onError={onError} />
      <GoogleSection onError={onError} />
      <UpdateSection />
    </div>
  );
}
