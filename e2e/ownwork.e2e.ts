import { expect, test } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

const config = {
  ci: true,
  stalled: true,
  stalled_hours: 48,
  mentions: true,
  reviews: true,
  merge_state: true,
  comments: true,
  assigned: true,
  replies: false,
  team_mentions: false,
};

test("settings list every own-work alert as a switch", async ({ page }) => {
  await mockTauri(page, {
    fixed: { my_pr_alerts_get: config, review_alerts_get: true, activity_status: { supported: false, enabled: false }, biometric_status: { available: false, enabled: false, name: "" }, github_status: { connected: true, login: "voce", source: "pat", device_flow: true } },
  });
  await page.setViewportSize({ width: 420, height: 1100 });
  await page.goto("/");
  await goTab(page, "Ajustes");
  await page.getByRole("searchbox").fill("conflito");
  const section = page.getByRole("group", { name: "Avisos do GitHub e do GitLab" });
  await section.scrollIntoViewIfNeeded();
  for (const label of [
    "avisar quando um PR/MR meu for aprovado ou receber pedido de mudanças",
    "avisar quando um PR/MR meu ficar pronto para merge ou tiver conflito",
    "avisar quando um PR/MR meu receber comentário novo",
    "avisar quando algo for atribuído a mim",
    "avisar quando responderem em uma conversa em que comentei (GitHub)",
    "incluir menções aos meus times (GitHub)",
  ]) {
    await expect(section.getByLabel(label)).toBeVisible();
  }
  await expect(section.getByLabel("avisar quando responderem em uma conversa em que comentei (GitHub)")).not.toBeChecked();
  if (process.env.SHOT) await section.screenshot({ path: process.env.SHOT });
});
