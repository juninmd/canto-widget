import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const empty = { total: 0, items: [] };
const item = (n: number, title: string, extra = {}) => ({
  repo: "acme/atlas",
  number: n,
  reference: `acme/atlas#${n}`,
  title,
  url: `https://github.com/acme/atlas/pull/${n}`,
  created_at: hoursAgo(3),
  updated_at: hoursAgo(2),
  comments: 1,
  is_pr: true,
  draft: false,
  author: "bia",
  ...extra,
});

const github = {
  github_status: { connected: true, login: "ana", source: "pat", device_flow: false },
  github_lists: {
    review_requested: {
      total: 3,
      items: [item(1, "Exportar relatórios em CSV", { created_at: hoursAgo(5) }), item(2, "Fuso horário no resumo diário", { created_at: hoursAgo(60) })],
    },
    assigned: empty,
    my_prs: { total: 2, items: [item(3, "Extrair o cliente de status", { conflict: true }), item(4, "Guia de contribuição")] },
    my_issues: { total: 1, items: [item(5, "Filtro de data ignora o fuso", { is_pr: false, url: "https://github.com/acme/atlas/issues/5" })] },
  },
  github_prs_checks: [
    { repo: "acme/atlas", number: 1, status: "success" },
    { repo: "acme/atlas", number: 2, status: "running" },
    { repo: "acme/atlas", number: 3, status: "failure", conflict: true },
    { repo: "acme/atlas", number: 4, status: "success" },
  ],
};

