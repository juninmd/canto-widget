import { api } from "../lib/api";
import { t } from "../i18n";
import SteamGames from "./SteamGames";

/** The wishlist scan lives in Rust; here it is only the list of what is on sale. */
export default function SteamDeals() {
  return <SteamGames load={api.steamDeals} empty={t("steam.deals.empty")} more={t("steam.deals.more")} rows={6} />;
}
