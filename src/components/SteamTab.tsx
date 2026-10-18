import { useCallback, useEffect, useState } from "react";
import { api, errText, type SteamStatus } from "../lib/api";
import { requestRefresh } from "../lib/refreshEvent";
import { REGIONS } from "../lib/steam";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
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
        <span className="min-w-0 flex-1 truncate text-right" title={status.steamid}>
          {status.name || status.steamid}
        </span>
        {!status.has_key && <span className="shrink-0 rounded bg-edge px-1.5">{t("steam.noKey")}</span>}
        <button
          type="button"
          onClick={() => void disconnect()}
          className="canto-hit shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active"
        >
          {t("steam.disconnect")}
        </button>
      </div>
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
