import { useState } from "react";
import { api, errText } from "../lib/api";
import { t } from "../i18n";

const FIELD = "rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-accent";

/** GitLab.com or a self-hosted instance: address plus a personal token with `read_api`. */
export default function GitlabConnect({ onConnected }: { onConnected: () => void }) {
  const [baseUrl, setBaseUrl] = useState("https://gitlab.com");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const tokenPage = `${baseUrl.trim().replace(/\/+$/, "") || "https://gitlab.com"}/-/user_settings/personal_access_tokens?name=Canto&scopes=read_api`;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.gitlabConnect(baseUrl, token);
      setToken("");
      onConnected();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-2 text-xs text-muted">
      <p>{t("gitlab.intro")}</p>
      <label htmlFor="gitlab-url" className="text-fg">
        {t("gitlab.urlLabel")}
      </label>
      <input
        id="gitlab-url"
        type="url"
        inputMode="url"
        autoComplete="off"
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        placeholder={t("gitlab.urlPlaceholder")}
        className={FIELD}
      />
      <label htmlFor="gitlab-token" className="text-fg">
        {t("gitlab.tokenLabel")}
      </label>
      <input
        id="gitlab-token"
        type="password"
        autoComplete="off"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="glpat-..."
        className={FIELD}
      />
      <p className="text-[11px] text-faint">
        {t("gitlab.scopeHint")} <em>read_api</em>.{" "}
        {/^https:\/\//.test(baseUrl.trim()) && (
          <button type="button" onClick={() => void api.openLink(tokenPage).catch(() => {})} className="underline decoration-dotted hover:text-muted">
            {t("gitlab.createToken")}
          </button>
        )}
      </p>
      <button type="submit" disabled={busy || !token.trim() || !baseUrl.trim()} className="min-h-7 self-start rounded-lg bg-edge px-3 text-fg disabled:opacity-40">
        {busy ? t("gitlab.checking") : t("gitlab.connect")}
      </button>
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