test("GitHub: summary tiles filter the board, the sort sits in a menu, and row actions show on hover and focus", async ({ page }) => {
  await mockTauri(page, { fixed: github });
  await page.goto("/");
  await goTab(page, "GitHub");

  const strip = page.getByRole("group", { name: "resumo" });
  await expect(page.getByRole("region")).toHaveCount(4);
  await strip.getByRole("button", { name: /CI falhou/ }).click();
  await expect(strip.getByRole("button", { name: /CI falhou/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region")).toHaveCount(1);
  await expect(page.getByText("Extrair o cliente de status")).toBeVisible();
  await expect(page.getByText("Guia de contribuição")).toHaveCount(0);
  await strip.getByRole("button", { name: /CI falhou/ }).click();
  await expect(page.getByRole("region")).toHaveCount(4);

  await page.getByRole("button", { name: "ordenar por: atualização" }).click();
  await expect(page.getByRole("menuitemradio", { name: "atualização" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  expect((await page.evaluate(() => (window as unknown as { __E2E_CALLS__: { cmd: string; args: unknown }[] }).__E2E_CALLS__)).filter((c) => c.cmd === "github_lists").at(-1)?.args).toMatchObject({
    filter: { sort: "created" },
  });

  const snooze = page.getByRole("button", { name: "adiar Fuso horário no resumo diário por 4 horas" });
  const bar = snooze.locator("..");
  await expect(bar).toHaveCSS("opacity", "0");
  await snooze.focus();
  await expect(bar).toHaveCSS("opacity", "1");
  await page.getByText("Fuso horário no resumo diário").hover();
  await expect(bar).toHaveCSS("opacity", "1");

  if (process.env.SHOT) {
    await page.setViewportSize({ width: 420, height: 720 });
    await page.getByText("Exportar relatórios em CSV").hover();
    await page.screenshot({ path: `${process.env.SHOT}/110-github-tiles.png` });
  }
});

test("GitHub: desconectar waits in the '···' menu and asks before it drops the token", async ({ page }) => {
  await mockTauri(page, { fixed: github });
  await page.goto("/");
  await goTab(page, "GitHub");
  await page.getByRole("button", { name: "mais ações" }).click();
  await page.getByRole("menuitem", { name: "desconectar" }).click();
  await expect(page.getByRole("group", { name: "desconectar esta conta?" })).toBeVisible();
  await page.getByRole("button", { name: "cancelar" }).click();
  await expect(page.getByRole("button", { name: "mais ações" })).toBeFocused();
  const calls = await page.evaluate(() => (window as unknown as { __E2E_CALLS__: { cmd: string }[] }).__E2E_CALLS__);
  expect(calls.some((c) => c.cmd === "github_disconnect")).toBe(false);
});

const live = (indicator: string, description: string) => ({ indicator, description });
const statuses = [
  { id: "ok1", label: "Forja CI", items: [], error: null, live: live("none", "All Systems Operational") },
  { id: "mnt", label: "Stratos Auth", items: [], error: null, live: live("maintenance", "Scheduled maintenance") },
  { id: "deg", label: "Pelagic DB", items: [{ title: "Latência elevada nas leituras", link: "https://status.example.com/i/2", published_at: Date.now() - 3 * 3_600_000 }], error: null, live: live("minor", "Degraded performance") },
  { id: "dn", label: "Aurora Cloud", items: [{ title: "Falha parcial na região sul", link: "https://status.example.com/i/1", published_at: Date.now() - 25 * 60_000 }], error: null, live: live("major", "Partial outage") },
];

test("Status API: services sorted by severity in one column, filter chips, and incidents open from the row", async ({ page }) => {
  await mockTauri(page, { hiddenTabs: ["gitlab"], statuses });
  await page.goto("/");
  await goTab(page, "Status API");
  const names = page.locator("section .font-semibold");
  await expect(names).toHaveText(["Aurora Cloud", "Pelagic DB", "Stratos Auth", "Forja CI"]);
  await expect(page.getByText("2 com problema · 2 operacionais")).toBeVisible();
  const boxes = await page.locator("section").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().left));
  expect(new Set(boxes.map(Math.round)).size).toBe(1);

  await page.getByRole("button", { name: /Com problema/ }).click();
  await expect(names).toHaveText(["Aurora Cloud", "Pelagic DB"]);
  await page.getByRole("button", { name: /Todos/ }).click();

  await page.getByText("Aurora Cloud").click();
  await page.getByText(/Falha parcial na região sul/).click();
  const calls = await page.evaluate(() => (window as unknown as { __E2E_CALLS__: { cmd: string; args: unknown }[] }).__E2E_CALLS__);
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://status.example.com/i/1" });
  await page.getByRole("button", { name: "avisar quando Aurora Cloud cair ou ficar instável" }).click();
  const after = await page.evaluate(() => (window as unknown as { __E2E_CALLS__: { cmd: string; args: unknown }[] }).__E2E_CALLS__);
  expect(after.find((c) => c.cmd === "status_alerts_set")?.args).toEqual({ ids: ["dn"] });

  if (process.env.SHOT) {
    await page.setViewportSize({ width: 420, height: 720 });
    await page.screenshot({ path: `${process.env.SHOT}/111-status-servicos.png` });
  }
});

const sample = (ms: number | null) => ({ at: 0, ms, err: ms === null ? "conexão recusada" : null, cert_days: null });
const endpoint = (id: string, name: string, extra = {}) => ({
  id, name, kind: "http", url: `https://${id}.example.com`, every_secs: 60, limit_ms: 500, alert_down: true, alert_slow: true, alert_cert: false, ...extra,
});
const views = [
  { endpoint: endpoint("api", "API pública"), health: "up", samples: [sample(90), sample(110), sample(95)] },
  { endpoint: endpoint("fila", "Fila de e-mails"), health: "down", samples: [sample(120), sample(null), sample(null)] },
  { endpoint: endpoint("painel", "Painel interno"), health: "slow", samples: [sample(620), sample(700)] },
];

test("Status API: my endpoints list worst first, '+ endereço' opens the form and a tile opens its details", async ({ page }) => {
  await mockTauri(page, { hiddenTabs: ["gitlab"], statuses, fixed: { health_list: views } });
  await page.goto("/");
  await goTab(page, "Status API");
  await page.getByRole("tab", { name: "meus endpoints" }).click();
  await expect(page.getByRole("group", { name: "resumo dos endpoints" })).toContainText("1 fora");
  await expect(page.getByRole("group", { name: "resumo dos endpoints" })).toContainText("1 lentos");
  await expect(page.locator("button[aria-expanded] b")).toHaveText(["Fila de e-mails", "Painel interno", "API pública"]);

  await page.getByRole("button", { name: "+ endereço" }).click();
  await expect(page.getByRole("form", { name: "novo endpoint" })).toBeVisible();
  await page.getByRole("button", { name: "cancelar" }).click();

  await page.getByText("API pública").click();
  await expect(page.getByRole("img", { name: "latência de API pública" })).toBeVisible();
  await expect(page.getByRole("button", { name: "verificar agora" })).toBeVisible();
  await expect(page.getByRole("button", { name: "remover" })).toBeVisible();

  if (process.env.SHOT) {
    await page.setViewportSize({ width: 420, height: 720 });
    await page.getByRole("button", { name: "recolher API pública" }).click();
    await page.screenshot({ path: `${process.env.SHOT}/112-status-endpoints.png` });
  }
});
