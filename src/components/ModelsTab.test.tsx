import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ModelRow, ModelsView } from "../lib/api";

let view: ModelsView;
const calls: { cmd: string; args: Record<string, unknown> }[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "models_get") return Promise.resolve(view);
    if (cmd === "models_alerts_set") return Promise.resolve(args.enabled);
    return Promise.resolve(null);
  },
}));

const { default: ModelsTab } = await import("./ModelsTab");

const row = (id: string, name: string, creator: string, rank: number, score: number, price: number | null, speed: number | null, badge: ModelRow["badge"] = null): ModelRow => ({
  id,
  name,
  creator,
  score,
  price,
  speed,
  rank,
  badge,
});

const models = [
  row("a", "Aurora 4", "Lumen Labs", 1, 73.2, 3.44, 142.7, "new"),
  row("n", "Nimbus Ultra", "Stratos", 2, 70, 0.9, 310, "up"),
  row("o", "Orca Think", "Pelagic AI", 3, 61.5, null, 95),
  row("b", "Brisa Mini", "Vento", 4, 40, 0.1, null),
];

function connected(extra: Partial<ModelsView> = {}): ModelsView {
  return { alerts: false, models, total: 187, fetched_at: Date.now() - 2 * 3_600_000, next_fetch_at: Date.now() + 3_600_000, throttled: false, error: null, ...extra };
}

async function show() {
  render(<ModelsTab />);
  await act(async () => {});
}

const names = () => [...document.querySelectorAll("[data-model]")].map((li) => li.getAttribute("data-model"));

beforeEach(() => {
  calls.length = 0;
  view = connected();
});
afterEach(cleanup);

test("lists the ranking with rank, creator, badges, score, price and speed", async () => {
  await show();
  expect(screen.getByText("Intelligence Index · 187 modelos")).toBeTruthy();
  expect(screen.getByText("atualizado há 2 h")).toBeTruthy();
  expect(names()).toEqual(["a", "n", "o", "b"]);
  expect(screen.getByText("#1").className).toContain("text-accent");
  expect(screen.getByText("#4").className).not.toContain("text-accent");
  expect(screen.getByText("Lumen Labs")).toBeTruthy();
  expect(screen.getByText("novo")).toBeTruthy();
  expect(screen.getByText("subiu")).toBeTruthy();
  expect(screen.getByText("73,2")).toBeTruthy();
  expect(screen.getByText("$3,44 / 1M tokens")).toBeTruthy();
  expect(screen.getByText("143 tok/s")).toBeTruthy();
  expect(screen.getByText("sem preço")).toBeTruthy();
});

test("the sort toggle cycles price (cheapest first) and speed (fastest first)", async () => {
  await show();
  const sortButton = () => screen.getByRole("button", { name: /ordenar por/ });
  expect(sortButton().textContent).toContain("inteligência");
  await act(async () => fireEvent.click(sortButton()));
  expect(sortButton().textContent).toContain("preço");
  expect(names()).toEqual(["b", "n", "a", "o"]);
  await act(async () => fireEvent.click(sortButton()));
  expect(names()).toEqual(["n", "a", "o", "b"]);
  await act(async () => fireEvent.click(sortButton()));
  expect(names()).toEqual(["a", "n", "o", "b"]);
});

test("the bell turns top-10 alerts on and off", async () => {
  await show();
  const bell = screen.getByRole("button", { name: "avisar quando o top 10 mudar" });
  expect(bell.getAttribute("aria-pressed")).toBe("false");
  await act(async () => fireEvent.click(bell));
  expect(calls.find((c) => c.cmd === "models_alerts_set")?.args).toEqual({ enabled: true });
  expect(screen.getByRole("button", { name: "parar de avisar sobre o top 10" }).getAttribute("aria-pressed")).toBe("true");
});

test("atualizar asks Rust to force, and a throttled answer says when the next fetch is allowed", async () => {
  await show();
  view = connected({ throttled: true, next_fetch_at: new Date(2026, 8, 29, 15, 40).getTime() });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "atualizar" })));
  expect(calls.filter((c) => c.cmd === "models_get").map((c) => c.args)).toEqual([{ force: false }, { force: true }]);
  expect(screen.getByText(/próxima busca às 15:40/)).toBeTruthy();
});

test("an API error is shown above the cached list", async () => {
  view = connected({ error: "limite diário da API atingido" });
  await show();
  expect(screen.getByRole("alert").textContent).toBe("limite diário da API atingido");
  expect(names().length).toBe(4);
});

test("the attribution link opens artificialanalysis.ai", async () => {
  await show();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "artificialanalysis.ai" })));
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://artificialanalysis.ai/" });
});

test("the tab never asks for a key", async () => {
  await show();
  expect(screen.queryByLabelText(/chave/i)).toBeNull();
  expect(screen.queryByRole("button", { name: /chave/ })).toBeNull();
});
