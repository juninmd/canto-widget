import { useCallback, useEffect, useState } from "react";
import { api, errText, type SteamStatus } from "../lib/api";
import { useRefreshEvent } from "../lib/useRefreshEvent";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";
import SteamCatalog from "./SteamCatalog";
import SteamConnect from "./SteamConnect";
import SteamDeals from "./SteamDeals";
import SteamHeader from "./SteamHeader";
import SteamNews from "./SteamNews";
import SteamPlay from "./SteamPlay";
import SteamTop from "./SteamTop";
import SteamTrending from "./SteamTrending";
import SteamWishlist from "./SteamWishlist";
import SubTabs from "./SubTabs";

type Sub = "play" | "news" | "wish" | "deals" | "top" | "trending" | "catalog";

/** Steam: the games at hand, their updates, the wishlist, its deals, the most played, the top
 *  sellers and the catalog. */
export default function SteamTab({ onError }: { onError: (m: string) => void }) {
  const [status, setStatus] = useState<SteamStatus | null>(null);
  const [error, setError] = useState("");
  const [sub, setSub] = useState<Sub>("play");
  const [unread, setUnread] = useState(0);
  const [hot, setHot] = useState(0);

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

  const configured = status?.configured ?? false;
  // The badges are worth a background look once per account: both lists are cached in Rust.
  useEffect(() => {
    if (!configured) return;
    api.steamNews("all", false).then((n) => setUnread(n?.unread ?? 0), () => {});
    api.steamWishlist(0, "discount", false).then((w) => setHot(w?.hot ?? 0), () => {});
  }, [configured, status?.steamid, status?.region]);

  if (!status) {
    return error ? <ErrorBanner message={error} onRetry={() => void load()} /> : <Skeleton label={t("steam.loading")} />;
  }
  if (!status.configured) return <SteamConnect onConnected={setStatus} />;

  return (
    <div className="flex h-full flex-col gap-2">
      <SteamHeader status={status} onStatus={setStatus} onError={onError} />
      <SubTabs
        label={t("steam.sub.label")}
        value={sub}
        onChange={setSub}
        tabs={[
          { key: "play", label: t("steam.sub.play") },
          { key: "news", label: t("steam.sub.news"), badge: unread, tone: "info" },
          { key: "wish", label: t("steam.sub.wish"), badge: hot, tone: "hot" },
          { key: "deals", label: t("steam.sub.deals") },
          { key: "top", label: t("steam.sub.top") },
          { key: "trending", label: t("steam.sub.trending") },
          { key: "catalog", label: t("steam.sub.catalog") },
        ]}
      />
      <div key={sub} className="steam-swap min-h-0 flex-1">
        {sub === "play" && <SteamPlay onError={onError} />}
        {sub === "news" && <SteamNews onRead={setUnread} />}
        {sub === "wish" && <SteamWishlist watching={status.watching} onHot={setHot} />}
        {sub === "deals" && <SteamDeals />}
        {sub === "top" && <SteamTop />}
        {sub === "trending" && <SteamTrending />}
        {sub === "catalog" && <SteamCatalog />}
      </div>
    </div>
  );
}
