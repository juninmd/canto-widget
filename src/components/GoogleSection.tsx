import { useEffect, useState } from "react";
import { api, type DriveStatus } from "../lib/api";
import { useSectionError } from "../lib/useSectionError";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import GoogleAccount from "./GoogleAccount";
import { SettingsSection } from "./SettingsSection";
import Skeleton from "./Skeleton";

const BUTTON = "canto-hit min-h-[24px] rounded-lg bg-edge px-3 py-1.5 text-xs text-fg disabled:opacity-40";

export default function GoogleSection({ onError }: { onError: (m: string) => void }) {
  const [status, setStatus] = useState<DriveStatus | null>(null);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [busy, setBusy] = useState("");
  const [info, setInfo] = useState("");
  const { error, fail, clear } = useSectionError(onError);

  async function reload() {
    try {
      setStatus(await api.driveStatus());
    } catch (e) {
      fail(e);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function run(label: string, fn: () => Promise<unknown>, msg: string) {
    setBusy(label);
    setInfo("");
    clear();
    try {
      await fn();
      if (msg) setInfo(msg);
    } catch (e) {
      fail(e);
    } finally {
      await reload();
      setBusy("");
    }
  }

  if (status === null) {
    return (
      <SettingsSection title={t("google.heading")}>
        <p className="text-xs text-muted">{t("google.intro")}</p>
        {error ? <ErrorBanner message={t("common.loadFailed", { error })} onRetry={() => {
            clear();
            void reload();
          }} /> : <Skeleton label={t("google.loading")} rows={1} />}
      </SettingsSection>
    );
  }

  return (
    <SettingsSection title={t("google.heading")} error={error}>
      <p className="text-xs text-muted">{t("google.intro")}</p>

      {/* Credentials are a one-time step: once the account is connected, they collapse (progressive disclosure). */}
      {/* Build with an embedded client: a custom credential becomes a collapsed, advanced option. */}
      <details open={!status.connected && !status.embedded}>
        <summary className="canto-hit min-h-[24px] cursor-pointer text-[11px] text-muted hover:text-fg">
          {status.embedded ? t("google.ownCredentials") : t("google.oauthCredentials", { saved: status.configured ? t("google.oauthSaved") : "" })}
        </summary>
        <div className="mt-2 flex flex-col gap-2 motion-safe:animate-aba">
          <label htmlFor="google-client-id" className="text-[11px] text-muted">{t("google.clientIdLabel")}</label>
          <input
            id="google-client-id"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="xxxx.apps.googleusercontent.com"
            className="canto-field px-3 py-1.5 text-xs"
          />
          <label htmlFor="google-client-secret" className="text-[11px] text-muted">{t("google.clientSecretLabel")}</label>
          <input
            id="google-client-secret"
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            className="canto-field px-3 py-1.5 text-xs"
          />
          <button
            type="button"
            disabled={busy !== "" || !clientId.trim()}
            onClick={() =>
              run("cfg", () => api.driveConfigure(clientId, clientSecret), t("google.credentialsSavedInVault"))
            }
            className={BUTTON}
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
        className={`${BUTTON} self-start`}
      >
        {busy === "conn" ? t("google.waitingBrowser") : status.connected ? t("google.switchAccount") : t("google.signIn")}
      </button>
      {info && <p className="text-[11px] text-accent-text">{info}</p>}
    </SettingsSection>
  );
}
