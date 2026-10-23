import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ModelRow, ModelsView } from "../lib/api";
import { modelRow } from "../lib/modelsTestRow";

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

const row = (id: string, name: string, creator: string, rank: number, score: number, price: number | null, speed: number | null, badge: ModelRow["badge"] = null, sheet: Partial<ModelRow> = {}): ModelRow =>
  modelRow({ id, name, creator, score, price, speed, rank, badge, ...sheet });

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
  expect(screen.getByTitle("posição 1 no ranking").className).toContain("bg-accent");
  expect(screen.getByTitle("posição 4 no ranking").className).not.toContain("text-accent");
  expect(screen.getByText("Lumen Labs")).toBeTruthy();
  expect(screen.getByText("novo")).toBeTruthy();
  expect(screen.getByText("subiu")).toBeTruthy();
  expect(screen.getByText("73,2")).toBeTruthy();
  expect(screen.getByText("$3,44 / 1M tokens")).toBeTruthy();
  expect(screen.getByText("143 tok/s")).toBeTruthy();
  expect(screen.getByText("sem preço")).toBeTruthy();
});

test("the sort chips pick price (cheapest first) and speed (fastest first) and mark the active one", async () => {
  await show();
  const chip = (name: string) => screen.getByRole("button", { name });
  expect(chip("inteligência").getAttribute("aria-pressed")).toBe("true");
  expect(chip("preço").getAttribute("aria-pressed")).toBe("false");
  await act(async () => fireEvent.click(chip("preço")));
  expect(chip("preço").getAttribute("aria-pressed")).toBe("true");
  expect(chip("inteligência").getAttribute("aria-pressed")).toBe("false");
  expect(names()).toEqual(["b", "n", "a", "o"]);
  await act(async () => fireEvent.click(chip("velocidade")));
  expect(names()).toEqual(["n", "a", "o", "b"]);
  await act(async () => fireEvent.click(chip("inteligência")));
  expect(names()).toEqual(["a", "n", "o", "b"]);
});

test("the metric being sorted by is highlighted in each row", async () => {
  await show();
  const row = (id: string) => document.querySelector(`[data-model="${id}"]`)!;
  expect(screen.getByText("73,2").className).toContain("text-accent-text");
  expect(screen.getByText("143 tok/s").className).not.toContain("text-accent-text");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "preço" })));
  expect(screen.getByText("$3,44 / 1M tokens").className).toContain("text-accent-text");
  expect(screen.getByText("73,2").className).not.toContain("text-accent-text");
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "velocidade" })));
  expect(row("a").textContent).toContain("143 tok/s");
  expect(screen.getByText("143 tok/s").className).toContain("text-accent-text");
});

test("only the leader's rank block takes the accent fill", async () => {
  await show();
  expect(screen.getByTitle("posição 1 no ranking").className).toContain("bg-accent text-on-accent");
  expect(screen.getByTitle("posição 2 no ranking").className).not.toContain("text-on-accent");
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

test("clicking a model opens its sheet in place, and the site is one tap away from it", async () => {
  view = connected({ models: [row("a", "Aurora 4", "Lumen Labs", 1, 73.2, 3.44, 142.7, null, { input_price: 2, output_price: 8, context: 131_072, released: "2026-09-30", open_weights: true, reasoning: true, coding: 61, ttft: 0.83, inputs: ["text", "image"] }), ...models.slice(1)] });
  await show();
  const toggle = screen.getByTitle("ver a ficha de Aurora 4");
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  await act(async () => fireEvent.click(toggle));
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  const sheet = document.querySelector('[data-model="a"]')!.textContent!;
  for (const text of ["Lançamento", "set. de 2026", "131k", "abertos", "$2,00", "$8,00", "0,83 s", "Programação", "61", "#1", "imagem"]) expect(sheet).toContain(text);
  expect(calls.some((c) => c.cmd === "open_link")).toBe(false);
  await act(async () => fireEvent.click(screen.getByText(/Ver no site/)));
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://artificialanalysis.ai/models/a" });
});

test("fields the page didn't carry read as a dash, and filters stay hidden without data", async () => {
  await show();
  await act(async () => fireEvent.click(screen.getByTitle("ver a ficha de Brisa Mini")));
  expect(document.querySelector('[data-model="b"]')!.textContent).toContain("Lançamento—");
  expect(screen.queryByText("pesos abertos") === null).toBe(true);
});

test("the open-weights filter narrows the ranking", async () => {
  view = connected({ models: models.map((m, i) => ({ ...m, open_weights: i % 2 === 0 })) });
  await show();
  await act(async () => fireEvent.click(screen.getByText("pesos abertos")));
  expect(names()).toEqual(["a", "o"]);
});

test("marking two models and opening Comparar shows the summary, radar, bars and table", async () => {
  localStorage.clear();
  await show();
  await act(async () => fireEvent.click(screen.getByLabelText("comparar Aurora 4")));
  expect(screen.getByText("1 marcado · escolha mais um")).toBeTruthy();
  await act(async () => fireEvent.click(screen.getByLabelText("comparar Nimbus Ultra")));
  expect(JSON.parse(localStorage.getItem("canto.models.compare")!)).toEqual(["a", "n"]);
  await act(async () => fireEvent.click(screen.getByText(/^Comparar →/)));
  expect(screen.getByText("Aurora 4 é o mais inteligente, 3,2 pontos à frente de Nimbus Ultra.")).toBeTruthy();
  expect(screen.getByText("Nimbus Ultra é o mais barato: 3,8× menos que Aurora 4.")).toBeTruthy();
  expect(document.querySelectorAll("[data-radar]").length).toBe(2);
  expect(document.querySelector('[data-metric="price"]')!.textContent).toContain("★$0,90");
  expect(screen.getByText("Tabela completa")).toBeTruthy();
  await act(async () => fireEvent.click(screen.getByLabelText("remover Nimbus Ultra")));
  expect(screen.getByText("Escolha pelo menos 2 modelos")).toBeTruthy();
});

test("the picker adds a model by search and the presets fill the comparison", async () => {
  localStorage.setItem("canto.models.compare", JSON.stringify(["a", "sumiu"]));
  await show();
  await act(async () => fireEvent.click(screen.getByText("Comparar · 1")));
  await act(async () => fireEvent.click(screen.getByText("+ modelo")));
  await act(async () => fireEvent.change(screen.getByLabelText("buscar nome ou empresa"), { target: { value: "pelag" } }));
  await act(async () => fireEvent.click(screen.getByText("Orca Think")));
  expect(document.querySelectorAll("[data-radar]").length).toBe(2);
  await act(async () => fireEvent.click(screen.getByText("Mais rápidos")));
  expect(JSON.parse(localStorage.getItem("canto.models.compare")!)).toEqual(["n", "a", "o"]);
});

test("rows from a backend without the sheet still open and compare", async () => {
  view = connected({ models: models.map(({ id, name, creator, score, price, speed, rank, badge }) => ({ id, name, creator, score, price, speed, rank, badge }) as ModelRow) });
  await show();
  await act(async () => fireEvent.click(screen.getByTitle("ver a ficha de Aurora 4")));
  expect(document.querySelector('[data-model="a"]')!.textContent).not.toContain("undefined");
});
