import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useClearOnLock } from "./shell/useClearOnLock";
import { IS_MOBILE, MOD_KEY } from "./lib/platform";
import { hideWindow } from "./lib/windowShown";
import { api, errText } from "./lib/api";
import { useVaultStatus } from "./shell/useVaultStatus";
import { useOnline, useOnReconnect } from "./lib/useOnline";
import { requestRefresh } from "./lib/refreshEvent";
import { useAgenda } from "./features/agenda/useAgenda";
import { useNoteDraft } from "./features/notes/useNoteDraft";
import { useUpdateNotice } from "./shell/useUpdateNotice";
import { useWindowMode } from "./shell/useWindowMode";
import { useAlertList } from "./features/alerts/useAlertList";
import { focusShortcut, focusShortcutSoon, useShortcuts } from "./shell/shortcuts";
import { buildCommands, nextMeeting } from "./shell/paletteCommands";
import { copyDaySummary } from "./features/tasks/copySummary";
import { applySkin } from "./lib/theme";
import { markOnboardingSeen, onboardingSeen } from "./shell/onboardingSeen";
import { useToday } from "./lib/useToday";
import Lock from "./shell/Lock";
import type { SectionId } from "./features/settings/settingsGroups";
import { useHiddenTabs, visibleTabs } from "./shell/tabs";
import { useTabLayout } from "./shell/tabLayout";
import TabDock from "./shell/TabDock";
import { useReminderLead } from "./features/alerts/reminderLead";
import { usePrivacyMode } from "./lib/privacy";
import TabBar, { panelId, type Tab } from "./shell/TabBar";
import TabRail from "./shell/TabRail";
import MobileNav from "./shell/MobileNav";
import FocusBar from "./features/tasks/FocusBar";
import { focusStore } from "./features/tasks/focus";
import AppHeader from "./shell/AppHeader";
import ErrorBanner from "./components/ErrorBanner";
import Skeleton from "./components/Skeleton";
import TabContent from "./shell/TabContent";
import { useAppEvents } from "./shell/useAppEvents";
import MiniRail from "./shell/MiniRail";
import FocusedAlert from "./features/alerts/FocusedAlert";
import { CommandPalette, GlobalSearch, NotificationsPanel, Onboarding, ShortcutsHelp, preloadOverlays } from "./shell/lazyOverlays";
import { ToastProvider, useToast } from "./lib/toast";
import { LANGUAGE, t } from "./i18n";
import { saveView } from "./features/agenda/agendaView";

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
  const { layout, setLayout, pinned, setPinned } = useTabLayout();
  const [tab, setTab] = useState<Tab>(() => tabs[0].id);
  // Cleared on every manual tab switch so a stale jump doesn't re-seed a tab's search later.
  const [jumpQuery, setJumpQuery] = useState("");
  // Bumped per global-search jump so an already-open tab re-seeds, even with the same query.
  const [jumpSeq, setJumpSeq] = useState(0);
  // An empty state's "configure" button lands on its section, not on the top of Ajustes; any other switch forgets it.
  const [settingsFocus, setSettingsFocus] = useState<SectionId | null>(null);
  const changeTab = useCallback((id: Tab) => {
    setJumpQuery("");
    setSettingsFocus(null);
    setTab(id);
  }, []);
  const openSettings = useCallback(() => changeTab("settings"), [changeTab]);
  const openSettingsAt = useCallback(
    (section: SectionId) => {
      changeTab("settings");
      setSettingsFocus(section);
    },
    [changeTab],
  );
  const openUpdateSettings = useCallback(() => openSettingsAt("update"), [openSettingsAt]);
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
  useUpdateNotice(notify, openUpdateSettings);
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
  useEffect(() => {
    if (status?.unlocked) return preloadOverlays();
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

  const bumpTasks = useCallback(() => setTasksVersion((v) => v + 1), []);
  useAppEvents({ unlocked: status?.unlocked === true, notify, refresh, changeTab, onTasksChanged: bumpTasks, openNormal: setModeRef });

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
      hide: () => void hideWindow(),
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
      className={`relative flex flex-col overflow-hidden text-fg ${
        IS_MOBILE
          ? "h-dvh bg-panel pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)]"
          : `h-screen bg-panel/95 backdrop-blur ${mode === "max" ? "" : "rounded-2xl border border-edge shadow-2xl"}`
      }`}
    >
      <Suspense fallback={null}>
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
            agenda={agenda.items}
            onError={setError}
            onClose={() => setSearchOpen(false)}
            onNavigate={(target, q) => {
              const destination = target === "transcripts" ? "agenda" : target;
              if (destination === "agenda") saveView(target === "transcripts" ? "meetings" : "today");
              setJumpQuery(target === "agenda" ? "" : q);
              setJumpSeq((n) => n + 1);
              setSettingsFocus(null);
              setTab(destination);
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
      </Suspense>
      <AppHeader
        unlocked={status?.unlocked === true}
        online={online}
        privacy={privacy}
        mode={mode}
        pending={alerts.length}
        onBell={openAlerts}
        onHelp={() => setHelpOpen(true)}
        onSearch={() => setSearchOpen(true)}
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
        <div className={`flex min-h-0 min-w-0 flex-1 ${layout === "vertical" && !IS_MOBILE ? "flex-row" : "flex-col"}`}>
          {IS_MOBILE || layout === "dock" ? null : layout === "vertical" ? (
            <TabRail current={tab} onChange={changeTab} tabs={tabs} pinned={pinned} onPinned={setPinned} />
          ) : (
            <TabBar current={tab} onChange={changeTab} tabs={tabs} />
          )}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
              <TabContent
                tab={tab}
                today={today}
                tasksVersion={tasksVersion}
                agenda={agenda}
                noteDraft={noteDraft}
                privacy={privacy}
                jumpQuery={jumpQuery}
                jumpSeq={jumpSeq}
                settingsFocus={settingsFocus}
                settings={{
                  hiddenTabs,
                  onHiddenTabs: setHiddenTabs,
                  layout,
                  onLayout: setLayout,
                  pinned,
                  onPinned: setPinned,
                  reminderLead,
                  onReminderLead: setReminderLead,
                }}
                onError={setError}
                onNotice={(message) => notify({ message })}
                onChangeTab={changeTab}
                onOpenSettingsAt={openSettingsAt}
                onShowShortcuts={() => setHelpOpen(true)}
              />
            </main>
            <FocusBar onDone={() => setTasksVersion((v) => v + 1)} onError={setError} />
          </div>
          {IS_MOBILE && <MobileNav current={tab} onChange={changeTab} tabs={tabs} />}
          {!IS_MOBILE && layout === "dock" && <TabDock current={tab} onChange={changeTab} tabs={tabs} />}
        </div>
      )}
    </div>
  );
}
