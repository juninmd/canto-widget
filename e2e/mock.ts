import type { Page } from "@playwright/test";

export type MockTask = { id: string; title: string; done: boolean; day: string; created_at: number; updated_at: number };
export type MockStatus = {
  id: string;
  label: string;
  items: { title: string; link: string; published_at: number }[];
  error: string | null;
};
export type MockOptions = { unlocked?: boolean; hiddenTabs?: string[]; statuses?: MockStatus[]; language?: string | null };
export type Call = { cmd: string; args: Record<string, unknown> };

/** Stands in for the Tauri runtime so the real UI runs in plain Chromium; tasks survive reloads via sessionStorage. */
export async function mockTauri(page: Page, opts: MockOptions = {}) {
  await page.addInitScript((o: MockOptions) => {
    localStorage.setItem("canto.onboarding.visto", "1");
    // Assertions default to pt-BR; `null` leaves the choice on "auto" (Chromium reports en-US). Only the first
    // load sets it, so a reload keeps whatever the page chose.
    if (o.language !== null && localStorage.getItem("canto.language") === null) {
      localStorage.setItem("canto.language", o.language ?? "pt-BR");
    }
    if (o.hiddenTabs) localStorage.setItem("canto.hiddenTabs", JSON.stringify(o.hiddenTabs));
    const calls: Call[] = [];
    const tasks = (): MockTask[] => JSON.parse(sessionStorage.getItem("e2e.tasks") ?? "[]");
    const save = (list: MockTask[]) => sessionStorage.setItem("e2e.tasks", JSON.stringify(list));
    const fixed: Record<string, unknown> = {
      vault_status: { exists: true, unlocked: o.unlocked ?? true },
      api_status: o.statuses ?? [],
      // Objects, not lists: the `_list`/`_search` fallback below would crash these tabs on `items`.
      notes_search: { total: 0, items: [] },
      clip_list: { items: [], max_pinned: 100 },
    };
    let callbackId = 1;
    const w = window as unknown as Record<string, unknown>;
    w.__E2E_CALLS__ = calls;
    w.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener() {} };
    w.__TAURI_INTERNALS__ = {
      metadata: { currentWindow: { label: "main" }, currentWebview: { windowLabel: "main", label: "main" } },
      transformCallback: () => callbackId++,
      unregisterCallback() {},
      invoke: async (cmd: string, args: Record<string, unknown> = {}) => {
        calls.push({ cmd, args });
        if (cmd in fixed) return fixed[cmd];
        if (cmd === "tasks_for_day") return tasks().filter((t) => t.day === args.day);
        if (cmd === "task_add") {
          const now = Date.now();
          const task = { id: `t${now}`, title: String(args.title), done: false, day: String(args.day), created_at: now, updated_at: now };
          save([...tasks(), task]);
          return task;
        }
        if (cmd.startsWith("plugin:")) return null;
        if (/(_list|_search|_reminders|agenda)$/.test(cmd)) return [];
        return null;
      },
    };
  }, opts);
}

export async function calls(page: Page): Promise<Call[]> {
  return page.evaluate(() => (window as unknown as { __E2E_CALLS__: Call[] }).__E2E_CALLS__);
}
