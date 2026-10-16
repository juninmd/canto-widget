import { useState } from "react";
import { api, errText, type SteamStatus } from "../lib/api";
import { t } from "../i18n";

const FIELD = "canto-field px-3 py-2 text-sm";
const KEY_PAGE = "https://steamcommunity.com/dev/apikey";

/** The SteamID64 is what every public list needs; the Web API key is optional and only adds "jogue agora". */
export default function SteamConnect({ onConnected }: { onConnected: (status: SteamStatus) => void }) {
  const [id, setId] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      onConnected(await api.steamConnect(id, key));
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-2 text-xs text-muted">
      <h3 className="text-sm font-semibold text-fg">{t("steam.connect.title")}</h3>
      <p>{t("steam.connect.hint")}</p>
      <label htmlFor="steam-id" className="text-fg">
        {t("steam.connect.idLabel")}
      </label>
      <input
        id="steam-id"
        autoComplete="off"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder={t("steam.connect.idPlaceholder")}
        className={FIELD}
      />
      <label htmlFor="steam-key" className="text-fg">
        {t("steam.connect.keyLabel")}
      </label>
      <input
        id="steam-key"
        type="password"
        autoComplete="off"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder={t("steam.connect.keyPlaceholder")}
        className={FIELD}
      />
      <p className="text-[11px] text-faint">
        <button
          type="button"
          onClick={() => void api.openLink(KEY_PAGE).catch(() => {})}
          className="canto-hit rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active"
        >
          {t("steam.connect.keyHelp")}
        </button>
      </p>
      <button
        type="submit"
        disabled={busy || !id.trim()}
        className="canto-hit min-h-7 self-start rounded-lg bg-edge px-3 text-fg disabled:opacity-40"
      >
        {busy ? t("steam.connect.working") : t("steam.connect.submit")}
      </button>
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
