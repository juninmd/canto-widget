import { useCallback, useEffect, useState } from "react";
import { TOGGLE_LABEL } from "./lib/platform";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { api, errText, type AgendaItem, type VaultStatus } from "./lib/api";
import { useAgenda } from "./lib/useAgenda";
import { useUpdateNotice } from "./lib/useUpdateNotice";
import { useFullscreen } from "./lib/useFullscreen";
import { focusShortcut, useShortcuts } from "./lib/shortcuts";
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
import TranscriptsTab from "./components/TranscriptsTab";
import AgendaTab from "./components/AgendaTab";
import GithubTab from "./components/GithubTab";
import GitlabTab from "./components/GitlabTab";
import StatusTab from "./components/StatusTab";
import { useHiddenTabs, visibleTabs } from "./lib/tabs";
import { useReminderLead } from "./lib/reminderLead";
import { usePrivacyMode } from "./lib/privacy";
import TabBar, { panelId, type Tab } from "./components/TabBar";
import Alert from "./components/Alert";
import { EyeIcon, EyeOffIcon } from "./components/Icons";
import { ToastProvider, useToast } from "./lib/toast";
import { LANGUAGE, t } from "./i18n";

export default function App() {
  return (
    <ToastProvider>
      <Canto />
    </ToastProvider>
  );
}

function Canto() {
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [hiddenTabs, setHiddenTabs] = useHiddenTabs();
  const tabs = visibleTabs(hiddenTabs);
  const [tab, setTab] = useState<Tab>(() => tabs[0].id);
  // Cleared on every manual tab switch so a stale jump doesn't re-seed a tab's search later.
  const [jumpQuery, setJumpQuery] = useState("");
  const changeTab = useCallback((id: Tab) => {
    setJumpQuery("");
    setTab(id);
  }, []);
  const openSettings = useCallback(() => changeTab("settings"), [changeTab]);
  const notify = useToast();
  const setError = useCallback((message: string) => notify({ message, type: "erro" }), [notify]);
  const [alert, setAlert] = useState<AgendaItem | null>(null);
  const today = useToday();
  const agenda = useAgenda(status?.unlocked === true);
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
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const fullscreen = useFullscreen();
  const toggleFullscreen = () => void fullscreen.toggle().catch((e) => setError(errText(e)));
  // Completing from the toast changes the task outside the tab: the list needs to reread.
  const [tasksVersion, setTasksVersion] = useState(0);

  useShortcuts(status?.unlocked === true && !alert, (action) => {
    if (action.type === "help") return setHelpOpen((v) => !v);
    if (action.type === "fullscreen") return toggleFullscreen();
    if (action.type === "privacy") return togglePrivacy();
    if (action.type === "globalSearch") return setSearchOpen((v) => !v);
    if (helpOpen || searchOpen || onboardingOpen) return;
    if (action.type === "tab") return tabs[action.index - 1] && changeTab(tabs[action.index - 1].id);
    if (action.type === "lock") return void lock();
    focusShortcut(action.target);
  });

  const refresh = useCallback(async () => {
    try {
      setStatus(await api.status());
    } catch (e) {
      setError(errText(e));
    }
  }, [setError]);

  // Only a fresh "criar cofre" sets justCreated; a plain unlock never shows onboarding again.
  const openVault = useCallback(
    (justCreated?: boolean) => {
      if (justCreated && !onboardingSeen()) setOnboardingOpen(true);
      void refresh();
    },
    [refresh],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Rust locks the vault on its own after a period of inactivity; the UI needs to know.
  useEffect(() => {
    const stop = listen<number>("canto://auto-lock", (e) => {
      notify({ message: t("app.autoLocked", { min: e.payload }) });
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

  // Rust signals when a meeting is starting; the overlay takes over the screen.
  useEffect(() => {
    const stop = listen("canto://alert", () => {
      void api.alertPayload().then(setAlert);
    });
    return () => {
      void stop.then((f) => f());
    };
  }, []);

  async function lock() {
    setHelpOpen(false);
    setSearchOpen(false);
    setOnboardingOpen(false);
    await api.lock();
    await refresh();
  }

  return (
    <div
      className={`relative flex h-screen flex-col overflow-hidden bg-panel/95 text-fg backdrop-blur ${
        fullscreen.active ? "" : "rounded-2xl border border-edge shadow-2xl"
      }`}
    >
      {alert && <Alert event={alert} onClose={() => setAlert(null)} onCompleted={() => setTasksVersion((v) => v + 1)} />}
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
            setTab(target);
            setSearchOpen(false);
          }}
        />
      )}
      <header
        data-tauri-drag-region
        className="flex items-center justify-between border-b border-edge px-3 py-2"
      >
        <span data-tauri-drag-region className="text-xs font-semibold tracking-wide text-muted">
          {t("app.name")}
        </span>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          {status?.unlocked && (
            <>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                aria-label={t("app.shortcuts")}
                title={t("app.shortcuts.title")}
                className="grid size-6 place-items-center rounded hover:text-fg"
              >
                ?
              </button>
              <button type="button" onClick={lock} title={t("app.lock.title")} className="min-h-6 rounded px-1.5 hover:text-fg">
                {t("app.lock")}
              </button>
              <button
                type="button"
                onClick={togglePrivacy}
                aria-pressed={privacy}
                aria-label={privacy ? t("app.privacy.disable") : t("app.privacy.enable")}
                title={privacy ? t("app.privacy.onTitle") : t("app.privacy.offTitle")}
                className={`grid size-6 place-items-center rounded hover:text-fg ${privacy ? "text-accent" : ""}`}
              >
                {privacy ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-pressed={fullscreen.active}
            aria-label={fullscreen.active ? t("app.fullscreen.exit") : t("app.fullscreen.enter")}
            title={fullscreen.active ? t("app.fullscreen.exitTitle") : t("app.fullscreen.enterTitle")}
            className="grid size-6 place-items-center rounded hover:text-fg"
          >
            {fullscreen.active ? "⤡" : "⤢"}
          </button>
          <button
            type="button"
            onClick={() => void getCurrentWindow().hide()}
            className="grid size-6 place-items-center rounded hover:text-fg"
            title={t("app.hide.title", { shortcut: TOGGLE_LABEL })}
            aria-label={t("app.hide")}
          >
            —
          </button>
        </div>
      </header>

      {!status ? (
        <div className="flex-1" />
      ) : !status.unlocked ? (
        <Lock exists={status.exists} onOpen={openVault} />
      ) : (
        <>
          <TabBar current={tab} onChange={changeTab} tabs={tabs} />
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
                onOpenTasks={() => changeTab("tasks")}
                onOpenAgenda={() => changeTab("agenda")}
                onError={setError}
              />
            )}
            {tab === "clipboard" && <ClipboardTab privacy={privacy} initialQuery={jumpQuery} onError={setError} />}
            {tab === "meetings" && <TranscriptsTab onError={setError} />}
            {tab === "agenda" && <AgendaTab agenda={agenda} onError={setError} />}
            {tab === "github" && <GithubTab onError={setError} />}
            {tab === "gitlab" && <GitlabTab onError={setError} />}
            {tab === "status" && <StatusTab />}
            {tab === "settings" && (
              <SettingsTab
                onError={setError}
                hiddenTabs={hiddenTabs}
                onHiddenTabs={setHiddenTabs}
                reminderLead={reminderLead}
                onReminderLead={setReminderLead}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}
