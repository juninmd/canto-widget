import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { SteamList, SteamRecent, SteamRow, SteamStatus } from "../lib/api";

const calls: { cmd: string; args: Record<string, unknown> }[] = [];
let status: SteamStatus;
let deals: SteamList;
let trending: SteamList;
let catalog: SteamList;
let recent: SteamRecent;
let fail = "";
let failStatus = "";

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "steam_status") return failStatus ? Promise.reject(failStatus) : Promise.resolve(status);
    if (fail && cmd.startsWith("steam_")) return Promise.reject(fail);
    switch (cmd) {
      case "steam_connect":
        status = { configured: true, steamid: String(args.steamId), has_key: Boolean(args.apiKey), name: "" };
        return Promise.resolve(status);
      case "steam_disconnect":
        status = { configured: false, steamid: "", has_key: false, name: "" };
        return Promise.resolve(status);
      case "steam_deals":
        return Promise.resolve(deals);
      case "steam_trending":
        return Promise.resolve(trending);
      case "steam_catalog":
        return Promise.resolve(catalog);
      case "steam_recent":
        return Promise.resolve(recent);
      default:
        return Promise.resolve(null);
    }
  },
}));

const { default: SteamTab } = await import("./SteamTab");

const game = (appid: number, name: string, price: string, original = "", discount = 0, review: number | null = null): SteamRow => ({
  appid,
  name,
  price,
  original,
  discount,
  review,
  review_label: "",
});

async function show() {
  render(<SteamTab onError={() => {}} />);
  await act(async () => {});
}

/** A click plus the microtask flush its fetch needs. */
async function click(el: Element) {
  await act(async () => fireEvent.click(el));
  await act(async () => {});
}

const rows = () => [...document.querySelectorAll("[data-steam]")].map((li) => li.getAttribute("data-steam"));

beforeEach(() => {
  calls.length = 0;
  fail = "";
  failStatus = "";
  status = { configured: true, steamid: "76561190000000000", has_key: false, name: "" };
  deals = { items: [game(620, "Portal 2", "R$9,99", "R$33,99", 70)], has_more: false };
  trending = { items: [game(730, "Counter-Strike 2", "Grátis")], has_more: false };
  catalog = { items: [game(413150, "Stardew Valley", "R$24,99", "", 0, 98)], has_more: false };
  recent = { items: [], has_key: false };
});
afterEach(cleanup);

test("an unconnected tab asks for the SteamID and connects", async () => {
  status = { configured: false, steamid: "", has_key: false, name: "" };
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

test("ofertas lists the wishlist deals with the discount and the crossed-out price", async () => {
  await show();
  expect(rows()).toEqual(["620"]);
  expect(screen.getByText("Portal 2")).toBeTruthy();
  expect(screen.getByText("R$9,99")).toBeTruthy();
  expect(screen.getByText("R$33,99")).toBeTruthy();
  expect(screen.getByText("-70%")).toBeTruthy();
  await click(screen.getByRole("button", { name: /Portal 2/ }));
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://store.steampowered.com/app/620/" });
});

test("em alta and o catálogo each load their own list", async () => {
  await show();
  await click(screen.getByRole("tab", { name: "em alta" }));
  expect(calls.some((c) => c.cmd === "steam_trending")).toBe(true);
  expect(screen.getByText("Counter-Strike 2")).toBeTruthy();
  await click(screen.getByRole("tab", { name: "catálogo" }));
  expect(screen.getByText("Stardew Valley")).toBeTruthy();
  expect(screen.getByText("98%")).toBeTruthy();
});

test("jogue agora explains the missing key, and with a key it lists both playtimes", async () => {
  await show();
  await click(screen.getByRole("tab", { name: "jogue agora" }));
  expect(screen.getByText(/adicione a chave da Steam Web API/)).toBeTruthy();

  status = { ...status, has_key: true };
  recent = { items: [{ appid: 620, name: "Portal 2", recent_min: 135, total_min: 4000 }], has_key: true };
  await click(screen.getByRole("tab", { name: "ofertas" }));
  await click(screen.getByRole("tab", { name: "jogue agora" }));
  const row = document.querySelector('[data-steam="620"]');
  expect(row?.textContent).toContain("Portal 2");
  expect(row?.textContent).toContain("2 h 15 min nas últimas 2 semanas");
  expect(row?.textContent).toContain("66 h 40 min no total");
});

test("o catálogo searches with the term that was typed", async () => {
  await show();
  await click(screen.getByRole("tab", { name: "catálogo" }));
  expect(calls.filter((c) => c.cmd === "steam_catalog").map((c) => c.args)).toEqual([{ term: "", force: false }]);
  fireEvent.change(screen.getByTestId("steam-search"), { target: { value: "portal" } });
  await click(screen.getByRole("button", { name: "buscar no catálogo" }));
  expect(calls.filter((c) => c.cmd === "steam_catalog").map((c) => c.args)).toEqual([
    { term: "", force: false },
    { term: "portal", force: false },
  ]);
});

test("atualizar asks Rust to force the fetch", async () => {
  await show();
  await click(screen.getByRole("button", { name: "atualizar" }));
  expect(calls.filter((c) => c.cmd === "steam_deals").map((c) => c.args)).toEqual([{ force: false }, { force: true }]);
});

test("desconectar forgets the account and goes back to the form", async () => {
  await show();
  await click(screen.getByRole("button", { name: "desconectar" }));
  expect(calls.some((c) => c.cmd === "steam_disconnect")).toBe(true);
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
