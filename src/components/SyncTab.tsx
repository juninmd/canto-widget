import { useEffect, useState } from "react";
import { api, errText, type DriveStatus } from "../lib/api";

export default function SyncTab({ onError }: { onError: (m: string) => void }) {
  const [status, setStatus] = useState<DriveStatus>({ configured: false, connected: false, email: "" });
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [busy, setBusy] = useState("");
  const [info, setInfo] = useState("");

  async function reload() {
    try {
      setStatus(await api.driveStatus());
    } catch (e) {
      onError(errText(e));
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(label: string, fn: () => Promise<unknown>, msg: string) {
    setBusy(label);
    setInfo("");
    try {
      await fn();
      if (msg) setInfo(msg);
      await reload();
    } catch (e) {
      onError(errText(e));
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-1 text-sm">
      <p className="text-[11px] text-faint">
        Atalho global: <span className="text-muted">Ctrl+Alt+Espaço</span> mostra ou esconde o widget.
      </p>
      <p className="text-xs text-muted">
        O Drive guarda apenas o envelope ja cifrado, na pasta privada do app
        (<code className="text-muted">appDataFolder</code>). A senha mestra nunca sai daqui.
      </p>

      <label className="text-[11px] text-muted">Client ID OAuth (app desktop)</label>
      <input
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        placeholder="xxxx.apps.googleusercontent.com"
        className="rounded-lg border border-edge bg-ink px-3 py-1.5 text-xs text-fg outline-none focus:border-accent"
      />
      <label className="text-[11px] text-muted">Client secret (opcional, apps desktop do Google)</label>
      <input
        type="password"
        value={clientSecret}
        onChange={(e) => setClientSecret(e.target.value)}
        className="rounded-lg border border-edge bg-ink px-3 py-1.5 text-xs text-fg outline-none focus:border-accent"
      />
      <button
        type="button"
        disabled={busy !== "" || !clientId.trim()}
        onClick={() =>
          run("cfg", () => api.driveConfigure(clientId, clientSecret), "credenciais salvas no cofre")
        }
        className="rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40"
      >
        salvar credenciais
      </button>

      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className={`size-2 rounded-full ${status.connected ? "bg-accent" : "bg-faint"}`} />
        <span className="truncate text-muted">
          {status.connected
            ? status.email || "conta conectada"
            : status.configured
              ? "credenciais salvas"
              : "nao configurado"}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy !== "" || !status.configured}
          onClick={() => run("conn", async () => setInfo(`entrou como ${await api.driveConnect()}`), "")}
          className="flex-1 rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40"
        >
          {busy === "conn" ? "aguardando navegador..." : status.connected ? "trocar de conta" : "entrar com o Google"}
        </button>
        <button
          type="button"
          disabled={busy !== "" || !status.connected}
          onClick={() => run("sync", api.driveSync, "sincronizado com o Drive")}
          className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent disabled:opacity-40"
        >
          {busy === "sync" ? "sincronizando..." : "sincronizar agora"}
        </button>
      </div>
      {status.connected && (
        <button
          type="button"
          disabled={busy !== ""}
          onClick={() => run("out", api.driveDisconnect, "conta desconectada")}
          className="text-left text-[11px] text-faint underline decoration-dotted hover:text-danger"
        >
          desconectar conta
        </button>
      )}
      {info && <p className="text-[11px] text-accent">{info}</p>}
    </div>
  );
}
