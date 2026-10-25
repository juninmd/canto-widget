import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PlayGame, SteamList, SteamNews, SteamPlay, SteamRow, SteamStatus, SteamTop, SteamWishlist } from "../lib/api";

const calls: { cmd: string; args: Record<string, unknown> }[] = [];
let status: SteamStatus;
let deals: SteamList;
let moreDeals: SteamList;
let trending: SteamList;
let catalog: SteamList;
let moreCatalog: SteamList;
let play: SteamPlay;
let news: SteamNews;
let top: SteamTop;
let wishlist: SteamWishlist;
let fail = "";
let failStatus = "";
/** Holds a matching call open until the test releases it, to race answers or double clicks. */
let hold: ((cmd: string, args: Record<string, unknown>) => Promise<void> | null) | null = null;

const CAPSULE = "data:image/png;base64,iVBORw0KGgo=";

// happy-dom ships an IntersectionObserver that never fires, so the lazy thumbnail would never load.
globalThis.IntersectionObserver = class {
  private cb: (entries: { isIntersecting: boolean }[]) => void;
  constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ isIntersecting: true }]);
  }
  disconnect() {}
} as unknown as typeof IntersectionObserver;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    const held = hold?.(cmd, args);
    if (held) return held.then(() => answer(cmd, args));
    return answer(cmd, args);
  },
}));

function answer(cmd: string, args: Record<string, unknown>): Promise<unknown> {
  {
    if (cmd === "steam_status") return failStatus ? Promise.reject(failStatus) : Promise.resolve(status);
    if (cmd === "steam_image") return Promise.resolve(CAPSULE);
    if (fail && cmd.startsWith("steam_")) return Promise.reject(fail);
    switch (cmd) {
      case "steam_connect":
        status = {
          configured: true,
          steamid: String(args.steamId),
          has_key: Boolean(args.apiKey),
          name: "",
          region: "br",
          watching: false,
        };
        return Promise.resolve(status);
      case "steam_disconnect":
        status = { configured: false, steamid: "", has_key: false, name: "", region: "br", watching: false };
        return Promise.resolve(status);
      case "steam_watch_set":
        return Promise.resolve(Boolean(args.enabled));
      case "steam_region_set":
        status = { ...status, region: String(args.region) };
        deals = { ...deals, currency: String(args.region) === "us" ? "USD" : "BRL" };
        return Promise.resolve(status);
      case "steam_deals":
        return Promise.resolve(Number(args.page ?? 0) === 0 ? deals : moreDeals);
      case "steam_trending":
        return Promise.resolve(trending);
      case "steam_catalog":
        return Promise.resolve(Number(args.page ?? 0) === 0 ? catalog : moreCatalog);
      case "steam_play":
        return Promise.resolve(play);
      case "steam_news":
        return Promise.resolve(news);
      case "steam_news_read":
        news = { unread: 0, items: news.items.map((i) => ({ ...i, fresh: false })) };
        return Promise.resolve(null);
      case "steam_top":
        return Promise.resolve(args.onlyMine ? { ...top, items: top.items.filter((g) => g.mine) } : top);
      case "steam_wishlist":
        return Promise.resolve(wishlist);
      default:
        return Promise.resolve(null);
    }
  }
}

const { default: SteamTab } = await import("./SteamTab");

