import { expect, test, type Page } from "@playwright/test";
import { calls, mockTauri } from "./mock";

/** Fictitious alerts only (public repository): an outage, a meeting about to start and a model launch. */
export function fakeAlerts(now = Date.now()) {
  const base = { end: "", all_day: false, location: "", meet: "", link: "" };
  return [
    {
      ...base,
      id: "model:aurora",
      title: "Aurora 4",
      start: "",
      organizer: "Lumen Labs",
      description: "Lumen Labs · #1 com 73,2 pontos",
      tag: "Novo no top 10 · #1",
    },
    {
      ...base,
      id: "evt-daily",
      title: "Daily do time",
      start: new Date(now + 3 * 60_000).toISOString(),
      end: new Date(now + 18 * 60_000).toISOString(),
      meet: "https://meet.example.com/aaa-bbbb-ccc",
      link: "https://calendar.example.com/e/daily",
      location: "Sala Azul",
      organizer: "Ana Exemplo",
      guests: 6,
      description: "Bloqueios da sprint",
    },
    {
      ...base,
      id: "status:exemplo",
      title: "Serviço Exemplo",
      start: new Date(now - 18 * 60_000).toISOString(),
      link: "https://status.example.com",
      description: "Elevated errors on the API",
      tag: "major",
    },
  ];
}

// The pop-up is its own window (`?alert`): it needs no unlocked vault and never shows the widget.
async function ring(page: Page) {
  await page.goto("/?alert");
  await expect(page.getByRole("alertdialog")).toBeVisible();
}

test("pending alerts show as mini cards, worst first, and a click details another kind", async ({ page }) => {
  await mockTauri(page, { fixed: { alert_payload: fakeAlerts() } });
  await ring(page);

  const dialog = page.getByRole("alertdialog");
  const cards = dialog.getByRole("group", { name: "avisos pendentes" }).getByRole("button");
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0)).toContainText("Serviço Exemplo");
  await expect(cards.nth(1)).toContainText("Daily do time");
  await expect(cards.nth(2)).toContainText("Aurora 4");
  await expect(dialog.getByRole("button", { name: "abrir página de status" })).toBeVisible();

  await cards.nth(2).click();
  await expect(dialog.getByRole("button", { name: "abrir aba Modelos" })).toBeVisible();
  await expect(dialog.getByRole("button", { name: /adiar/ })).toHaveCount(0);
});

test("dismissing one alert leaves the others and tells Rust which one", async ({ page }) => {
  await mockTauri(page, { fixed: { alert_payload: fakeAlerts() } });
  await ring(page);

  const dialog = page.getByRole("alertdialog");
  await dialog.getByRole("button", { name: "fechar" }).click();
  await expect(dialog.getByRole("group", { name: "avisos pendentes" }).getByRole("button")).toHaveCount(2);
  const close = (await calls(page)).find((c) => c.cmd === "alert_close");
  expect(close?.args).toEqual({ id: "status:exemplo" });
});

test("a mention names the person who wrote it, with their photo", async ({ page }) => {
  const mention = {
    id: "mention:gitlab:42",
    title: "Falha no deploy de produção",
    start: "",
    end: "",
    all_day: false,
    location: "",
    meet: "",
    link: "https://git.example.com/acme/atlas/-/issues/9",
    organizer: "acme/atlas",
    description: "@marina: @voce consegue olhar o retry do lote?",
    tag: "gitlab",
    sender: { name: "Marina Souza", login: "marina", avatar: "data:image/png;base64,iVBORw0KGgo=" },
  };
  await mockTauri(page, { fixed: { alert_payload: [mention] } });
  await ring(page);

  const who = page.getByRole("alertdialog").locator("[data-sender]");
  await expect(who).toContainText("Marina Souza");
  await expect(who).toContainText("@marina");
  await expect(who.locator("img")).toHaveAttribute("src", /^data:image\/png/);
});

test("a GitHub mention previews the text that mentions you", async ({ page }) => {
  const mention = {
    id: "mention:github:acme/atlas#128",
    title: "Retry do lote estoura o timeout",
    start: "",
    end: "",
    all_day: false,
    location: "",
    meet: "",
    link: "https://github.com/acme/atlas/pull/128",
    organizer: "acme/atlas#128",
    description:
      "@marina: …conversei com o time e o retry está em 3 tentativas. @voce consegue olhar o backoff antes da release?",
    tag: "github",
    sender: { name: "Marina Souza", login: "marina", avatar: "" },
  };
  await mockTauri(page, { fixed: { alert_payload: [mention] } });
  await ring(page);

  const alert = page.getByRole("alertdialog");
  await expect(alert).toContainText("@voce consegue olhar o backoff antes da release?");
  await expect(alert.locator("[data-sender]")).toContainText("Marina Souza");
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
});

test("an approved PR names who approved it, with their photo, and a conflict ranks above it", async ({ page }) => {
  const base = { start: "", end: "", all_day: false, location: "", meet: "", link: "" };
  const approved = {
    ...base,
    id: "pr:approved:acme/atlas#128",
    title: "Corrige o parser de CSV com aspas",
    organizer: "acme/atlas#128",
    link: "https://github.com/acme/atlas/pull/128",
    description: "Marina Souza aprovou este PR.\nBoa, o teste de aspas cobre o caso do lote.",
    tag: "approved",
    sender: { name: "Marina Souza", login: "marina", avatar: "" },
  };
  const conflict = {
    ...base,
    id: "pr:conflict:acme/atlas#131",
    title: "Cache de relatórios por período",
    organizer: "acme/atlas#131",
    link: "https://github.com/acme/atlas/pull/131",
    description: "Conflito com a branch base; atualize este PR para poder fazer merge.",
    tag: "conflict",
  };
  await mockTauri(page, { fixed: { alert_payload: [approved, conflict] } });
  await ring(page);

  const alert = page.getByRole("alertdialog");
  await expect(alert.getByRole("heading", { level: 1 })).toHaveText("Cache de relatórios por período");
  await alert.getByRole("button", { name: /Corrige o parser/ }).click();
  await expect(alert.locator("[data-sender]")).toContainText("Marina Souza");
  await expect(alert).toContainText("Boa, o teste de aspas cobre o caso do lote.");
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
});
