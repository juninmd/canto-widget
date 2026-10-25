import { useEffect, useState, type ReactNode } from "react";
import { GROUPS, loadOpenGroups, saveOpenGroups, sectionMatches, type GroupId, type SectionId } from "../lib/settingsGroups";
import BackupSection from "./BackupSection";
import SyncSection from "./SyncSection";
import ClipSection from "./ClipSection";
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
import DigestSection from "./DigestSection";
import MyPrAlertsSection from "./MyPrAlertsSection";
import ReviewAlertsSection from "./ReviewAlertsSection";
import FullscreenHoldSection from "./FullscreenHoldSection";
import AutostartSection from "./AutostartSection";
import ShortcutsSection from "./ShortcutsSection";
import SettingsGroup from "./SettingsGroup";
import { SensitiveZone } from "./SettingsSection";
import type { Tab } from "./TabBar";
import type { TabLayout } from "../lib/tabLayout";
import type { LeadMinutes } from "../lib/reminderLead";
import { t } from "../i18n";

type Props = {
  onError: (m: string) => void;
  hiddenTabs: Tab[];
  onHiddenTabs: (hidden: Tab[]) => void;
  layout: TabLayout;
  onLayout: (layout: TabLayout) => void;
  pinned: boolean;
  onPinned: (pinned: boolean) => void;
  reminderLead: LeadMinutes;
  onReminderLead: (lead: LeadMinutes) => void;
  onShowShortcuts: () => void;
  /** Section an empty state sent the user to: its group opens and it scrolls into view. */
  focus?: SectionId | null;
};

export default function SettingsTab({ onError, hiddenTabs, onHiddenTabs, layout, onLayout, pinned, onPinned, reminderLead, onReminderLead, onShowShortcuts, focus = null }: Props) {
  const [open, setOpen] = useState<GroupId[]>(() => withFocus(loadOpenGroups(), focus));
  const [query, setQuery] = useState("");
  const searching = query.trim() !== "";

  const sections: Record<SectionId, ReactNode> = {
    skin: <SkinPicker />,
    density: <DensityPicker />,
    language: <LanguagePicker />,
    tabs: <TabsSection hidden={hiddenTabs} onChange={onHiddenTabs} layout={layout} onLayout={onLayout} pinned={pinned} onPinned={onPinned} />,
    reminders: <RemindersSection lead={reminderLead} onChange={onReminderLead} />,
    digest: <DigestSection onError={onError} />,
    dnd: <DoNotDisturbSection onError={onError} />,
    fullscreen: <FullscreenHoldSection onError={onError} />,
    reviewAlerts: <ReviewAlertsSection onError={onError} />,
    myPrAlerts: <MyPrAlertsSection onError={onError} />,
    activity: <ActivitySection onError={onError} />,
    focus: <FocusSection />,
    security: <SecuritySection onError={onError} />,
    google: <GoogleSection onError={onError} />,
    backup: <BackupSection onError={onError} />,
    sync: <SyncSection onError={onError} />,
    clipboard: <ClipSection onError={onError} />,
    window: <WindowSection onError={onError} />,
    autostart: <AutostartSection onError={onError} />,
    shortcuts: <ShortcutsSection onOpen={onShowShortcuts} />,
    update: <UpdateSection />,
  };

  useEffect(() => {
    if (!focus) return;
    setOpen((current) => withFocus(current, focus));
    requestAnimationFrame(() => document.querySelector(`[data-settings-section="${focus}"]`)?.scrollIntoView?.({ block: "start" }));
  }, [focus]);

  function toggle(id: GroupId) {
    const next = open.includes(id) ? open.filter((g) => g !== id) : [...open, id];
    setOpen(next);
    saveOpenGroups(next);
  }

  // Filtered sections are hidden, not unmounted: remounting would repeat their loads (the update check, Google).
  const visible = (id: SectionId, group: GroupId) => !searching || sectionMatches(id, group, query);
  const shown = GROUPS.filter((g) => [...g.sections, ...g.sensitive].some((s) => visible(s, g.id)));

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1 text-sm">
      <div data-settings-search className="sticky top-0 z-10 -mb-1 bg-panel/95 px-0.5 pb-1 pt-0.5 backdrop-blur">
        <input
          type="search"
          value={query}
          aria-label={t("settings.search.label")}
          placeholder={t("settings.search.label")}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && query && (e.stopPropagation(), setQuery(""))}
          className="canto-field w-full px-3 py-1.5 text-sm"
        />
        <p role="status" className={searching && shown.length === 0 ? "mt-1.5 text-xs text-faint" : "text-xs text-faint"}>
          {searching && shown.length === 0 ? t("settings.search.empty", { query: query.trim() }) : ""}
        </p>
      </div>
      {GROUPS.map((g) => (
        <div key={g.id} hidden={!shown.includes(g)}>
          <SettingsGroup
            id={g.id}
            title={t(`settings.group.${g.id}`)}
            open={searching || open.includes(g.id)}
            onToggle={() => toggle(g.id)}
          >
            {g.sections.map((s) => (
              <div key={s} data-settings-section={s} hidden={!visible(s, g.id)}>
                {sections[s]}
              </div>
            ))}
            {g.sensitive.length > 0 && (
              <div hidden={!g.sensitive.some((s) => visible(s, g.id))}>
                <SensitiveZone>
                  {g.sensitive.map((s) => (
                    <div key={s} data-settings-section={s} hidden={!visible(s, g.id)}>
                      {sections[s]}
                    </div>
                  ))}
                </SensitiveZone>
              </div>
            )}
          </SettingsGroup>
        </div>
      ))}
    </div>
  );
}

/** Opens the group holding the focused section for this visit only: the saved choice stays as the user left it. */
export function withFocus(open: GroupId[], focus: SectionId | null): GroupId[] {
  const group = focus && GROUPS.find((g) => [...g.sections, ...g.sensitive].includes(focus));
  return group && !open.includes(group.id) ? [...open, group.id] : open;
}
