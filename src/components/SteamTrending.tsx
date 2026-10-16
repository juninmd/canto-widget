import { api } from "../lib/api";
import { t } from "../i18n";
import SteamGames from "./SteamGames";

/** Steam's global top sellers. */
export default function SteamTrending() {
  return <SteamGames load={api.steamTrending} empty={t("steam.trending.empty")} rows={8} />;
}
