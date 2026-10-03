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
