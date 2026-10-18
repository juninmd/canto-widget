import { useCallback, useRef, useState } from "react";
import { api } from "../lib/api";
import { t, type MessageKey } from "../i18n";
import SteamGames from "./SteamGames";

/** The sorts the store answers; "biggest discount" is not one of them, so the wishlist keeps it. */
const SORTS = ["reviews", "price", "new"] as const;
type Sort = (typeof SORTS)[number];

const SORT_LABELS: Record<Sort, MessageKey> = {
  reviews: "steam.catalog.sort.reviews",
  price: "steam.catalog.sort.price",
  new: "steam.catalog.sort.new",
};

/** The store ordered by rating; typing a term narrows it, and the sale toggle and the sort ride along.
 *  "ver mais" pages through the rest. */
export default function SteamCatalog() {
  const [typed, setTyped] = useState("");
  const [term, setTerm] = useState("");
  const [sort, setSort] = useState<Sort>("reviews");
  const [onlySale, setOnlySale] = useState(false);
  const page = useRef(0);

  const load = useCallback(
    (force: boolean) => {
      page.current = 0;
      return api.steamCatalog(term, 0, sort, onlySale, force);
    },
    [term, sort, onlySale],
  );

  const loadMore = useCallback(() => {
    const next = page.current + 1;
    return api.steamCatalog(term, next, sort, onlySale, false).then((list) => {
      page.current = next;
      return list;
    });
  }, [term, sort, onlySale]);

  const toolbar = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTerm(typed);
      }}
      className="flex min-w-0 flex-wrap items-center gap-1"
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
        className="canto-hit shrink-0 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg"
      >
        {t("steam.catalog.search")}
      </button>
      <label className="flex shrink-0 items-center gap-1 text-[11px] text-muted">
        <input
          type="checkbox"
          className="canto-box"
          checked={onlySale}
          onChange={(e) => setOnlySale(e.target.checked)}
        />
        {t("steam.catalog.onSale")}
      </label>
      <select
        aria-label={t("steam.catalog.sort")}
        value={sort}
        onChange={(e) => setSort(e.target.value as Sort)}
        className="canto-hit shrink-0 rounded border border-edge bg-ink px-1 py-0.5 text-[11px] text-muted"
      >
        {SORTS.map((option) => (
          <option key={option} value={option}>
            {t(SORT_LABELS[option])}
          </option>
        ))}
      </select>
    </form>
  );

  return <SteamGames load={load} loadMore={loadMore} empty={t("steam.catalog.empty")} toolbar={toolbar} rows={8} />;
}
