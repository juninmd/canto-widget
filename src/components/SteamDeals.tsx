import { useCallback, useRef } from "react";
import { api } from "../lib/api";
import { t } from "../i18n";
import SteamGames from "./SteamGames";

/** The wishlist scan lives in Rust; here it is the page of what is on sale, with the total saved. */
export default function SteamDeals() {
  const page = useRef(0);

  const load = useCallback((force: boolean) => {
    page.current = 0;
    return api.steamDeals(0, force);
  }, []);

  const loadMore = useCallback(() => {
    const next = page.current + 1;
    return api.steamDeals(next, false).then((list) => {
      page.current = next;
      return list;
    });
  }, []);

  return (
    <SteamGames load={load} loadMore={loadMore} empty={t("steam.deals.empty")} totalSaved rows={6} />
  );
}
