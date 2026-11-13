import { expect, test } from "@playwright/test";
import { calls, goTab, mockTauri } from "./mock";

/** Fictitious data only (public repository). */
const now = Date.now();
const empty = { total: 0, items: [], fetched_at: now };
const repo = (full_name: string, group: string, extra: Record<string, unknown> = {}) => ({
  name: full_name.split("/").pop(),
  full_name,
  group,
  description: "",
  url: `https://github.com/${full_name}`,
  private: false,
  fork: false,
  archived: false,
  stars: 0,
  forks: 0,
  language: "",
  updated_at: new Date(now - 3_600_000).toISOString(),
  ...extra,
});
const repos = {
  repos: [
    repo("voce/dotfiles", "", { description: "Configurações de shell e editor", language: "Shell", stars: 12, updated_at: new Date(now - 3 * 3_600_000).toISOString() }),
    repo("voce/receitas-cli", "", { description: "Busca receitas pelo terminal", language: "Rust", stars: 4, forks: 1, private: true, updated_at: new Date(now - 2 * 86_400_000).toISOString() }),
    repo("acme/atlas", "acme", { description: "Mapas e rotas para a frota", language: "TypeScript", stars: 87, forks: 14, updated_at: new Date(now - 7_200_000).toISOString() }),
    repo("acme/relatorios", "acme", { description: "Relatórios por período com cache", language: "Python", stars: 23, private: true, updated_at: new Date(now - 86_400_000).toISOString() }),
    repo("acme/legado", "acme", { description: "Sistema antigo, só leitura", language: "Java", stars: 2, archived: true, updated_at: new Date(now - 90 * 86_400_000).toISOString() }),
    repo("oficina-dev/guia", "oficina-dev", { description: "Guia de contribuição da comunidade", stars: 41, fork: true, updated_at: new Date(now - 5 * 86_400_000).toISOString() }),
  ],
  truncated: false,
  fetched_at: now,
  limited_until: null,
};
// A deterministic, uneven year so the squares look like a real profile.
const days = Array.from({ length: 200 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 10, 12) - (199 - i) * 86_400_000);
  const wave = Math.abs(Math.sin(i / 3.1) * Math.cos(i / 11)) * 9;
  return { date: d.toISOString().slice(0, 10), count: d.getUTCDay() % 6 === 0 && i % 3 ? 0 : Math.round(wave) };
});
const calendar = { days, total: days.reduce((n, d) => n + d.count, 0), fetched_at: now, limited_until: null };

const fixed = {
  github_status: { connected: true, login: "voce", source: "pat", device_flow: true },
  github_lists: { assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty },
  github_repos: repos,
  github_contributions: calendar,
  mentions_unread: 0,
};

test("the repositories subtab groups by organization, switches layout and shows the calendar only when asked", async ({ page }) => {
  await mockTauri(page, { fixed });
  await page.goto("/");
  await goTab(page, "GitHub");
  expect((await calls(page)).some((c) => c.cmd === "github_repos")).toBe(false);

  await page.getByRole("tab", { name: "repositórios" }).click();
  await expect(page.getByRole("region", { name: "pessoais" })).toContainText("dotfiles");
  await expect(page.getByRole("region", { name: "acme" }).getByRole("listitem")).toHaveCount(3);
  await expect(page.getByRole("region", { name: "oficina-dev" })).toContainText("guia");
  expect((await calls(page)).some((c) => c.cmd === "github_contributions")).toBe(false);
  await expect(page.getByRole("figure")).toHaveCount(0);

  await page.getByRole("button", { name: "estatísticas" }).click();
  await expect(page.getByRole("figure")).toBeVisible();
  await expect(page.getByRole("figure").locator("span[title]").first()).toBeVisible();
  await page.getByLabel("Filtrar repositórios").blur();
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });

  await page.getByRole("button", { name: "grade" }).click();
  await expect(page.getByRole("region", { name: "acme" })).not.toContainText("Mapas e rotas para a frota");
  if (process.env.SHOT2) await page.screenshot({ path: process.env.SHOT2 });
  await page.getByRole("button", { name: "lista" }).click();
  await page.getByRole("button", { name: "abrir acme/atlas" }).click();
  expect((await calls(page)).find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://github.com/acme/atlas" });

  await page.reload();
  await goTab(page, "GitHub");
  await page.getByRole("tab", { name: "repositórios" }).click();
  await expect(page.getByRole("figure")).toBeVisible(); // statistics choice and layout survive a reload
  await expect(page.getByRole("button", { name: "lista" })).toHaveAttribute("aria-pressed", "true");
});
