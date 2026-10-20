import { expect, test } from "@playwright/test";
import { calls, mockTauri } from "./mock";

/** A malformed payload crashes the overlay's render; the transparent window must not stay up invisible. */
test("a crashed window shows a solid panel that can be closed instead of an invisible one", async ({ page }) => {
  await mockTauri(page, { fixed: { alert_payload: [null], alert_settle: [] } });
  await page.setViewportSize({ width: 420, height: 380 });
  await page.goto("/?alert");

  const panel = page.getByRole("alert");
  await expect(panel).toContainText("Não foi possível carregar.");
  await expect(page.getByRole("button", { name: "tentar de novo" })).toBeVisible();
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
  await page.getByRole("button", { name: "fechar" }).click();
  await expect.poll(async () => (await calls(page)).map((c) => c.cmd)).toContain("plugin:window|hide");
});
