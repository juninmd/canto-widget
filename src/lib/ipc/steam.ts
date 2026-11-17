import { invoke } from "@tauri-apps/api/core";

/** A game on any Steam list; `price` and `original` come from Steam already localized to the region. */
export type SteamRow = {
  appid: number;
  name: string;
  price: string;
  /** Set only while the game is discounted. */
  original: string;
  discount: number;
  /** Positive reviews, 0..=100; null for a game Steam has no review summary for. */
  review: number | null;
  /** Steam's own bucket, as a token the interface translates ("very_positive"); empty when unknown. */
  review_key: string;
  /** How many reviews the percentage is drawn from; 0 when Steam didn't say. */
  review_count: number;
  /** What the discount takes off, in cents; 0 when there is none. */
  saved_cents: number;
  /** Capsule on Steam's CDN; the row asks `steamImage` for it, so the list stays light. */
  art: string;
};
/** `currency` is the ISO 4217 code of the storefront the prices came from. */
export type SteamList = { items: SteamRow[]; has_more: boolean; currency: string };
/** `region` is the storefront in use ("br", "us"...), already resolved from the language. */
export type SteamStatus = {
  configured: boolean;
  steamid: string;
  has_key: boolean;
  name: string;
  region: string;
  watching: boolean;
};
/** A game the player can reach: on the account (with the key) or installed here. Playtimes in minutes. */
export type PlayGame = {
  appid: number;
  name: string;
  /** Wide header, for the list and the cards. */
  art: string;
  /** Vertical library cover, for the grid. */
  cover: string;
  total_min: number;
  recent_min: number;
  /** Unix seconds; 0 when Steam never saw it run. */
  last_played: number;
  installed: boolean;
  size_bytes: number;
};
export type PlayFilter = "all" | "recent" | "installed";
/** `total`/`minutes` cover every match of the filter and search; `hero` is the last game played. */
export type SteamPlay = {
  items: PlayGame[];
  total: number;
  minutes: number;
  pages: number;
  counts: { all: number; recent: number; installed: number };
  hero: PlayGame | null;
  has_key: boolean;
};
/** One update a game posted; `lines` is the trimmed changelog, `date` unix seconds. */
export type NewsItem = {
  gid: string;
  appid: number;
  game: string;
  title: string;
  url: string;
  date: number;
  lines: string[];
  fresh: boolean;
};
export type SteamNews = { items: NewsItem[]; unread: number };
/** A place on the most played chart; `moved` is places gained since the previous chart. */
export type TopGame = { rank: number; appid: number; name: string; art: string; players: number; peak: number; moved: number; mine: boolean };
export type SteamTop = { items: TopGame[]; players: number; pages: number; updated: number };
export type WishSort = "discount" | "price" | "order";
export type SteamWishlist = { items: SteamRow[]; total: number; on_sale: number; hot: number; pages: number; currency: string };

export const steamApi = {
  /** Only the SteamID64 (and an optional Web API key) is stored; every list is fetched in Rust. */
  steamStatus: () => invoke<SteamStatus>("steam_status"),
  /** Returns the saved status; a bad id, a bad key or a bare vanity name without a key is rejected. */
  steamConnect: (steamId: string, apiKey: string) => invoke<SteamStatus>("steam_connect", { steamId, apiKey }),
  steamDisconnect: () => invoke<SteamStatus>("steam_disconnect"),
  /** The storefront the prices, the wording and the currency come from; drops the cached lists. */
  steamRegion: (region: string) => invoke<SteamStatus>("steam_region_set", { region }),
  /** Opt-in OS notifications for hot wishlist sales (75%+) and game updates; answers the value now in effect. */
  steamWatch: (enabled: boolean) => invoke<boolean>("steam_watch_set", { enabled }),
  /** Wishlist deals, biggest discount first; `page` starts at 0. */
  steamDeals: (page = 0, force = false) => invoke<SteamList>("steam_deals", { page, force }),
  steamTrending: (force = false) => invoke<SteamList>("steam_trending", { force }),
  /** Top rated games for `term` (empty = the whole store). `sort` is "reviews", "price" or "new";
   *  `onlySale` asks the store for what is discounted now. `page` starts at 0. */
  steamCatalog: (term = "", page = 0, sort = "reviews", onlySale = false, force = false) =>
    invoke<SteamList>("steam_catalog", { term, page, sort, onlySale, force }),
  /** Every reachable game, last played first; `filter` narrows, `term` searches, `page` starts at 0. */
  steamPlay: (filter: PlayFilter = "all", term = "", page = 0, force = false) =>
    invoke<SteamPlay>("steam_play", { filter, term, page, force }),
  /** Opens the game through the Steam client. */
  steamLaunch: (appid: number) => invoke<void>("steam_launch", { appid }),
  /** Updates of the games installed or played lately; `filter` "installed" keeps only what is here. */
  steamNews: (filter: "all" | "installed" = "all", force = false) => invoke<SteamNews>("steam_news", { filter, force }),
  steamNewsRead: () => invoke<void>("steam_news_read"),
  /** Steam's chart of the games with the most people in them now, 20 per page. */
  steamTop: (page = 0, onlyMine = false, force = false) => invoke<SteamTop>("steam_top", { page, onlyMine, force }),
  /** The whole wishlist, 20 per page, sorted by discount, price or Steam's own order. */
  steamWishlist: (page = 0, sort: WishSort = "discount", force = false) =>
    invoke<SteamWishlist>("steam_wishlist", { page, sort, force }),
  /** One capsule as a `data:` URL, cached in Rust; empty when Steam has no art for the app. */
  steamImage: (url: string) => invoke<string>("steam_image", { url }),
};