const game = (appid: number, name: string, price: string, extra: Partial<SteamRow> = {}): SteamRow => ({
  appid,
  name,
  price,
  original: "",
  discount: 0,
  review: null,
  review_key: "",
  review_count: 0,
  saved_cents: 0,
  art: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_231x87.jpg`,
  ...extra,
});

async function show() {
  render(<SteamTab onError={() => {}} />);
  await act(async () => {});
}

/** The wishlist deals, one sub-tab away from "jogue agora". */
async function showDeals() {
  await show();
  await click(screen.getByRole("tab", { name: "ofertas" }));
}

const owned = (appid: number, name: string, extra: Partial<PlayGame> = {}): PlayGame => ({
  appid,
  name,
  art: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`,
  cover: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/library_600x900.jpg`,
  total_min: 0,
  recent_min: 0,
  last_played: 0,
  installed: false,
  size_bytes: 0,
  ...extra,
});

/** A click plus the microtask flush its fetch needs. */
async function click(el: Element) {
  await act(async () => fireEvent.click(el));
  await act(async () => {});
}

const rows = () => [...document.querySelectorAll("[data-steam]")].map((li) => li.getAttribute("data-steam"));

beforeEach(() => {
  calls.length = 0;
  hold = null;
  fail = "";
  failStatus = "";
  status = { configured: true, steamid: "76561190000000000", has_key: false, name: "", region: "br", watching: false };
  deals = {
    has_more: false,
    currency: "BRL",
    items: [
      game(620, "Portal 2", "R$9,99", {
        original: "R$33,99",
        discount: 70,
        review: 91,
        review_key: "very_positive",
        review_count: 12345,
        saved_cents: 4500,
      }),
      game(400, "Portal", "R$24,99", { original: "R$29,99", discount: 20, saved_cents: 1000 }),
    ],
  };
  trending = {
    items: [
      game(730, "Counter-Strike 2", "Grátis", { review: 88, review_key: "very_positive", review_count: 9 }),
      game(740, "Ember Path", "R$ 12,49", { original: "R$ 49,99", discount: 75, saved_cents: 3750 }),
    ],
    has_more: false,
    currency: "BRL",
  };
  catalog = {
    items: [game(413150, "Stardew Valley", "R$24,99", { review: 98, review_key: "overwhelmingly_positive", review_count: 1 })],
    has_more: true,
    currency: "BRL",
  };
  moreCatalog = {
    items: [game(620, "Portal 2", "R$33,99", { review: 89, review_key: "very_positive", review_count: 3854 })],
    has_more: false,
    currency: "BRL",
  };
  moreDeals = { items: [game(440, "Team Fortress 2", "Grátis")], has_more: false, currency: "BRL" };
  const now = Math.floor(Date.now() / 1000);
  const bg3 = owned(1086940, "Baldur's Gate 3", { total_min: 12840, recent_min: 360, last_played: now - 86400, installed: true, size_bytes: 150e9 });
  play = {
    items: [bg3, owned(620, "Portal 2", { total_min: 4000, last_played: now - 40 * 86400 })],
    total: 30,
    minutes: 16840,
    pages: 2,
    counts: { all: 30, recent: 1, installed: 1 },
    hero: bg3,
    has_key: true,
  };
  news = {
    unread: 1,
    items: [
      { gid: "5003", appid: 1086940, game: "Baldur's Gate 3", title: "Patch 8 is live", url: "https://store.steampowered.com/news/app/1086940/view/5003", date: now - 3600, lines: ["Crossplay", "Photo mode"], fresh: true },
      { gid: "5001", appid: 620, game: "Portal 2", title: "Hotfix 2", url: "https://store.steampowered.com/news/app/620", date: now - 10 * 86400, lines: [], fresh: false },
    ],
  };
  top = {
    players: 2500000,
    pages: 5,
    updated: now,
    items: [
      { rank: 1, appid: 730, name: "Counter-Strike 2", art: "", players: 1500000, peak: 1700000, moved: 0, mine: true },
      { rank: 2, appid: 570, name: "Dota 2", art: "", players: 600000, peak: 780000, moved: 2, mine: false },
      { rank: 3, appid: 578080, name: "PUBG", art: "", players: 400000, peak: 700000, moved: -1, mine: false },
    ],
  };
  wishlist = {
    total: 48,
    on_sale: 9,
    hot: 2,
    pages: 3,
    currency: "BRL",
    items: [
      game(814380, "Sekiro", "R$ 45,99", { original: "R$ 229,90", discount: 80, saved_cents: 18391 }),
      game(1850570, "Death Stranding", "R$ 37,49", { original: "R$ 149,99", discount: 75, saved_cents: 11250 }),
      game(1030300, "Silksong", "", {}),
    ],
  };
});
afterEach(cleanup);

test("an unconnected tab asks for the SteamID and connects", async () => {
  status = { configured: false, steamid: "", has_key: false, name: "", region: "br", watching: false };
  await show();
  expect(screen.getByText("Conectar à Steam")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("SteamID64, link do perfil ou nome de perfil"), {
    target: { value: "76561190000000000" },
  });
  fireEvent.change(screen.getByLabelText("Chave da Steam Web API (opcional)"), { target: { value: "chave" } });
  await click(screen.getByRole("button", { name: "conectar" }));
  expect(calls.find((c) => c.cmd === "steam_connect")?.args).toEqual({ steamId: "76561190000000000", apiKey: "chave" });
  expect(screen.getByRole("tab", { name: "ofertas" })).toBeTruthy();
});

test("a deal shows the capsule, the score with its count, the discount and what it saves", async () => {
  await showDeals();
  expect(rows()).toEqual(["620", "400"]);
  expect(screen.getByText("Portal 2")).toBeTruthy();
  expect(screen.getByText(/91%/)).toBeTruthy();
  expect(screen.getByText("Muito positivas")).toBeTruthy();
  expect(screen.getByText("12.345 análises")).toBeTruthy();
  expect(screen.getByText("R$9,99")).toBeTruthy();
  expect(screen.getByText("R$33,99")).toBeTruthy();
  expect(screen.getByText("-70%")).toBeTruthy();
  expect(screen.getByText(/economize R\$ 45,00/)).toBeTruthy();
  expect(screen.getByText(/no total, R\$ 55,00 de economia/)).toBeTruthy();
  // The capsule went through Rust, and only ever as a data URL.
  expect(calls.some((c) => c.cmd === "steam_image")).toBe(true);
  expect(document.querySelector('img[src^="data:image/"]')).toBeTruthy();
});

test("a game with a single review gets the singular wording", async () => {
  catalog = { items: [game(413150, "Stardew Valley", "R$24,99", { review: 98, review_count: 1 })], has_more: false, currency: "BRL" };
  await show();
  await click(screen.getByRole("tab", { name: "catálogo" }));
  expect(screen.getByText("1 análise")).toBeTruthy();
});

test("the top sellers are numbered and a free game shows its word", async () => {
  await show();
  await click(screen.getByRole("tab", { name: "em alta" }));
  expect(calls.some((c) => c.cmd === "steam_trending")).toBe(true);
  expect(screen.getByText("#1")).toBeTruthy();
  expect(screen.getByText("Counter-Strike 2")).toBeTruthy();
  expect(screen.getByText("Grátis")).toBeTruthy();
  expect(screen.getByText("#2")).toBeTruthy();
  // What the discounts save only means something on a wishlist, so the top sellers don't total it.
  expect(screen.queryByText(/no total/)).toBeNull();
});

test("o catálogo searches with the term that was typed", async () => {
  await show();
  await click(screen.getByRole("tab", { name: "catálogo" }));
  expect(calls.filter((c) => c.cmd === "steam_catalog").map((c) => c.args)).toEqual([
    { term: "", page: 0, sort: "reviews", onlySale: false, force: false },
  ]);
  fireEvent.change(screen.getByTestId("steam-search"), { target: { value: "portal" } });
  await click(screen.getByRole("button", { name: "buscar no catálogo" }));
  expect(calls.filter((c) => c.cmd === "steam_catalog").map((c) => c.args)).toEqual([
    { term: "", page: 0, sort: "reviews", onlySale: false, force: false },
    { term: "portal", page: 0, sort: "reviews", onlySale: false, force: false },
  ]);
});

/** A promise and the function that settles it. */
function gate() {
  let open = () => {};
  const promise = new Promise<void>((resolve) => (open = resolve));
  return { promise, open };
}

test("o catálogo drops a slower answer for an older search instead of overwriting the newer one", async () => {
  const slow = gate();
  hold = (cmd, args) => (cmd === "steam_catalog" && args.term === "slow" ? slow.promise : null);
  await show();
  await click(screen.getByRole("tab", { name: "catálogo" }));
  fireEvent.change(screen.getByTestId("steam-search"), { target: { value: "slow" } });
  await click(screen.getByRole("button", { name: "buscar no catálogo" }));
  catalog = { ...catalog, items: [game(620, "Portal 2", "R$33,99")], has_more: false };
  fireEvent.change(screen.getByTestId("steam-search"), { target: { value: "portal" } });
  await click(screen.getByRole("button", { name: "buscar no catálogo" }));
  expect(rows()).toEqual(["620"]);

  catalog = { ...catalog, items: [game(1, "Stale", "R$1,00")] };
  await act(async () => slow.open());
  await act(async () => {});
  expect(rows()).toEqual(["620"]);
});

test("o catálogo pede outra busca quando o filtro ou a ordem mudam", async () => {
  await show();
  await click(screen.getByRole("tab", { name: "catálogo" }));
  const last = () => calls.filter((c) => c.cmd === "steam_catalog").at(-1)?.args;

  fireEvent.click(screen.getByRole("checkbox", { name: "só em promoção" }));
  await act(async () => {});
  expect(last()).toEqual({ term: "", page: 0, sort: "reviews", onlySale: true, force: false });

  fireEvent.change(screen.getByLabelText("ordenar"), { target: { value: "price" } });
  await act(async () => {});
  expect(last()).toEqual({ term: "", page: 0, sort: "price", onlySale: true, force: false });
});

test("o catálogo pages through the rest of the store and appends what comes", async () => {
  await show();
  await click(screen.getByRole("tab", { name: "catálogo" }));
  expect(rows()).toEqual(["413150"]);
  await click(screen.getByRole("button", { name: "ver mais jogos" }));
  expect(calls.filter((c) => c.cmd === "steam_catalog").map((c) => c.args)).toEqual([
    { term: "", page: 0, sort: "reviews", onlySale: false, force: false },
    { term: "", page: 1, sort: "reviews", onlySale: false, force: false },
  ]);
  expect(rows()).toEqual(["413150", "620"]);
  expect(screen.queryByRole("button", { name: "ver mais jogos" })).toBeNull();
});

test("atualizar asks Rust to force the fetch and clicking the row opens the store", async () => {
  await showDeals();
  await click(screen.getByRole("button", { name: "atualizar" }));
  expect(calls.filter((c) => c.cmd === "steam_deals").map((c) => c.args)).toEqual([
    { page: 0, force: false },
    { page: 0, force: true },
  ]);
  await click(screen.getByRole("button", { name: /Portal 2/ }));
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://store.steampowered.com/app/620/" });
});

test("the store picker shows the flag and currency, searches and switches the store", async () => {
  await showDeals();
  const picker = () => screen.getByLabelText("região da loja");
  expect(picker().textContent).toContain("BRL");
  expect(screen.getByText(/no total, R\$ 55,00 de economia/)).toBeTruthy();

  await click(picker());
  expect(document.querySelectorAll("[data-region]").length).toBe(12);
  fireEvent.change(screen.getByLabelText("país ou moeda"), { target: { value: "iene" } });
  await act(async () => {});
  expect([...document.querySelectorAll("[data-region]")].map((li) => li.getAttribute("data-region"))).toEqual(["jp"]);
  fireEvent.change(screen.getByLabelText("país ou moeda"), { target: { value: "" } });
  await act(async () => {});

  deals = { ...deals, currency: "USD" };
  await click(document.querySelector('[data-region="us"]')!);
  expect(calls.find((c) => c.cmd === "steam_region_set")?.args).toEqual({ region: "us" });
  expect(picker().textContent).toContain("USD");
  // The cached lists belonged to the other store, so the tab refetches the one on screen.
  expect(calls.filter((c) => c.cmd === "steam_deals").length).toBeGreaterThan(1);
  expect(screen.getByText(/economize US\$ 45,00/)).toBeTruthy();
});

test("ofertas pages through the wishlist without rescanning what is already listed", async () => {
  deals = { ...deals, has_more: true };
  await showDeals();
  expect(rows()).toEqual(["620", "400"]);
  await click(screen.getByRole("button", { name: "ver mais jogos" }));
  expect(calls.filter((c) => c.cmd === "steam_deals").map((c) => c.args)).toEqual([
    { page: 0, force: false },
    { page: 1, force: false },
  ]);
  expect(rows()).toEqual(["620", "400", "440"]);
  expect(screen.queryByRole("button", { name: "ver mais jogos" })).toBeNull();
});

test("a row Steam has no title for falls back to the appid instead of inventing a name", async () => {
  deals = { ...deals, items: [game(900999, "", "R$ 9,99")] };
  await showDeals();
  expect(screen.getByText("#900999")).toBeTruthy();
  expect(screen.queryByText(/jogo 900999/)).toBeNull();
});

test("the persona name opens the profile behind the SteamID64", async () => {
  status = { ...status, name: "Ana Exemplo" };
  await show();
  await click(screen.getByRole("button", { name: "Ana Exemplo" }));
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({
    url: "https://steamcommunity.com/profiles/76561190000000000/",
  });
});

test("a keyless account can paste the Web API key later, without reconnecting", async () => {
  await show();
  expect(screen.queryByLabelText("Chave da Steam Web API (opcional)")).toBeNull();
  await click(screen.getByRole("button", { name: "sem chave" }));
  fireEvent.change(screen.getByLabelText("Chave da Steam Web API (opcional)"), { target: { value: "chave-nova" } });
  await click(screen.getByRole("button", { name: "conectar" }));
  expect(calls.find((c) => c.cmd === "steam_connect")?.args).toEqual({
    steamId: "76561190000000000",
    apiKey: "chave-nova",
  });
  expect(screen.queryByLabelText("Chave da Steam Web API (opcional)")).toBeNull();
});

test("disconnecting leaves the key form closed for the next account", async () => {
  await show();
  await click(screen.getByRole("button", { name: "sem chave" }));
  expect(screen.getByLabelText("Chave da Steam Web API (opcional)")).toBeTruthy();
  await click(screen.getByRole("button", { name: "desconectar" }));
  await click(screen.getByRole("button", { name: "desconectar" }));
  // The form was for the account that left: reconnecting must not bring it back open.
  status = { configured: true, steamid: "76561190000000000", has_key: false, name: "", region: "br", watching: false };
  fireEvent.change(screen.getByLabelText("SteamID64, link do perfil ou nome de perfil"), {
    target: { value: "76561190000000000" },
  });
  await click(screen.getByRole("button", { name: "conectar" }));
  expect(screen.queryByLabelText("Chave da Steam Web API (opcional)")).toBeNull();
});

test("the bell turns the sale and update alerts on and off", async () => {
  await show();
  const bell = () => screen.getByRole("button", { name: "avisar promoções de 75% ou mais e atualizações dos jogos" });
  expect(bell().getAttribute("aria-pressed")).toBe("false");

  await click(bell());
  expect(calls.find((c) => c.cmd === "steam_watch_set")?.args).toEqual({ enabled: true });
  expect(bell().getAttribute("aria-pressed")).toBe("true");

  await click(bell());
  expect(calls.filter((c) => c.cmd === "steam_watch_set").map((c) => c.args)).toEqual([
    { enabled: true },
    { enabled: false },
  ]);
  expect(bell().getAttribute("aria-pressed")).toBe("false");
});

test("desconectar pergunta antes e só então esquece a conta", async () => {
  await show();
  await click(screen.getByRole("button", { name: "desconectar" }));
  expect(calls.some((c) => c.cmd === "steam_disconnect")).toBe(false);
  expect(screen.getByRole("alert").textContent).toContain("desconectar a conta?");

  await click(screen.getByRole("button", { name: "cancelar" }));
  expect(calls.some((c) => c.cmd === "steam_disconnect")).toBe(false);

  await click(screen.getByRole("button", { name: "desconectar" }));
  await click(screen.getByRole("button", { name: "desconectar" }));
  expect(calls.some((c) => c.cmd === "steam_disconnect")).toBe(true);
  expect(screen.getByText("Conectar à Steam")).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("a double click on the disconnect confirm sends one request", async () => {
  const slow = gate();
  hold = (cmd) => (cmd === "steam_disconnect" ? slow.promise : null);
  await show();
  await click(screen.getByRole("button", { name: "desconectar" }));
  const confirm = screen.getByRole("button", { name: "desconectar" });
  await click(confirm);
  await click(confirm);
  expect(calls.filter((c) => c.cmd === "steam_disconnect").length).toBe(1);
  await act(async () => slow.open());
  await act(async () => {});
  expect(screen.getByText("Conectar à Steam")).toBeTruthy();
});

test("a failed list keeps the retry banner on screen", async () => {
  fail = "steam: HTTP 500";
  await show();
  expect(screen.getByRole("alert").textContent).toContain("HTTP 500");
});

test("a status failure shows the retry banner instead of the form", async () => {
  failStatus = "steam: sem conexão";
  await show();
  expect(screen.getByRole("alert").textContent).toContain("sem conexão");
  expect(screen.queryByText("Conectar à Steam")).toBeNull();
});

test("jogue agora opens on the last game, lists every game with its art and launches through Steam", async () => {
  await show();
  expect(calls.find((c) => c.cmd === "steam_play")?.args).toEqual({ filter: "all", term: "", page: 0, force: false });
  const hero = document.querySelector('[data-steam-hero="1086940"]');
  expect(hero?.textContent).toContain("Baldur's Gate 3");
  expect(hero?.textContent).toContain("jogado ontem");
  expect(hero?.textContent).toContain("214 h no total");
  expect(rows()).toEqual(["1086940", "620"]);
  expect(screen.getByText("30 jogos · 280 h 40 min jogados")).toBeTruthy();
  expect(screen.getByText("página 1 de 2")).toBeTruthy();
  expect(document.querySelector('[data-steam="1086940"]')?.textContent).toContain("instalado");

  await click(screen.getAllByRole("button", { name: "jogar Baldur's Gate 3" })[0]);
  expect(calls.find((c) => c.cmd === "steam_launch")?.args).toEqual({ appid: 1086940 });
  expect(calls.some((c) => c.cmd === "steam_image" && String(c.args.url).endsWith("/header.jpg"))).toBe(true);
});

test("jogue agora filters, searches, pages and switches between list, cards and grid", async () => {
  await show();
  const last = () => calls.filter((c) => c.cmd === "steam_play").at(-1)?.args;
  await click(screen.getByRole("button", { name: /instalados/ }));
  expect(last()).toEqual({ filter: "installed", term: "", page: 0, force: false });
  fireEvent.change(screen.getByTestId("steam-play-search"), { target: { value: "portal" } });
  await act(async () => fireEvent.submit(screen.getByTestId("steam-play-search").closest("form")!));
  await act(async () => {});
  expect(last()).toEqual({ filter: "installed", term: "portal", page: 0, force: false });
  await click(screen.getByRole("button", { name: "próxima página" }));
  expect(last()).toEqual({ filter: "installed", term: "portal", page: 1, force: false });

  await click(screen.getByRole("button", { name: "grade" }));
  expect(localStorage.getItem("canto.steam.view")).toBe("grid");
  expect(calls.some((c) => c.cmd === "steam_image" && String(c.args.url).endsWith("/library_600x900.jpg"))).toBe(true);
  await click(screen.getByRole("button", { name: "lista" }));
  expect(localStorage.getItem("canto.steam.view")).toBe("list");
  localStorage.removeItem("canto.steam.view");
});

test("jogue agora without the key says only the installed games show", async () => {
  play = { ...play, has_key: false };
  await show();
  expect(screen.getByText(/sem a chave da Web API aparecem só os jogos instalados/)).toBeTruthy();
});

test("atualizações opens the newest changelog, links to Steam and marks everything as read", async () => {
  await show();
  expect(document.querySelector('[role="tab"] [aria-hidden="true"]')?.textContent).toBe("1");
  await click(screen.getByRole("tab", { name: "atualizações" }));
  expect(calls.filter((c) => c.cmd === "steam_news").at(-1)?.args).toEqual({ filter: "all", force: false });
  expect(screen.getByText("Crossplay")).toBeTruthy();
  expect(screen.getByText("Patch 8 is live").parentElement?.querySelector('[title="nova"]')).toBeTruthy();
  await click(screen.getByRole("button", { name: /ler as notas completas na Steam/ }));
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://store.steampowered.com/news/app/1086940/view/5003" });

  await click(screen.getByRole("button", { name: "marcar como lidas" }));
  expect(calls.some((c) => c.cmd === "steam_news_read")).toBe(true);
  expect(screen.queryByRole("button", { name: "marcar como lidas" }) === null).toBe(true);
  await click(screen.getByRole("button", { name: "instalados" }));
  expect(calls.filter((c) => c.cmd === "steam_news").at(-1)?.args).toEqual({ filter: "installed", force: false });
});

test("marcar como lidas sends one request per press and its retry marks again", async () => {
  const slow = gate();
  hold = (cmd) => (cmd === "steam_news_read" ? slow.promise : null);
  await show();
  await click(screen.getByRole("tab", { name: "atualizações" }));
  const mark = screen.getByRole("button", { name: "marcar como lidas" });
  await click(mark);
  await click(mark);
  expect(calls.filter((c) => c.cmd === "steam_news_read").length).toBe(1);
  // The first press fails: the banner's retry marks again instead of only reloading the list.
  fail = "steam: HTTP 500";
  await act(async () => slow.open());
  await act(async () => {});
  expect(screen.getByRole("alert").textContent).toContain("HTTP 500");
  hold = null;
  fail = "";
  await click(screen.getByRole("button", { name: "tentar de novo" }));
  expect(calls.filter((c) => c.cmd === "steam_news_read").length).toBe(2);
  expect(screen.queryByRole("alert") === null).toBe(true);
});

test("desejos lists the whole wishlist, sets 75% sales on fire and pages", async () => {
  await show();
  await click(screen.getByRole("tab", { name: "desejos" }));
  expect(calls.filter((c) => c.cmd === "steam_wishlist").at(-1)?.args).toEqual({ page: 0, sort: "discount", force: false });
  expect(rows()).toEqual(["814380", "1850570", "1030300"]);
  expect(document.querySelector('[data-steam="814380"] .steam-hot-badge')?.textContent).toBe("-80%");
  expect(document.querySelector('[data-steam="1850570"] .steam-hot-badge')).toBeTruthy();
  expect(screen.getByText("sem preço ainda")).toBeTruthy();
  expect(screen.getByText(/ligue o sino/)).toBeTruthy();

  await click(screen.getByRole("button", { name: "menor preço" }));
  expect(calls.filter((c) => c.cmd === "steam_wishlist").at(-1)?.args).toEqual({ page: 0, sort: "price", force: false });
  await click(screen.getByRole("button", { name: "página 3" }));
  expect(calls.filter((c) => c.cmd === "steam_wishlist").at(-1)?.args).toEqual({ page: 2, sort: "price", force: false });
});

test("mais jogados ranks by players now, shows the movement and filters to my games", async () => {
  await show();
  await click(screen.getByRole("tab", { name: "mais jogados" }));
  expect(calls.filter((c) => c.cmd === "steam_top").at(-1)?.args).toEqual({ page: 0, onlyMine: false, force: false });
  expect(rows()).toEqual(["730", "570", "578080"]);
  expect(document.querySelector('[data-steam="730"]')?.textContent).toContain("1.500.000");
  expect(document.querySelector('[data-steam="730"]')?.textContent).toContain("pico hoje 1.700.000");
  expect(screen.getByText(/subiu 2/)).toBeTruthy();
  expect(screen.getByText(/caiu 1/)).toBeTruthy();

  await click(screen.getByRole("button", { name: "só os meus" }));
  expect(calls.filter((c) => c.cmd === "steam_top").at(-1)?.args).toEqual({ page: 0, onlyMine: true, force: false });
  expect(rows()).toEqual(["730"]);
});
