import { useCallback, useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { api, errText, type AgendaItem, type VaultStatus } from "./lib/api";
import { useAgenda } from "./lib/useAgenda";
import { useToday } from "./lib/useToday";
import Lock from "./components/Lock";
import TasksTab from "./components/TasksTab";
import NotesTab from "./components/NotesTab";
import AjustesTab from "./components/AjustesTab";
import SkinPicker from "./components/SkinPicker";
import ClipboardTab from "./components/ClipboardTab";
import TranscriptsTab from "./components/TranscriptsTab";
import AgendaTab from "./components/AgendaTab";
import TabBar, { painelId, type Tab } from "./components/TabBar";
import Alerta from "./components/Alerta";

export default function App() {
  const [status, setStatus] = useState<VaultStatus | null>(null);
  const [tab, setTab] = useState<Tab>("tarefas");
  const [error, setError] = useState("");
  const [alerta, setAlerta] = useState<AgendaItem | null>(null);
  const today = useToday();
  const agenda = useAgenda(status?.unlocked === true);

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

  // O Rust tranca o cofre sozinho depois de um tempo parado; a UI precisa saber.
  useEffect(() => {
    const parar = listen<number>("canto://auto-lock", (e) => {
      setError(`cofre trancado sozinho apos ${e.payload} min sem uso`);
      void refresh();
    });
    return () => {
      void parar.then((f) => f());
    };
  }, [refresh]);

  // Uso deliberado adia o auto-lock. Estrangulado: um aviso por janela basta.
  useEffect(() => {
    if (!status?.unlocked) return;
    let proximo = 0;
    const marcar = () => {
      const agora = Date.now();
      if (agora < proximo) return;
      proximo = agora + 30_000;
      void api.touch().catch(() => {});
    };
    window.addEventListener("pointerdown", marcar);
    window.addEventListener("keydown", marcar);
    return () => {
      window.removeEventListener("pointerdown", marcar);
      window.removeEventListener("keydown", marcar);
    };
  }, [status?.unlocked]);

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
            <button type="button" onClick={lock} className="min-h-6 rounded px-1.5 hover:text-fg">
              trancar
            </button>
          )}
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
          <TabBar atual={tab} onChange={setTab} />
          <main
            id={painelId(tab)}
            role="tabpanel"
            aria-labelledby={`aba-${tab}`}
            className="min-h-0 flex-1 p-3"
          >
            {tab === "tarefas" && <TasksTab today={today} onError={setError} />}
            {tab === "notas" && <NotesTab onError={setError} />}
            {tab === "clipboard" && <ClipboardTab onError={setError} />}
            {tab === "reunioes" && <TranscriptsTab onError={setError} />}
            {tab === "agenda" && <AgendaTab agenda={agenda} onError={setError} />}
            {tab === "ajustes" && <AjustesTab onError={setError} />}
          </main>
        </>
      )}
    </div>
  );
}
