import { useCallback, useRef, useState } from "react";
import { api } from "../lib/api";
import { t } from "../i18n";
import SteamGames from "./SteamGames";

/** The store ordered by review score; typing a term narrows it and "ver mais" pages through the rest. */
export default function SteamCatalog() {
  const [typed, setTyped] = useState("");
  const [term, setTerm] = useState("");
  const page = useRef(0);

  const load = useCallback(
    (force: boolean) => {
      page.current = 0;
      return api.steamCatalog(term, 0, force);
    },
    [term],
  );

  const loadMore = useCallback(() => {
    const next = page.current + 1;
    return api.steamCatalog(term, next, false).then((list) => {
      page.current = next;
      return list;
    });
  }, [term]);

  const toolbar = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTerm(typed);
      }}
      className="flex gap-1"
    >
      <input
        data-testid="steam-search"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder={t("steam.catalog.placeholder")}
        aria-label={t("steam.catalog.search")}
        className="canto-field min-w-0 flex-1 px-2 py-1 text-xs"
      />
      <button
        type="submit"
        className="canto-hit min-h-7 shrink-0 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg"
      >
        {t("steam.catalog.search")}
      </button>
    </form>
  );

  return <SteamGames load={load} loadMore={loadMore} empty={t("steam.catalog.empty")} toolbar={toolbar} rows={8} />;
}
