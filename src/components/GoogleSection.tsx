import { useEffect, useState } from "react";
import { api, errText, type DriveStatus } from "../lib/api";

export default function GoogleSection({ onError }: { onError: (m: string) => void }) {
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
    } catch (e) {
      onError(errText(e));
    } finally {
      await reload();
      setBusy("");
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold text-fg">Agenda do Google</h2>
      <p className="text-xs text-muted">
        Opcional. A conta serve só para ler os eventos do dia (somente leitura); nenhum dado do cofre
        vai para o Google.
      </p>

      {/* Credenciais sao passo unico: com a conta conectada, ficam recolhidas (divulgacao progressiva). */}
      <details open={!status.connected}>
        <summary className="min-h-6 cursor-pointer text-[11px] text-muted hover:text-fg">
          credenciais OAuth {status.configured ? "(salvas)" : ""}
        </summary>
        <div className="mt-2 flex flex-col gap-2 motion-safe:animate-aba">
          <label htmlFor="google-client-id" className="text-[11px] text-muted">Client ID OAuth (app desktop)</label>
          <input
            id="google-client-id"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="xxxx.apps.googleusercontent.com"
            className="rounded-lg border border-line bg-ink px-3 py-1.5 text-xs text-fg outline-none focus:border-accent"
          />
          <label htmlFor="google-client-secret" className="text-[11px] text-muted">Client secret (opcional, apps desktop do Google)</label>
          <input
            id="google-client-secret"
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            className="rounded-lg border border-line bg-ink px-3 py-1.5 text-xs text-fg outline-none focus:border-accent"
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
        </div>
      </details>

      <div className="mt-1 flex items-center gap-2 text-xs">
        <span className={`size-2 rounded-full ${status.connected ? "bg-accent" : "bg-faint"}`} />
        <span className="truncate text-muted">
          {status.connected
            ? status.email || "conta conectada"
            : status.configured
              ? "credenciais salvas"
              : "não configurado"}
        </span>
      </div>

      <button
        type="button"
        disabled={busy !== "" || !status.configured}
        onClick={() => run("conn", async () => setInfo(`entrou como ${await api.driveConnect()}`), "")}
        className="rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40"
      >
        {busy === "conn" ? "aguardando navegador..." : status.connected ? "trocar de conta" : "entrar com o Google"}
      </button>
      {status.connected && (
        <button
          type="button"
          disabled={busy !== ""}
          onClick={() => run("out", api.driveDisconnect, "conta desconectada")}
          className="min-h-6 self-start text-left text-[11px] text-faint underline decoration-dotted hover:text-danger"
        >
          desconectar conta
        </button>
      )}
      {info && <p className="text-[11px] text-accent">{info}</p>}
    </section>
  );
}
