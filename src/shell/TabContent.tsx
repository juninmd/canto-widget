import { Suspense, type ComponentProps } from "react";
import type { useAgenda } from "../features/agenda/useAgenda";
import type { useNoteDraft } from "../features/notes/useNoteDraft";
import type { SectionId } from "../features/settings/settingsGroups";
import { TABS, type Tab } from "./TabBar";
import Skeleton from "../components/Skeleton";
import TasksTab from "../features/tasks/TasksTab";
import NotesTab from "../features/notes/NotesTab";
import ClipboardTab from "../features/clipboard/ClipboardTab";
import AgendaTab from "../features/agenda/AgendaTab";
import {
  ActivityTab,
  AgentsTab,
  ContactsTab,
  GDriveTab,
  GithubTab,
  GitlabTab,
  GmailTab,
  MapTab,
  MarketTab,
  ModelsTab,
  ReadsTab,
  SettingsTab,
  StatusTab,
  SteamTab,
  SystemTab,
  DevTab,
  WeatherTab,
} from "./lazyTabs";

type SettingsProps = ComponentProps<typeof SettingsTab>;

export interface TabContentProps {
  tab: Tab;
  today: string;
  tasksVersion: number;
  agenda: ReturnType<typeof useAgenda>;
  noteDraft: ReturnType<typeof useNoteDraft>;
  privacy: boolean;
  jumpQuery: string;
  jumpSeq: number;
  settingsFocus: SectionId | null;
  settings: Pick<SettingsProps, "hiddenTabs" | "onHiddenTabs" | "layout" | "onLayout" | "pinned" | "onPinned" | "reminderLead" | "onReminderLead">;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
  onChangeTab: (id: Tab) => void;
  onOpenSettingsAt: (section: SectionId) => void;
  onShowShortcuts: () => void;
}

/** The panel of the current tab; lazy tabs load behind a skeleton. */
export default function TabContent(p: TabContentProps) {
  const { tab, today, agenda, privacy, onError, onNotice } = p;
  return (
    <Suspense fallback={<Skeleton label={TABS.find((item) => item.id === tab)?.label ?? tab} />}>
      {tab === "tasks" && <TasksTab today={today} version={p.tasksVersion} agenda={agenda.items} onError={onError} />}
      {tab === "notes" && (
        <NotesTab
          today={today}
          agenda={agenda.items}
          privacy={privacy}
          initialQuery={p.jumpQuery}
          querySeq={p.jumpSeq}
          onOpenTasks={() => p.onChangeTab("tasks")}
          onOpenAgenda={() => p.onChangeTab("agenda")}
          onError={onError}
          note={p.noteDraft}
        />
      )}
      {tab === "clipboard" && <ClipboardTab privacy={privacy} initialQuery={p.jumpQuery} querySeq={p.jumpSeq} onError={onError} />}
      {tab === "agenda" && (
        <AgendaTab
          agenda={agenda}
          today={today}
          version={p.tasksVersion}
          privacy={privacy}
          initialQuery={p.jumpQuery}
          querySeq={p.jumpSeq}
          onError={onError}
          onOpenSettings={() => p.onOpenSettingsAt("google")}
          onBooked={onNotice}
        />
      )}
      {tab === "github" && <GithubTab onError={onError} />}
      {tab === "gitlab" && <GitlabTab onError={onError} />}
      {tab === "steam" && <SteamTab onError={onError} />}
      {tab === "status" && <StatusTab />}
      {tab === "models" && <ModelsTab />}
      {tab === "agents" && <AgentsTab onError={onError} />}
      {tab === "weather" && <WeatherTab />}
      {tab === "map" && <MapTab />}
      {tab === "market" && <MarketTab />}
      {tab === "system" && <SystemTab />}
      {tab === "dev" && <DevTab />}
      {tab === "gmail" && <GmailTab onNotice={onNotice} />}
      {tab === "gdrive" && <GDriveTab onNotice={onNotice} />}
      {tab === "contacts" && <ContactsTab onNotice={onNotice} />}
      {tab === "reads" && <ReadsTab onError={onError} />}
      {tab === "activity" && <ActivityTab today={today} onError={onError} />}
      {tab === "settings" && <SettingsTab onError={onError} {...p.settings} onShowShortcuts={p.onShowShortcuts} focus={p.settingsFocus} />}
    </Suspense>
  );
}
