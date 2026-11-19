import { expect, test, type Page } from "@playwright/test";
import { calls, mockTauri } from "./mock";

/** Fictitious invite (public repository). */
function invite(now = Date.now()) {
  const start = new Date(now + 3 * 3_600_000);
  return {
    id: "evt-invite",
    title: "Revisão de arquitetura",
    start: start.toISOString(),
    end: new Date(start.getTime() + 3_600_000).toISOString(),
    all_day: false,
    location: "Sala Azul",
    meet: "https://meet.example.com/aaa-bbbb-ccc",
    link: "https://calendar.example.com/e/arch",
    organizer: "Ana Exemplo",
    guests: 3,
    description: "Decidir o desenho do novo módulo",
    response: "needsAction",
    attendees: [
      { name: "Ana Exemplo", email: "ana@example.com", response: "accepted", organizer: true, optional: false, me: false },
      { name: "Eu", email: "eu@example.com", response: "needsAction", organizer: false, optional: false, me: true },
    ],
  };
}

const shot = (page: Page, name: string) =>
  process.env.SHOT_DIR ? page.screenshot({ path: `${process.env.SHOT_DIR}/${name}.png` }) : undefined;

test("the agenda lets me accept or decline an invite and asks Google for exactly that", async ({ page }) => {
  await mockTauri(page, { fixed: { agenda_today: [invite()], agenda_respond: null } });
  await page.goto("/");
  await page.getByRole("tab", { name: "Agenda" }).click();
  await expect(page.getByRole("button", { name: /Revisão de arquitetura/ })).toBeVisible();
  await expect(page.getByText("sem resposta sua").first()).toBeVisible();
  await page.getByRole("group", { name: "responder ao convite" }).scrollIntoViewIfNeeded();
  await shot(page, "agenda-convite");

  await page.getByRole("button", { name: "Aceitar" }).click();
  await expect
    .poll(async () => (await calls(page)).filter((c) => c.cmd === "agenda_respond").map((c) => c.args))
    .toEqual([{ eventId: "evt-invite", answer: "accepted" }]);
  await expect(page.getByText("Convite aceito")).toBeVisible();
});

test("a new invite rings its own pop-up with accept and decline", async ({ page }) => {
  const alert = { ...invite(), id: "invite:evt-invite" };
  await mockTauri(page, { fixed: { alert_payload: [alert], agenda_respond: null } });
  await page.goto("/?alert");
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await expect(page.getByText("novo convite").first()).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.waitForTimeout(1500);
  if (process.env.SHOT_DIR) await page.getByRole("alertdialog").screenshot({ path: `${process.env.SHOT_DIR}/alerta-convite.png` });

  await page.getByRole("button", { name: "recusar" }).click();
  await expect
    .poll(async () => (await calls(page)).filter((c) => c.cmd === "agenda_respond").map((c) => c.args))
    .toEqual([{ eventId: "evt-invite", answer: "declined" }]);
});
