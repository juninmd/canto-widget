import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { api, errText, type AgendaItem, type VaultStatus } from "./lib/api";
import { useAgenda } from "./lib/useAgenda";
import { useReminders } from "./lib/useReminders";
import { useUpdateNotice } from "./lib/useUpdateNotice";
import { useFullscreen } from "./lib/useFullscreen";
import { focusShortcut, useShortcuts } from "./lib/shortcuts";
import ShortcutsHelp from "./components/ShortcutsHelp";
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
import { useHiddenTabs, visibleTabs } from "./lib/tabs";
import TabBar, { panelId, type Tab } from "./components/TabBar";
import Alert from "./components/Alert";
import { ToastProvider, useToast } from "./lib/toast";

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
  const openSettings = useCallback(() => setTab("settings"), []);
  const notify = useToast();
  const setError = useCallback((message: string) => notify({ message, type: "erro" }), [notify]);
  const [alert, setAlert] = useState<AgendaItem | null>(null);
  const today = useToday();
  const agenda = useAgenda(status?.unlocked === true);
  useReminders(status?.unlocked === true, today);
  useUpdateNotice(notify, openSettings);
  const [helpOpen, setHelpOpen] = useState(false);
  const fullscreen = useFullscreen();
  const toggleFullscreen = () => void fullscreen.toggle().catch((e) => setError(errText(e)));
  // Completing from the toast changes the task outside the tab: the list needs to reread.
  const [tasksVersion, setTasksVersion] = useState(0);

  useShortcuts(status?.unlocked === true && !alert, (action) => {
    if (action.type === "help") return setHelpOpen((v) => !v);
    if (action.type === "fullscreen") return toggleFullscreen();
    if (helpOpen) return;
    if (action.type === "tab") return tabs[action.index - 1] && setTab(tabs[action.index - 1].id);
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

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Rust locks the vault on its own after a period of inactivity; the UI needs to know.
  useEffect(() => {
    const stop = listen<number>("canto://auto-lock", (e) => {
      notify({ message: `cofre trancado sozinho após ${e.payload} min sem uso` });
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
      <header
        data-tauri-drag-region
        className="flex items-center justify-between border-b border-edge px-3 py-2"
      >
        <span data-tauri-drag-region className="text-xs font-semibold tracking-wide text-muted">
          canto
        </span>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          {status?.unlocked && (
            <>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                aria-label="atalhos de teclado"
                title="atalhos de teclado (?)"
                className="grid size-6 place-items-center rounded hover:text-fg"
              >
                ?
              </button>
              <button type="button" onClick={lock} title="trancar (Alt+L)" className="min-h-6 rounded px-1.5 hover:text-fg">
                trancar
              </button>
            </>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-pressed={fullscreen.active}
            aria-label={fullscreen.active ? "sair da tela cheia" : "tela cheia"}
            title={fullscreen.active ? "sair da tela cheia (F11)" : "tela cheia (F11)"}
            className="grid size-6 place-items-center rounded hover:text-fg"
          >
            {fullscreen.active ? "⤡" : "⤢"}
          </button>
          <button
            type="button"
            onClick={() => void getCurrentWindow().hide()}
            className="grid size-6 place-items-center rounded hover:text-fg"
            title="esconder (Ctrl+Alt+Espaço para voltar)"
            aria-label="esconder widget"
          >
            —
          </button>
        </div>
      </header>

      {!status ? (
        <div className="flex-1" />
      ) : !status.unlocked ? (
        <Lock exists={status.exists} onOpen={refresh} />
      ) : (
        <>
          <TabBar current={tab} onChange={setTab} tabs={tabs} />
          <main
            id={panelId(tab)}
            key={tab}
            role="tabpanel"
            aria-labelledby={`aba-${tab}`}
            className="min-h-0 flex-1 p-3 motion-safe:animate-aba motion-reduce:animate-fade"
          >
            {tab === "tasks" && <TasksTab today={today} version={tasksVersion} agenda={agenda.items} onError={setError} />}
            {tab === "notes" && <NotesTab onError={setError} />}
            {tab === "clipboard" && <ClipboardTab onError={setError} />}
            {tab === "meetings" && <TranscriptsTab onError={setError} />}
            {tab === "agenda" && <AgendaTab agenda={agenda} onError={setError} />}
            {tab === "github" && <GithubTab onError={setError} />}
            {tab === "gitlab" && <GitlabTab onError={setError} />}
            {tab === "settings" && <SettingsTab onError={setError} hiddenTabs={hiddenTabs} onHiddenTabs={setHiddenTabs} />}
          </main>
        </>
      )}
    </div>
  );
}
