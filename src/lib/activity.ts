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

export function categoryOf(app: string): Category {
  return RULES.find(([, re]) => re.test(app))?.[0] ?? "other";
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
