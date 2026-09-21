import { useEffect, useState } from "react";
import { api, errText } from "../lib/api";
import BackupSection from "./BackupSection";
import SyncSection from "./SyncSection";
import GoogleSection from "./GoogleSection";
import WindowSection from "./WindowSection";
import SecuritySection from "./SecuritySection";
import SkinPicker from "./SkinPicker";
import DensityPicker from "./DensityPicker";
import UpdateSection from "./UpdateSection";
import TabsSection from "./TabsSection";
import RemindersSection from "./RemindersSection";
import type { Tab } from "./TabBar";
import type { LeadMinutes } from "../lib/reminderLead";

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
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1 text-sm">
      <section className="flex flex-col gap-2">
        <p className="text-xs text-muted">
          Atalho global: <span className="text-muted">Ctrl+Alt+Espaço</span> mostra ou esconde o widget. Tecle{" "}
          <kbd className="rounded border border-line px-1 text-[11px]">?</kbd> para ver todos os atalhos.
        </p>
        <label className="flex min-h-6 items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={autostart}
            disabled={busy}
            onChange={(e) => void toggle(e.target.checked)}
            className="size-4 accent-[var(--color-accent)]"
          />
          abrir o Canto ao ligar o computador (direto na bandeja)
        </label>
      </section>
      <SkinPicker />
      <DensityPicker />
      <TabsSection hidden={hiddenTabs} onChange={onHiddenTabs} />
      <RemindersSection lead={reminderLead} onChange={onReminderLead} />
      <SecuritySection onError={onError} />
      <WindowSection onError={onError} />
      <BackupSection onError={onError} />
      <SyncSection onError={onError} />
      <GoogleSection onError={onError} />
      <UpdateSection />
    </div>
  );
}
