import { useCallback, useEffect, useRef, useState } from "react";
import { useClearOnLock } from "./lib/useClearOnLock";
import { MOD_KEY } from "./lib/platform";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { api, errText } from "./lib/api";
import { useVaultStatus } from "./lib/useVaultStatus";
import { useOnline, useOnReconnect } from "./lib/useOnline";
import { requestRefresh } from "./lib/refreshEvent";
import { useAgenda } from "./lib/useAgenda";
import { useNoteDraft } from "./lib/useNoteDraft";
import { useUpdateNotice } from "./lib/useUpdateNotice";
import { useWindowMode } from "./lib/useWindowMode";
import { useAlertList } from "./lib/useAlertList";
import { focusShortcut, focusShortcutSoon, useShortcuts } from "./lib/shortcuts";
import CommandPalette from "./components/CommandPalette";
import { buildCommands, nextMeeting } from "./lib/paletteCommands";
import { copyDaySummary } from "./lib/copySummary";
import { applySkin } from "./lib/theme";
import ShortcutsHelp from "./components/ShortcutsHelp";
import GlobalSearch from "./components/GlobalSearch";
import Onboarding from "./components/Onboarding";
import { markOnboardingSeen, onboardingSeen } from "./lib/onboarding";
import { useToday } from "./lib/useToday";
import Lock from "./components/Lock";
import TasksTab from "./components/TasksTab";
import NotesTab from "./components/NotesTab";
import SettingsTab from "./components/SettingsTab";
import ClipboardTab from "./components/ClipboardTab";
import AgendaTab from "./components/AgendaTab";
import GithubTab from "./components/GithubTab";
import GitlabTab from "./components/GitlabTab";
import SteamTab from "./components/SteamTab";
import AgentsTab from "./components/AgentsTab";
import WeatherTab from "./components/WeatherTab";
import ReadsTab from "./components/ReadsTab";
import MarketTab from "./components/MarketTab";
import GmailTab from "./components/GmailTab";
import GDriveTab from "./components/GDriveTab";
import StatusTab from "./components/StatusTab";
import ModelsTab from "./components/ModelsTab";
import ActivityTab from "./components/ActivityTab";
import { useHiddenTabs, visibleTabs } from "./lib/tabs";
import { useReminderLead } from "./lib/reminderLead";
import { usePrivacyMode } from "./lib/privacy";
import TabBar, { panelId, type Tab } from "./components/TabBar";
import FocusBar from "./components/FocusBar";
import { focusStore } from "./lib/focus";
import AppHeader from "./components/AppHeader";
import ErrorBanner from "./components/ErrorBanner";
import Skeleton from "./components/Skeleton";
import MiniRail from "./components/MiniRail";
import FocusedAlert from "./components/FocusedAlert";
import NotificationsPanel from "./components/NotificationsPanel";
import { ToastProvider, useToast } from "./lib/toast";
import { LANGUAGE, t } from "./i18n";
import { OPEN_TAB_EVENT, TASKS_CHANGED_EVENT } from "./lib/alertEvents";

export default function App() {
  return (
    <ToastProvider>
      <Canto />
    </ToastProvider>
  );
}

