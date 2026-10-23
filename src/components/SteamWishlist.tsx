import { useCallback, useState } from "react";
import { api, type WishSort } from "../lib/api";
import { useSteamView } from "../lib/useSteamView";
import { t } from "../i18n";
import ErrorBanner from "./ErrorBanner";
import Skeleton from "./Skeleton";
import SteamChips from "./SteamChips";
import SteamCountUp from "./SteamCountUp";
import SteamPager from "./SteamPager";
import SteamRowItem from "./SteamRowItem";

/** "Desejos": the whole wishlist with prices, in pages. The 75%+ sales burn, and those are what the
 *  bell rings for, once per sale. */
export default function SteamWishlist({ watching, onHot }: { watching: boolean; onHot: (hot: number) => void }) {
  const [sort, setSort] = useState<WishSort>("discount");
  const [page, setPage] = useState(0);
  const load = useCallback(
    (force: boolean) =>
      api.steamWishlist(page, sort, force).then((list) => {
        onHot(list.hot);
        return list;
      }),
    [page, sort, onHot],
  );
  const { data, error, busy, run } = useSteamView(load);

  if (!data) {
    return error ? <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} /> : <Skeleton label={t("steam.loading")} rows={6} />;
  }
  const stat = "rounded-xl border border-edge bg-ink px-2 py-1.5";
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="grid shrink-0 grid-cols-3 gap-1.5">
        <div className={stat}>
          <p className="text-base font-extrabold tabular-nums text-fg">
            <SteamCountUp value={data.total} />
          </p>
          <p className="text-[10px] text-faint">{t("steam.wish.total")}</p>
        </div>
        <div className={stat}>
          <p className="text-base font-extrabold tabular-nums text-fg">
            <SteamCountUp value={data.on_sale} />
          </p>
          <p className="text-[10px] text-faint">{t("steam.wish.onSale")}</p>
        </div>
        <div className={`${stat} ${data.hot > 0 ? "border-[#f97316]/60" : ""}`}>
          <p className={`text-base font-extrabold tabular-nums ${data.hot > 0 ? "text-[#f97316]" : "text-fg"}`}>
            <SteamCountUp value={data.hot} />
          </p>
          <p className="text-[10px] text-faint">{t("steam.wish.hot")}</p>
        </div>
      </div>
      <p className={`shrink-0 text-[11px] ${watching ? "text-accent-text" : "text-faint"}`}>
        {watching ? t("steam.wish.alertOn") : t("steam.wish.alertOff")}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <SteamChips
          label={t("steam.wish.sort")}
          value={sort}
          onChange={(s) => {
            setSort(s);
            setPage(0);
          }}
          options={[
            { key: "discount", label: t("steam.wish.sort.discount") },
            { key: "price", label: t("steam.wish.sort.price") },
            { key: "order", label: t("steam.wish.sort.order") },
          ]}
        />
        <button
          type="button"
          onClick={() => void run(true)}
          disabled={busy}
          className="canto-hit ml-auto min-h-7 rounded-lg border border-edge px-2 text-xs text-muted hover:bg-hover hover:text-fg disabled:opacity-50"
        >
          {t("steam.refresh")}
        </button>
      </div>
      {error && <ErrorBanner message={error} onRetry={() => void run(true)} busy={busy} />}
      {data.items.length === 0 ? (
        <p className="text-xs text-faint">{t("steam.wish.empty")}</p>
      ) : (
        <ul key={`${sort}:${page}`} className="steam-swap min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {data.items.map((row, i) => (
            <SteamRowItem key={row.appid} row={row.price ? row : { ...row, price: t("steam.wish.unpriced") }} currency={data.currency} index={i} />
          ))}
        </ul>
      )}
      <SteamPager page={page} pages={data.pages} onPage={setPage} />
    </div>
  );
}
