import { useEffect, useRef, useState } from "react";
import { api, errText, type DeviceCode } from "../lib/api";

const FIELD = "rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent";
const TOKEN_URL = "https://github.com/settings/personal-access-tokens/new";

/** Two doors: personal token always; device flow only when the build ships a GitHub App. */
export default function GithubConnect({ device, onConnected }: { device: boolean; onConnected: () => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deviceCode, setDeviceCode] = useState<DeviceCode | null>(null);
  const mounted = useRef(true);

  // Leaving the tab mid device-flow can't leave Rust polling GitHub.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      void api.githubDeviceCancel().catch(() => {});
    };
  }, []);

  async function saveToken(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.githubSaveToken(token);
      setToken("");
      onConnected();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  async function signInWithApp() {
    setError("");
    setBusy(true);
    try {
      const d = await api.githubDeviceStart();
      setDeviceCode(d);
      void api.openLink(d.url).catch(() => {});
      await api.githubDeviceFinish();
      if (mounted.current) onConnected();
    } catch (e) {
      if (mounted.current) setError(errText(e));
    } finally {
      if (mounted.current) {
        setDeviceCode(null);
        setBusy(false);
      }
    }
  }

  if (deviceCode) {
    return (
      <div className="flex flex-col gap-2 text-xs text-muted">
        <p>Digite este código na página do GitHub que abriu no navegador:</p>
        <p className="select-text text-center font-mono text-2xl font-semibold tracking-widest text-fg" aria-label="código de verificação">
          {deviceCode.user_code}
        </p>
        <button type="button" onClick={() => void api.openLink(deviceCode.url)} className="min-h-7 rounded-lg bg-edge px-3 text-fg">
          abrir {deviceCode.url.replace("https://", "")}
        </button>
        <button type="button" onClick={() => void api.githubDeviceCancel()} className="min-h-6 self-center underline decoration-dotted">
          cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-xs text-muted">
      <p>Conecte sua conta para ver issues e PRs abertos. O token fica cifrado no cofre e nunca sai desta máquina.</p>
      {device && (
        <button type="button" onClick={() => void signInWithApp()} disabled={busy} className="min-h-8 rounded-lg bg-accent px-3 font-semibold text-on-accent disabled:opacity-40">
          entrar com o GitHub
        </button>
      )}
      <form onSubmit={saveToken} className="flex flex-col gap-2">
        <label htmlFor="github-token" className="text-fg">
          {device ? "ou cole um token pessoal" : "Token pessoal do GitHub"}
        </label>
        <input
          id="github-token"
          type="password"
          autoComplete="off"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="github_pat_..."
          className={FIELD}
        />
        <p className="text-[11px] text-faint">
          Fine-grained, só leitura: Issues e Pull requests em <em>Read-only</em>.{" "}
          <button type="button" onClick={() => void api.openLink(TOKEN_URL)} className="underline decoration-dotted hover:text-muted">
            criar token
          </button>
        </p>
        <button type="submit" disabled={busy || !token.trim()} className="min-h-7 self-start rounded-lg bg-edge px-3 text-fg disabled:opacity-40">
          {busy ? "conferindo..." : "salvar token"}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
