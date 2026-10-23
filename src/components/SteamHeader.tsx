import { useState } from "react";
import { api, errText, type SteamStatus } from "../lib/api";
import { requestRefresh } from "../lib/refreshEvent";
import { profileUrl } from "../lib/steam";
import { t } from "../i18n";
import { BellIcon } from "./Icons";
import SteamRegionPicker from "./SteamRegionPicker";

/** The account strip: the store picker, the alerts bell, the persona, the optional key and the
 *  disconnect that asks first. */
export default function SteamHeader({
  status,
  onStatus,
  onError,
}: {
  status: SteamStatus;
  onStatus: (s: SteamStatus) => void;
  onError: (m: string) => void;
}) {
  const [key, setKey] = useState("");
  const [addingKey, setAddingKey] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function disconnect() {
    try {
      onStatus(await api.steamDisconnect());
      // The form belonged to the account that just left; the next one starts with a clean header.
      setKey("");
      setAddingKey(false);
      setConfirming(false);
    } catch (e) {
      onError(errText(e));
    }
  }

  async function chooseRegion(region: string) {
    try {
      onStatus(await api.steamRegion(region));
      // Rust dropped the cached lists with the other store's prices; the ones on screen go too.
      requestRefresh("steam");
    } catch (e) {
      onError(errText(e));
    }
  }

  /** The key is optional and can arrive later: a keyless account keeps its SteamID and gains the library. */
  async function addKey(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      onStatus(await api.steamConnect(status.steamid, key));
      setKey("");
      setAddingKey(false);
      requestRefresh("steam");
    } catch (err) {
      onError(errText(err));
    } finally {
      setBusy(false);
    }
  }

  /** The alerts live in Rust, so a hidden webview still rings; here it is only the switch. */
  async function toggleWatch() {
    try {
      onStatus({ ...status, watching: await api.steamWatch(!status.watching) });
    } catch (e) {
      onError(errText(e));
    }
  }

  return (
    <>
      <div className="flex items-center gap-1 text-[11px] text-faint">
        <SteamRegionPicker value={status.region} onChange={(code) => void chooseRegion(code)} />
        <button
          type="button"
          onClick={() => void toggleWatch()}
          aria-pressed={status.watching}
          aria-label={t("steam.watch")}
          title={t("steam.watch")}
          className={`relative grid size-6 shrink-0 place-items-center rounded-md hover:bg-edge ${
            status.watching ? "canto-ping text-accent-text" : "text-faint hover:text-fg"
          }`}
        >
          <BellIcon on={status.watching} />
        </button>
        <button
          type="button"
          onClick={() => void api.openLink(profileUrl(status.steamid)).catch(() => {})}
          title={status.steamid}
          className="canto-hit flex min-w-0 flex-1 items-center justify-end gap-1.5 truncate text-right hover:text-fg"
        >
          <span className="size-1.5 shrink-0 rounded-full bg-[#66c0f4] shadow-[0_0_6px_#66c0f4]" />
          <span className="truncate">{status.name || status.steamid}</span>
        </button>
        {!status.has_key && (
          <button
            type="button"
            onClick={() => setAddingKey((open) => !open)}
            title={t("steam.connect.keyLabel")}
            className="canto-hit shrink-0 rounded bg-edge px-1.5 hover:text-fg"
          >
            {t("steam.noKey")}
          </button>
        )}
        {!confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="canto-hit shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active"
          >
            {t("steam.disconnect")}
          </button>
        )}
      </div>
      {confirming && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-line bg-ink px-2.5 py-1.5 text-xs">
          <span className="min-w-0 flex-1 text-fg">{t("steam.disconnect.ask")}</span>
          <button
            type="button"
            autoFocus
            onClick={() => setConfirming(false)}
            className="canto-hit shrink-0 rounded-md bg-edge px-2 text-fg hover:bg-active"
          >
            {t("steam.disconnect.cancel")}
          </button>
          <button
            type="button"
            onClick={() => void disconnect()}
            className="canto-hit shrink-0 rounded-md border border-danger/60 px-2 font-semibold text-danger hover:bg-danger/10"
          >
            {t("steam.disconnect")}
          </button>
        </div>
      )}
      {addingKey && !status.has_key && (
        <form onSubmit={addKey} className="flex gap-1">
          <input
            type="password"
            autoComplete="off"
            aria-label={t("steam.connect.keyLabel")}
            placeholder={t("steam.connect.keyPlaceholder")}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="canto-field min-w-0 flex-1 px-2 py-1 text-xs"
          />
          <button
            type="submit"
            disabled={busy || !key.trim()}
            className="canto-hit min-h-7 shrink-0 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-40"
          >
            {busy ? t("steam.connect.working") : t("steam.connect.submit")}
          </button>
        </form>
      )}
    </>
  );
}
