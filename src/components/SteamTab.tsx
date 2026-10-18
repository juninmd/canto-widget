import { useCallback, useEffect, useState } from "react";
import { api, errText, type SteamStatus } from "../lib/api";
import { requestRefresh } from "../lib/refreshEvent";
import { profileUrl, REGIONS } from "../lib/steam";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import { BellIcon } from "./Icons";
import Skeleton from "./Skeleton";
import SteamCatalog from "./SteamCatalog";
import SteamConnect from "./SteamConnect";
import SteamDeals from "./SteamDeals";
import SteamRecent from "./SteamRecent";
import SteamTrending from "./SteamTrending";
import SubTabs from "./SubTabs";

type Sub = "deals" | "trending" | "recent" | "catalog";

/** Steam: the wishlist deals, the top sellers, the last games played and the catalog by rating. */
export default function SteamTab({ onError }: { onError: (m: string) => void }) {
  const [status, setStatus] = useState<SteamStatus | null>(null);
  const [error, setError] = useState("");
  const [sub, setSub] = useState<Sub>("deals");
  const [key, setKey] = useState("");
  const [addingKey, setAddingKey] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus(await api.steamStatus());
      setError("");
    } catch (e) {
      setError(errText(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  useRefreshEvent("steam", () => void load());

  async function disconnect() {
    try {
      setStatus(await api.steamDisconnect());
      // The form belonged to the account that just left; the next one starts with a clean header.
      setKey("");
      setAddingKey(false);
    } catch (e) {
      onError(errText(e));
    }
  }

  async function chooseRegion(region: string) {
    try {
      setStatus(await api.steamRegion(region));
      // Rust dropped the cached lists with the other store's prices; the ones on screen go too.
      requestRefresh("steam");
    } catch (e) {
      onError(errText(e));
    }
  }

  /** The key is optional and can arrive later: a keyless account keeps its SteamID and gains "jogue agora". */
  async function addKey(e: React.FormEvent) {
    e.preventDefault();
    if (!status) return;
    setBusy(true);
    try {
      setStatus(await api.steamConnect(status.steamid, key));
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
    if (!status) return;
    try {
      setStatus({ ...status, watching: await api.steamWatch(!status.watching) });
    } catch (e) {
      onError(errText(e));
    }
  }

  if (!status) {
    return error ? <ErrorBanner message={error} onRetry={() => void load()} /> : <Skeleton label={t("steam.loading")} />;
  }
  if (!status.configured) return <SteamConnect onConnected={setStatus} />;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-1 text-[11px] text-faint">
        <select
          aria-label={t("steam.region")}
          value={status.region}
          onChange={(e) => void chooseRegion(e.target.value)}
          className="canto-hit shrink-0 rounded border border-edge bg-ink px-1 py-0.5 text-[11px] text-muted"
        >
          {REGIONS.map((region) => (
            <option key={region.code} value={region.code}>
              {region.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void toggleWatch()}
          aria-pressed={status.watching}
          aria-label={t("steam.watch")}
          title={t("steam.watch")}
          className={`grid size-6 shrink-0 place-items-center rounded-md hover:bg-edge ${
            status.watching ? "text-accent-text" : "text-faint hover:text-fg"
          }`}
        >
          <BellIcon on={status.watching} />
        </button>
        <button
          type="button"
          onClick={() => void api.openLink(profileUrl(status.steamid)).catch(() => {})}
          title={status.steamid}
          className="canto-hit min-w-0 flex-1 truncate text-right hover:text-fg"
        >
          {status.name || status.steamid}
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
        <button
          type="button"
          onClick={() => void disconnect()}
          className="canto-hit shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active"
        >
          {t("steam.disconnect")}
        </button>
      </div>
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
      <SubTabs
        label={t("steam.sub.label")}
        value={sub}
        onChange={setSub}
        tabs={[
          { key: "deals", label: t("steam.sub.deals") },
          { key: "trending", label: t("steam.sub.trending") },
          { key: "recent", label: t("steam.sub.recent") },
          { key: "catalog", label: t("steam.sub.catalog") },
        ]}
      />
      <div className="min-h-0 flex-1">
        {sub === "deals" && <SteamDeals />}
        {sub === "trending" && <SteamTrending />}
        {sub === "recent" && <SteamRecent />}
        {sub === "catalog" && <SteamCatalog />}
      </div>
    </div>
  );
}