function Canto() {
  const [hiddenTabs, setHiddenTabs] = useHiddenTabs();
  const tabs = visibleTabs(hiddenTabs);
  const [tab, setTab] = useState<Tab>(() => tabs[0].id);
  // Cleared on every manual tab switch so a stale jump doesn't re-seed a tab's search later.
  const [jumpQuery, setJumpQuery] = useState("");
  // Bumped per global-search jump so an already-open tab re-seeds, even with the same query.
  const [jumpSeq, setJumpSeq] = useState(0);
  const changeTab = useCallback((id: Tab) => {
    setJumpQuery("");
    setTab(id);
  }, []);
  const openSettings = useCallback(() => changeTab("settings"), [changeTab]);
  const notify = useToast();
  const setError = useCallback((message: string) => notify({ message, type: "erro" }), [notify]);
  const { status, error: statusError, checking, refresh } = useVaultStatus(setError);
  const today = useToday();
  useClearOnLock(status?.unlocked === true);
  const agenda = useAgenda(status?.unlocked === true);
  const noteDraft = useNoteDraft(status?.unlocked === true);
  const [reminderLead, setReminderLead] = useReminderLead();
  const { privacy, togglePrivacy } = usePrivacyMode();
  // Reminders ring from Rust (a hidden webview's timers are suspended); it only needs the lead time.
  useEffect(() => {
    void api.reminderLeadSet(reminderLead).catch(() => {});
  }, [reminderLead]);
  // Notifications and the tray menu are built in Rust and follow the same language.
  useEffect(() => {
    void api.languageSet(LANGUAGE).catch(() => {});
  }, []);
  useUpdateNotice(notify, openSettings);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const { mode, setMode } = useWindowMode();
  const setModeRef = useRef(setMode);
  setModeRef.current = setMode;
  const pickMode = (next: Parameters<typeof setMode>[0]) => void setMode(next).catch((e) => setError(errText(e)));
  const toggleFullscreen = () => pickMode(mode === "max" ? "normal" : "max");
  const { alerts, log, drop, refresh: refreshAlerts } = useAlertList(true);
  // The bell in the header is the only way in: the alerts take the whole window instead of a column beside the tabs.
  const [alertsOpen, setAlertsOpen] = useState(false);
  // An auto-lock is Rust's, not a click on lock: the screen must not pop back up on the next unlock.
  useEffect(() => {
    if (!status?.unlocked) setAlertsOpen(false);
  }, [status?.unlocked]);
  // Set by a click on the dock: the normal window opens with that alert on top.
  const [focusId, setFocusId] = useState<string | null>(null);
  const focused = alerts.find((a) => a.id === focusId);
  useEffect(() => {
    if (mode !== "mini") return;
    setFocusId(null);
    setAlertsOpen(false);
  }, [mode]);
  // Completing from the toast changes the task outside the tab: the list needs to reread.
  const [tasksVersion, setTasksVersion] = useState(0);

  // The bar and the rows show the run; saving happens in the store, and a reload picks up the saved time.
  useEffect(() => {
    focusStore.setHandlers({
      onSaved: () => setTasksVersion((v) => v + 1),
      onError: (e) => setError(t("focus.saveFailed", { error: errText(e) })),
    });
  }, [setError]);

  useShortcuts(status?.unlocked === true, (action) => {
    if (action.type === "fullscreen") return toggleFullscreen();
    if (action.type === "privacy") return togglePrivacy();
    // The alerts screen owns the window: any other action closes it instead of acting behind it.
    if (alertsOpen) setAlertsOpen(false);
    if (action.type === "help") return setHelpOpen((v) => !v);
    if (action.type === "globalSearch") return setSearchOpen((v) => !v);
    if (action.type === "palette") return setPaletteOpen((v) => !v);
    if (helpOpen || searchOpen || paletteOpen || onboardingOpen) return;
    if (action.type === "settings") return openSettings();
    if (action.type === "tab") return tabs[action.index - 1] && changeTab(tabs[action.index - 1].id);
    if (action.type === "lock") return void lock();
    // The screen hands focus back to the bell as it unmounts: the field has to be focused after that.
    if (alertsOpen) return void setTimeout(() => focusShortcut(action.target), 0);
    focusShortcut(action.target);
  });

  // Only a fresh "criar cofre" sets justCreated; a plain unlock never shows onboarding again.
  const openVault = useCallback(
    (justCreated?: boolean) => {
      if (justCreated && !onboardingSeen()) setOnboardingOpen(true);
      void refresh();
    },
    [refresh],
  );

  // Rust locks the vault on its own after a period of inactivity; the UI needs to know.
  useEffect(() => {
    const stop = listen<number>("canto://auto-lock", (e) => {
      focusStore.discard();
      notify({ message: e.payload > 0 ? t("app.autoLocked", { min: e.payload }) : t("app.lockedFromTray") });
      void refresh();
    });
    return () => {
      void stop.then((f) => f());
    };
  }, [refresh, notify]);

  // Deliberate use postpones auto-lock. Throttled: one signal per window is enough.
  useEffect(() => {
    if (!status?.unlocked) return;
    let next = 0;
    const mark = () => {
      const now = Date.now();
      if (now < next) return;
      next = now + 30_000;
      void api.touch().catch(() => {});
    };
    window.addEventListener("pointerdown", mark);
    window.addEventListener("keydown", mark);
    return () => {
      window.removeEventListener("pointerdown", mark);
      window.removeEventListener("keydown", mark);
    };
  }, [status?.unlocked]);

  // The pop-up lives in its own window: what it changes here arrives as events.
  useEffect(() => {
    const done = listen(TASKS_CHANGED_EVENT, () => setTasksVersion((v) => v + 1));
    const open = listen<Tab>(OPEN_TAB_EVENT, (e) => {
      changeTab(e.payload);
      // The tab lives in the full window, not in the dock.
      void setModeRef.current("normal").catch(() => {});
    });
    return () => {
      void done.then((f) => f());
      void open.then((f) => f());
    };
  }, [changeTab]);

  async function lock() {
    try {
      await focusStore.stop();
      setHelpOpen(false);
      setSearchOpen(false);
      setPaletteOpen(false);
      setOnboardingOpen(false);
      setAlertsOpen(false);
      await api.lock();
    } catch (e) {
      setError(t("app.lockFailed", { error: errText(e) }));
    }
    // Locked or not, what the screen shows must be what Rust holds.
    await refresh();
  }

  const online = useOnline();
  const refreshCurrent = () => {
    if (tab === "tasks") setTasksVersion((v) => v + 1);
    if (tab === "agenda") void agenda.reload();
    refreshAlerts();
    requestRefresh(tab);
  };
  useOnReconnect(online, () => {
    void agenda.reload();
    refreshAlerts();
    requestRefresh();
  });
  // The bell opens the whole alerts window; the dock click still opens one alert on top of the normal window.
  const openAlerts = () => setAlertsOpen(true);

  // Called only while the palette is open: it reflects the agenda and privacy at that moment.
  const paletteCommands = () =>
    buildCommands({
      tabs,
      privacy,
      nextMeeting: nextMeeting(agenda.items),
      goTab: changeTab,
      focusNew: (target) => {
        changeTab(target);
        focusShortcutSoon("new", panelId(target));
      },
      searchTab: () => focusShortcut("search"),
      globalSearch: () => setSearchOpen(true),
      lock: () => void lock(),
      joinMeeting: (e) => void api.openLink(e.meet).catch((err) => setError(errText(err))),
      setSkin: applySkin,
      togglePrivacy,
      toggleFullscreen,
      copySummary: () =>
        void copyDaySummary(today, agenda.items)
          .then(() => notify({ message: t("palette.summaryCopied") }))
          .catch(() => setError(t("summary.copyFailed", { mod: MOD_KEY }))),
      refreshTab: refreshCurrent,
      help: () => setHelpOpen(true),
      hide: () => void getCurrentWindow().hide(),
      mini: () => pickMode("mini"),
    });

  if (mode === "mini") {
    return (
      <MiniRail
        alerts={alerts}
        mode={mode}
        onOpen={(id) => {
          setFocusId(id);
          pickMode("normal");
        }}
        onMode={pickMode}
      />
    );
  }

  return (
    <div
      className={`relative flex h-screen flex-col overflow-hidden bg-panel/95 text-fg backdrop-blur ${
        mode === "max" ? "" : "rounded-2xl border border-edge shadow-2xl"
      }`}
    >
      {helpOpen && status?.unlocked && <ShortcutsHelp onClose={() => setHelpOpen(false)} />}
      {onboardingOpen && status?.unlocked && (
        <Onboarding
          onClose={() => {
            markOnboardingSeen();
            setOnboardingOpen(false);
          }}
        />
      )}
      {searchOpen && status?.unlocked && (
        <GlobalSearch
          today={today}
          privacy={privacy}
          onError={setError}
          onClose={() => setSearchOpen(false)}
          onNavigate={(target, q) => {
            setJumpQuery(q);
            setJumpSeq((n) => n + 1);
            setTab(target);
            setSearchOpen(false);
          }}
        />
      )}
      {alertsOpen && status?.unlocked && (
        <NotificationsPanel
          alerts={alerts}
          log={log}
          onGone={drop}
          onRefresh={refreshAlerts}
          onCompleted={() => setTasksVersion((v) => v + 1)}
          onOpenModels={() => {
            setAlertsOpen(false);
            changeTab("models");
          }}
          onClose={() => setAlertsOpen(false)}
        />
      )}
      {paletteOpen && status?.unlocked && (
        <CommandPalette
          commands={paletteCommands()}
          onClose={() => setPaletteOpen(false)}
          onRun={(cmd) => {
            setPaletteOpen(false);
            // Runs after the palette unmounts and hands focus back, so a focused field keeps it.
            setTimeout(() => void Promise.resolve(cmd.run()).catch((e) => setError(errText(e))), 0);
          }}
        />
      )}
      <AppHeader
        unlocked={status?.unlocked === true}
        online={online}
        privacy={privacy}
        mode={mode}
        pending={alerts.length}
        onBell={openAlerts}
        onHelp={() => setHelpOpen(true)}
        onLock={() => void lock()}
        onTogglePrivacy={togglePrivacy}
        onPickMode={pickMode}
        onToggleFullscreen={toggleFullscreen}
        onError={setError}
      />

      {!status ? (
        <div className="flex-1 p-3">
          {statusError ? (
            <ErrorBanner message={t("common.loadFailed", { error: statusError })} busy={checking} onRetry={() => void refresh()} />
          ) : (
            <Skeleton label={t("app.statusLoading")} />
          )}
        </div>
      ) : !status.unlocked ? (
        <Lock exists={status.exists} onOpen={openVault} />
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TabBar current={tab} onChange={changeTab} tabs={tabs} />
          {focused && (
            <FocusedAlert
              event={focused}
              onGone={drop}
              onSettled={refreshAlerts}
              onCompleted={() => setTasksVersion((v) => v + 1)}
              onOpenModels={() => changeTab("models")}
            />
          )}
          <main
            id={panelId(tab)}
            key={tab}
            role="tabpanel"
            aria-labelledby={`aba-${tab}`}
            className="min-h-0 flex-1 p-3 motion-safe:animate-aba motion-reduce:animate-fade"
          >
            {tab === "tasks" && <TasksTab today={today} version={tasksVersion} agenda={agenda.items} onError={setError} />}
            {tab === "notes" && (
              <NotesTab
                today={today}
                agenda={agenda.items}
                privacy={privacy}
                initialQuery={jumpQuery}
                querySeq={jumpSeq}
                onOpenTasks={() => changeTab("tasks")}
                onOpenAgenda={() => changeTab("agenda")}
                onError={setError}
                note={noteDraft}
              />
            )}
            {tab === "clipboard" && (
              <ClipboardTab privacy={privacy} initialQuery={jumpQuery} querySeq={jumpSeq} onError={setError} />
            )}
            {tab === "agenda" && <AgendaTab agenda={agenda} today={today} version={tasksVersion} privacy={privacy} onError={setError} onOpenSettings={openSettings} onBooked={(message) => notify({ message })} />}
            {tab === "github" && <GithubTab onError={setError} />}
            {tab === "gitlab" && <GitlabTab onError={setError} />}
            {tab === "steam" && <SteamTab onError={setError} />}
            {tab === "status" && <StatusTab />}
            {tab === "models" && <ModelsTab />}
            {tab === "agents" && <AgentsTab onError={setError} />}
            {tab === "weather" && <WeatherTab />}
            {tab === "market" && <MarketTab />}
            {tab === "gmail" && <GmailTab onNotice={(message) => notify({ message })} />}
            {tab === "gdrive" && <GDriveTab />}
            {tab === "reads" && <ReadsTab onError={setError} />}
            {tab === "activity" && <ActivityTab today={today} onError={setError} />}
            {tab === "settings" && (
              <SettingsTab
                onError={setError}
                hiddenTabs={hiddenTabs}
                onHiddenTabs={setHiddenTabs}
                reminderLead={reminderLead}
                onReminderLead={setReminderLead}
                onShowShortcuts={() => setHelpOpen(true)}
              />
            )}
          </main>
          <FocusBar onDone={() => setTasksVersion((v) => v + 1)} onError={setError} />
        </div>
      )}
    </div>
  );
}
