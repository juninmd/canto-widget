import type { ActivitySpan } from "./api";
import { duration } from "./summary";

export type Category = "code" | "meet" | "docs" | "chat" | "web" | "other";

/** First match wins, so a call app is a meeting before it is a chat. Names are process or window-class names. */
const RULES: [Category, RegExp][] = [
  ["meet", /zoom|teams|meet|webex|skype|discord|jitsi|gotomeeting/i],
  ["chat", /slack|whatsapp|telegram|signal|outlook|thunderbird|mail|messages|element|mattermost|wechat/i],
  ["code", /code|studio|\bidea\b|pycharm|webstorm|goland|rider|clion|cursor|\bzed\b|\bvim\b|emacs|sublime|terminal|iterm|powershell|\bcmd\b|alacritty|kitty|wezterm|konsole|xterm|warp|postman|insomnia|docker|sourcetree|github/i],
  ["docs", /notion|obsidian|word|excel|powerpnt|powerpoint|onenote|libreoffice|soffice|pages|numbers|keynote|typora|logseq|acrobat|evince|okular|canto/i],
  ["web", /chrome|firefox|safari|msedge|edge|brave|opera|vivaldi|\barc\b|chromium|\bzen\b/i],
];

/** The user's own choices win over the name rules; the tab loads them once and on every change. */
let overrides: Record<string, Category> = {};
export const setCategoryOverrides = (next: Record<string, Category>) => {
  overrides = next;
};

export function categoryOf(app: string): Category {
  return overrides[app] ?? RULES.find(([, re]) => re.test(app))?.[0] ?? "other";
}

const NAMES: Record<string, string> = { msedge: "Edge", winword: "Word", excel: "Excel", powerpnt: "PowerPoint", devenv: "Visual Studio", "ms-teams": "Teams" };

/** Process names read better as words: "WindowsTerminal.exe" becomes "Windows Terminal". */
export function appName(app: string): string {
  const base = app.replace(/\.exe$/i, "");
  return NAMES[base.toLowerCase()] ?? base.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export const CATEGORY_COLOR: Record<Category, string> = {
  code: "bg-accent",
  meet: "bg-sky-400",
  docs: "bg-amber-400",
  chat: "bg-violet-400",
  web: "bg-teal-400",
  other: "bg-line",
};

type AppTotal = { app: string; secs: number };

/** Seconds per category, biggest first; empty categories stay out. */
export function byCategory(apps: AppTotal[]): { category: Category; secs: number }[] {
  const totals = new Map<Category, number>();
  for (const a of apps) totals.set(categoryOf(a.app), (totals.get(categoryOf(a.app)) ?? 0) + a.secs);
  return [...totals.entries()].map(([category, secs]) => ({ category, secs })).sort((a, b) => b.secs - a.secs);
}

export const secsLabel = (secs: number) => duration(Math.round(secs / 60));

/** Whole hours the timeline covers: the workday, widened to the first and last span. */
export function hourRange(spans: ActivitySpan[], dayStartSec: number): [number, number] {
  const hour = (sec: number) => (sec - dayStartSec) / 3600;
  const first = Math.min(8, ...spans.map((s) => Math.floor(hour(s.start))));
  const last = Math.max(18, ...spans.map((s) => Math.ceil(hour(s.end))));
  return [Math.max(0, first), Math.min(24, last)];
}

/** Left and width in percent of the row for a span inside the range. */
export function barBox(span: ActivitySpan, dayStartSec: number, [from, to]: [number, number]) {
  const total = (to - from) * 3600;
  const left = Math.max(0, ((span.start - dayStartSec) / 3600 - from) * 3600) / total;
  const right = Math.min(total, ((span.end - dayStartSec) / 3600 - from) * 3600) / total;
  return { left: left * 100, width: Math.max(0, (right - left) * 100) };
}

/** One row per application, the most used first; the rest fold into the totals, not the timeline. */
export function timelineRows(spans: ActivitySpan[], apps: AppTotal[], limit = 5) {
  return apps.slice(0, limit).map((a) => ({ app: a.app, secs: a.secs, spans: spans.filter((s) => s.app === a.app) }));
}

/** Spans and totals left once the hidden categories are taken out. */
export function withoutHidden<T extends { app: string }>(items: T[], hidden: ReadonlySet<Category>): T[] {
  return hidden.size === 0 ? items : items.filter((i) => !hidden.has(categoryOf(i.app)));
}

const SAME_BLOCK_GAP_SECS = 60;

/** The longest stretch in one app (touching spans merge) and how many times the focus changed app. */
export function focusStats(spans: ActivitySpan[]) {
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  let best = { app: "", start: 0, secs: 0 };
  let run = { app: "", start: 0, end: 0 };
  let switches = 0;
  for (const s of sorted) {
    if (run.app === s.app && s.start - run.end <= SAME_BLOCK_GAP_SECS) run.end = s.end;
    else {
      if (run.app) switches++;
      run = { app: s.app, start: s.start, end: s.end };
    }
    if (run.end - run.start > best.secs) best = { app: run.app, start: run.start, secs: run.end - run.start };
  }
  return { longest: best, switches };
}

/** Average over the days that have records, and the index of the busiest one. */
export function weekStats(totals: number[]) {
  const used = totals.filter((s) => s > 0);
  const average = used.length ? used.reduce((a, b) => a + b, 0) / used.length : 0;
  return { average, best: used.length ? totals.indexOf(Math.max(...totals)) : -1 };
}

export const CATEGORIES = ["code", "meet", "docs", "chat", "web", "other"] as const satisfies readonly Category[];

/** Active seconds in each hour of the day (index 0-23), counting only the part of a span inside that hour. */
export function hourlyHeat(spans: ActivitySpan[], dayStartSec: number): number[] {
  const out = new Array<number>(24).fill(0);
  for (const s of spans) {
    for (let h = 0; h < 24; h++) {
      const from = dayStartSec + h * 3600;
      out[h] += Math.max(0, Math.min(from + 3600, s.end) - Math.max(from, s.start));
    }
  }
  return out;
}

/** The two consecutive hours with the most activity across the days, or null with no records. */
export function peakWindow(rows: number[][]): [number, number] | null {
  const sum = new Array<number>(24).fill(0);
  for (const r of rows) r.forEach((v, h) => (sum[h] += v));
  let best = 0;
  let at = -1;
  for (let h = 0; h < 23; h++) {
    if (sum[h] + sum[h + 1] > best) [best, at] = [sum[h] + sum[h + 1], h];
  }
  return at < 0 ? null : [at, at + 2];
}

/** Days in a row, newest first, that reached the goal; a today still short of it does not break the run. */
export function streak(secsNewestFirst: number[], goalSecs: number): number {
  if (goalSecs <= 0) return 0;
  let i = (secsNewestFirst[0] ?? 0) >= goalSecs ? 0 : 1;
  let n = 0;
  while (i < secsNewestFirst.length && secsNewestFirst[i] >= goalSecs) [n, i] = [n + 1, i + 1];
  return n;
}
