import { test, type Page } from "@playwright/test";
import { ALERTS_AT, CI_FAILED, MEETING, NEW_MODEL, OUTAGE, TASK_REMINDER } from "./data-alerts";
import { shoot } from "./out";
import { openScene, settle } from "./stage";

/** The pop-up is its own 420-wide window (`?alert`); it needs no vault. */
const popup = (browser: Parameters<typeof openScene>[0], alerts: unknown[]) =>
  openScene(browser, { path: "/?alert", now: ALERTS_AT, width: 420, height: 640, fixed: { alert_payload: alerts } });

/** Rust sizes the real window to the card; the print does the same so no empty space shows above it. */
async function fit(page: Page) {
  const box = (await page.getByRole("alertdialog").boundingBox())!;
  await page.setViewportSize({ width: 420, height: Math.ceil(box.height) });
  await settle(page, 300);
}

test("alert: a meeting about to start", async ({ browser }) => {
  const page = await popup(browser, [MEETING]);
  await settle(page, 900);
  await fit(page);
  await shoot(page, "alert-meeting");
});

test("alert: a task reminder", async ({ browser }) => {
  const page = await popup(browser, [TASK_REMINDER]);
  await settle(page, 900);
  await fit(page);
  await shoot(page, "alert-task");
});

test("alert: everything pending in one overlay", async ({ browser }) => {
  const page = await popup(browser, [OUTAGE, MEETING, NEW_MODEL, TASK_REMINDER]);
  await settle(page, 900);
  await fit(page);
  await shoot(page, "alert-pending");
});

test("alert: my pull request failed CI", async ({ browser }) => {
  const page = await popup(browser, [CI_FAILED]);
  await settle(page, 900);
  await fit(page);
  await shoot(page, "alert-ci");
});
