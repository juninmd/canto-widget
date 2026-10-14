import { test } from "@playwright/test";
import { ALERTS_AT, CI_FAILED, MEETING, NEW_MODEL, OUTAGE, TASK_REMINDER } from "./data-alerts";
import { shoot } from "./out";
import { openScene, settle } from "./stage";

/** The pop-up is its own 420x380 window (`?alert`); it needs no vault. */
const popup = (browser: Parameters<typeof openScene>[0], alerts: unknown[]) =>
  openScene(browser, { path: "/?alert", now: ALERTS_AT, width: 420, height: 380, fixed: { alert_payload: alerts } });

test("alert: a meeting about to start", async ({ browser }) => {
  const page = await popup(browser, [MEETING]);
  await settle(page, 900);
  await shoot(page, "alert-meeting");
});

test("alert: a task reminder", async ({ browser }) => {
  const page = await popup(browser, [TASK_REMINDER]);
  await settle(page, 900);
  await shoot(page, "alert-task");
});

test("alert: everything pending in one overlay", async ({ browser }) => {
  const page = await popup(browser, [OUTAGE, MEETING, NEW_MODEL, TASK_REMINDER]);
  await settle(page, 900);
  await shoot(page, "alert-pending");
});

test("alert: my pull request failed CI", async ({ browser }) => {
  const page = await popup(browser, [CI_FAILED]);
  await settle(page, 900);
  await shoot(page, "alert-ci");
});
