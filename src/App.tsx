import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { api, errText, todayLocal, type AgendaItem, type VaultStatus } from "./lib/api";
import Lock from "./components/Lock";
import TasksTab from "./components/TasksTab";
import NotesTab from "./components/NotesTab";
import SyncTab from "./components/SyncTab";
import SkinPicker from "./components/SkinPicker";
import ClipboardTab from "./components/ClipboardTab";
import TranscriptsTab from "./components/TranscriptsTab";
import AgendaTab from "./components/AgendaTab";
import Alerta from "./components/Alerta";

type Tab = "tarefas" | "notas" | "clipboard" | "reunioes" | "agenda" | "sync";
const TABS: Tab[] = ["tarefas", "notas", "clipboard", "reunioes", "agenda", "sync"];

export default function App() {
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [tab, setTab] = useState<Tab>("tarefas");
  const [error, setError] = useState("");
  const [alerta, setAlerta] = useState<AgendaItem | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus(await api.status());
    } catch (e) {
      setError(errText(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // O Rust avisa quando uma reuniao esta comecando; o overlay assume a tela.
  useEffect(() => {
    const parar = listen("canto://alerta", () => {
      void api.alertaPayload().then(setAlerta);
    });
    return () => {
      void parar.then((f) => f());
    };
  }, []);

  async function lock() {
    await api.lock();
    await refresh();
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden rounded-2xl border border-edge bg-panel/95 text-fg shadow-2xl backdrop-blur">
      {alerta && <Alerta evento={alerta} onFechar={() => setAlerta(null)} />}
      <header
        data-tauri-drag-region
        className="flex items-center justify-between border-b border-edge px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <span data-tauri-drag-region className="text-xs font-semibold tracking-wide text-muted">
            canto
          </span>
          <SkinPicker />
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          {status?.unlocked && (
            <button type="button" onClick={lock} className="hover:text-fg">
              trancar
            </button>
          )}
          <button
            type="button"
            onClick={() => void getCurrentWindow().hide()}
            className="hover:text-fg"
            title="esconder (Ctrl+Alt+Espaço para voltar)"
            aria-label="esconder widget"
          >
            —
          </button>
        </div>
      </header>

      {error && (
        <button
          type="button"
          onClick={() => setError("")}
          className="border-b border-edge bg-ink px-3 py-1.5 text-left text-[11px] text-danger"
        >
          {error}
        </button>
      )}

      {!status ? (
        <div className="flex-1" />
      ) : !status.unlocked ? (
        <Lock exists={status.exists} onOpen={refresh} />
      ) : (
        <>
          <nav className="flex shrink-0 gap-1 overflow-x-auto px-3 pt-2 text-xs">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-lg px-2.5 py-1 capitalize ${
                  tab === t ? "bg-edge text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
          <main className="min-h-0 flex-1 p-3">
            {tab === "tarefas" && <TasksTab today={todayLocal()} onError={setError} />}
            {tab === "notas" && <NotesTab onError={setError} />}
            {tab === "clipboard" && <ClipboardTab onError={setError} />}
            {tab === "reunioes" && <TranscriptsTab onError={setError} />}
            {tab === "agenda" && <AgendaTab onError={setError} />}
            {tab === "sync" && <SyncTab onError={setError} />}
          </main>
        </>
      )}
    </div>
  );
}
