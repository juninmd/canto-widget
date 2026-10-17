import type { Browser, Page } from "@playwright/test";
import { goTab } from "../../e2e/mock";
import { CLIPS } from "./data-clip";
import { seedActivity } from "./data-activity";
import { seedAgenda } from "./data-agenda";
import { GITHUB_FIXED, GITLAB_FIXED } from "./data-forge";
import { AGENTS, HEALTH, MODELS, STATUS } from "./data-ops";
import { NOTES, TASKS } from "./data-vault";
import { openScene, settle, type SceneOptions } from "./stage";
import { seedVault } from "./vault";

const TABS = ["tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents", "activity", "settings"];

/** Every answer a tab asks Rust for, so any of them can be opened from the same scene. */
export const FIXED = {
  clip_list: { items: CLIPS, max_pinned: 100 },
  ...GITHUB_FIXED,
  ...GITLAB_FIXED,
  ...AGENTS,
  health_list: HEALTH,
  activity_status: { supported: true, enabled: true },
  drive_status: { configured: true, embedded: true, connected: true, email: "ana@example.com", name: "Ana Exemplo" },
  biometric_status: { available: true, enabled: true, name: "Windows Hello" },
  window_config: { position: null, size: null, always_on_top: true, mini: false },
  unlock_history: [
    { at: Date.parse("2026-10-09T08:41:00-03:00"), method: "windows_hello" },
    { at: Date.parse("2026-10-08T09:02:00-03:00"), method: "password" },
    { at: Date.parse("2026-10-07T08:55:00-03:00"), method: "windows_hello" },
  ],
  guest_photos: { photos: {}, needs_consent: false },
  autostart_status: true,
  autolock_get: 15,
  dnd_get: { active: false, untilMs: null },
  review_alerts_get: true,
  my_pr_alerts_get: { ci: true, stalled: true, stalled_hours: 48, mentions: true },
  status_alerts_get: ["aurora", "nimbus"],
  fullscreen_hold_get: true,
  sync_get: null,
  transcripts_dir: "D:\\Reunioes",
  update_check: { current: "0.25.1", latest: "0.25.1", available: false, notes: "", date: "2026-10-09" },
};

/** The full widget: tasks and notes in a vault, an agenda, forges, services and AI models, all fictitious. */
export function fullScene(browser: Browser, o: SceneOptions = {}): Promise<Page> {
  return openScene(browser, {
    hiddenTabs: [],
    knownTabs: TABS,
    statuses: STATUS,
    models: MODELS,
    ...o,
    fixed: { ...FIXED, ...o.fixed },
    before: async (page) => {
      await seedVault(page, { tasks: TASKS, notes: NOTES });
      await seedAgenda(page);
      await seedActivity(page);
      await o.before?.(page);
    },
  });
}

/** Opens a tab and waits out the underline transition so the shot never catches it halfway. */
export async function openTab(page: Page, name: string, wait = 900) {
  await goTab(page, name);
  await settle(page, wait);
}
