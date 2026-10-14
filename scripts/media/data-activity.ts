import type { Page } from "@playwright/test";

/** Answers `activity_summary` for any day asked: a deterministic workday per days-ago, weekends lighter. */
export async function seedActivity(page: Page) {
  await page.addInitScript(() => {
    type Invoke = (cmd: string, args?: Record<string, number>) => Promise<unknown>;
    const w = window as unknown as { __TAURI_INTERNALS__: { invoke: Invoke } };
    const base = w.__TAURI_INTERNALS__.invoke;
    const DAY = 86_400_000;
    const apps = ["Code", "Slack", "Code", "Teams", "Notion", "Code", "Chrome", "Code"];
    const plan = (ago: number) => {
      const dow = new Date(Date.now() - ago * DAY).getDay();
      const out: { app: string; start: number; end: number }[] = [];
      let h = 8.6 + (ago % 3) * 0.15;
      const n = dow === 0 || dow === 6 ? 2 : 7 + (ago % 2);
      for (let i = 0; i < n; i++) {
        const len = (i % 3 === 0 ? 1.7 : 0.6) + ((ago + i) % 4) * 0.12;
        out.push({ app: apps[(i + ago) % apps.length]!, start: h, end: h + len });
        h += len + (i === 3 ? 1.5 : 0.1);
      }
      return out;
    };
    w.__TAURI_INTERNALS__.invoke = async (cmd, args = {}) => {
      if (cmd !== "activity_summary") return base(cmd, args);
      const from = args.fromMs!;
      const ago = Math.round((new Date(Date.now()).setHours(0, 0, 0, 0) - from) / DAY);
      const cutoff = ago === 0 ? (Date.now() - from) / 3_600_000 : 24;
      const spans = plan(ago)
        .filter((s) => s.start < cutoff)
        .map((s) => ({ app: s.app, start: from / 1000 + s.start * 3600, end: from / 1000 + Math.min(s.end, cutoff) * 3600 }));
      const totals = new Map<string, number>();
      for (const s of spans) totals.set(s.app, (totals.get(s.app) ?? 0) + s.end - s.start);
      const total = [...totals.values()].reduce((a, b) => a + b, 0);
      const gap = spans.length > 4 ? [{ start: spans[3]!.end, end: spans[4]!.start }] : [];
      return {
        spans,
        apps: [...totals].map(([app, secs]) => ({ app, secs: Math.round(secs) })).sort((a, b) => b.secs - a.secs),
        total_secs: Math.round(total),
        idle: gap,
        idle_secs: Math.round(gap.reduce((a, g) => a + g.end - g.start, 0)),
        focus: ago === 0 ? [{ task: "t1", title: "Revisar o PR do filtro de relatórios", secs: 5400 }, { task: "t5", title: "Atualizar a documentação de onboarding", secs: 2700 }] : [],
      };
    };
  });
}
