import { useEffect, useState } from "react";
import { api, errText, type DriveStatus } from "../lib/api";
import { t } from "../i18n";
import GoogleAccount from "./GoogleAccount";

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
      <h2 className="text-xs font-semibold text-fg">{t("google.heading")}</h2>
      <p className="text-xs text-muted">{t("google.intro")}</p>

      {/* Credentials are a one-time step: once the account is connected, they collapse (progressive disclosure). */}
      {/* Build with an embedded client: a custom credential becomes a collapsed, advanced option. */}
      <details open={!status.connected && !status.embedded}>
        <summary className="min-h-6 cursor-pointer text-[11px] text-muted hover:text-fg">
          {status.embedded ? t("google.ownCredentials") : t("google.oauthCredentials", { saved: status.configured ? t("google.oauthSaved") : "" })}
        </summary>
        <div className="mt-2 flex flex-col gap-2 motion-safe:animate-aba">
          <label htmlFor="google-client-id" className="text-[11px] text-muted">{t("google.clientIdLabel")}</label>
          <input
            id="google-client-id"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="xxxx.apps.googleusercontent.com"
            className="rounded-lg border border-line bg-ink px-3 py-1.5 text-xs text-fg outline-none focus:border-accent"
          />
          <label htmlFor="google-client-secret" className="text-[11px] text-muted">{t("google.clientSecretLabel")}</label>
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
              run("cfg", () => api.driveConfigure(clientId, clientSecret), t("google.credentialsSavedInVault"))
            }
            className="rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40"
          >
            {t("google.saveCredentials")}
          </button>
        </div>
      </details>

      {status.connected ? (
        <GoogleAccount
          status={status}
          busy={busy !== ""}
          signingOut={busy === "out"}
          onSignOut={() => void run("out", api.driveDisconnect, t("google.signedOut"))}
        />
      ) : (
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="size-2 rounded-full bg-faint" />
          <span className="truncate text-muted">
            {status.embedded ? t("google.readyToSignIn") : status.configured ? t("google.credentialsSaved") : t("google.notConfigured")}
          </span>
        </div>
      )}

      <button
        type="button"
        disabled={busy !== "" || !status.configured}
        onClick={() => run("conn", async () => setInfo(t("google.signedInAs", { account: (await api.driveConnect()) || t("google.defaultAccount") })), "")}
        className="rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40"
      >
        {busy === "conn" ? t("google.waitingBrowser") : status.connected ? t("google.switchAccount") : t("google.signIn")}
      </button>
      {info && <p className="text-[11px] text-accent">{info}</p>}
    </section>
  );
}
