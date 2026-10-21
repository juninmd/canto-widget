import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

const now = Date.now();
const clips = [
  { id: "c1", preview: "https://acme.example/painel/relatorio-q3", chars: 40, kept: 40, truncated: false, copied_at: now - 5 * 60_000, pinned: true },
  { id: "c2", preview: "#38bdf8", chars: 7, kept: 7, truncated: false, copied_at: now - 20 * 60_000, pinned: false },
  { id: "c3", preview: '{"status":"ok","itens":3}', chars: 25, kept: 25, truncated: false, copied_at: now - 40 * 60_000, pinned: false },
  { id: "c4", preview: "ana@empresa.example", chars: 19, kept: 19, truncated: false, copied_at: now - 3_600_000, pinned: false },
  { id: "c5", preview: "const total = itens.length;", chars: 27, kept: 27, truncated: false, copied_at: now - 2 * 3_600_000, pinned: false },
];

test("clipboard: chips with counts, groups, a kind tile per card and clear behind the menu", async ({ page }) => {
  await mockTauri(page, { fixed: { clip_list: { items: clips, max_pinned: 100 }, clip_clear: "chave" } });
  await page.goto("/");
  await goTab(page, "Clipboard");

  await expect(page.getByRole("button", { name: "Todos 5" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "link 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "cor 1" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fixados" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recentes" })).toBeVisible();
  await expect(page.locator("[data-kind]")).toHaveCount(5);
  await expect(page.getByLabel("máximo de itens fixados")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "limpar" })).toHaveCount(0);

  await page.getByRole("button", { name: "json 1" }).click();
  await expect(page.getByText('{"status":"ok","itens":3}')).toBeVisible();
  await expect(page.getByText("#38bdf8")).toHaveCount(0);
  await page.getByRole("button", { name: /^Todos/ }).click();

  await page.getByRole("button", { name: "ações do clipboard" }).click();
  await page.getByRole("menuitem", { name: "Limpar histórico…" }).click();
  const ask = page.getByRole("alert").filter({ hasText: "Limpar 4 itens do histórico?" });
  await expect(ask).toBeVisible();
  expect((await calls(page)).some((c) => c.cmd === "clip_clear")).toBe(false);
  await ask.getByRole("button", { name: "limpar" }).click();
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "clip_clear")).toBe(true);

  if (process.env.SHOT) await page.screenshot({ path: `${process.env.SHOT}/clipboard.png` });
});

test("clipboard: hovering or tabbing to a card shows its actions, and the page does not scroll sideways", async ({ page }) => {
  await mockTauri(page, { fixed: { clip_list: { items: clips, max_pinned: 100 } } });
  await page.goto("/");
  await goTab(page, "Clipboard");
  const card = page.getByRole("listitem").filter({ hasText: "ana@empresa.example" });
  const pin = card.getByRole("button", { name: "fixar no histórico" });
  await expect(pin.locator("..")).toHaveCSS("opacity", "0");
  await card.hover();
  await expect(pin.locator("..")).toHaveCSS("opacity", "1");
  const box = await pin.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(24);
  expect(box!.height).toBeGreaterThanOrEqual(24);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("settings: the pinned limit lives under Dados e contas and saves through clip_set_max_pinned", async ({ page }) => {
  await mockTauri(page, { fixed: { clip_list: { items: [], max_pinned: 60 } } });
  await page.goto("/");
  await goTab(page, "Ajustes");
  await page.getByRole("button", { name: "Dados e contas" }).click();
  const field = page.getByLabel("máximo de itens fixados");
  await expect(field).toHaveValue("60");
  await field.fill("25");
  await expect.poll(async () => (await calls(page)).filter((c) => c.cmd === "clip_set_max_pinned").at(-1)?.args).toEqual({ max: 25 });
});

const stamp = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const ev = { all_day: false, location: "", meet: "", link: "" };
const agenda = [
  { ...ev, id: "e0", title: "Daily do time", start: stamp(9, 30), end: stamp(9, 45) },
  { ...ev, id: "e1", title: "Planejamento da sprint", start: stamp(10), end: stamp(11), location: "Sala Orion", guests: 6, meet: "https://meet.example.com/a-b-c" },
  { ...ev, id: "e2", title: "Café com fornecedor", start: stamp(10, 30), end: stamp(10, 45), location: "Recepção" },
  { ...ev, id: "e3", title: "1:1 com a liderança", start: stamp(17), end: stamp(17, 30) },
];

test("agenda: one control row, a countdown ring on the meeting in progress and the menu for the test alert", async ({ page }) => {
  const d = new Date();
  d.setHours(10, 20, 0, 0);
  await page.clock.setFixedTime(d);
  await mockTauri(page, { fixed: { agenda_today: agenda, alert_open: null } });
  await page.goto("/");
  await goTab(page, "Agenda");

  const names = ["Hoje", "Reuniões", "Dia anterior", "Próximo dia", "atualizar", "ações da agenda"];
  const tops = await Promise.all(names.map(async (name) => Math.round((await page.getByRole("button", { name, exact: true }).first().boundingBox())!.y)));
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(2);
  await expect(page.getByRole("button", { name: "testar aviso" })).toHaveCount(0);

  const hero = page.getByRole("region", { name: "agora" });
  await expect(hero).toContainText("Planejamento da sprint");
  await expect(hero.getByRole("progressbar")).toHaveAttribute("aria-label", "termina em 40 min");
  await expect(hero).toContainText("conflita com: Café com fornecedor");
  await expect(hero.getByRole("button", { name: "entrar no Meet" })).toBeVisible();
  await expect(page.getByRole("region", { name: "dia em uma linha" })).toBeVisible();
  await expect(page.getByRole("list", { name: "linha do dia" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  if (process.env.SHOT) await page.screenshot({ path: `${process.env.SHOT}/agenda.png` });

  await page.getByRole("button", { name: "ações da agenda" }).click();
  await expect(page.getByText("Aviso 1 min antes")).toBeVisible();
  await page.getByRole("menuitem", { name: "Testar aviso" }).click();
  await expect.poll(async () => (await calls(page)).some((c) => c.cmd === "alert_open")).toBe(true);
});
