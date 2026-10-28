import { LOCALE, t } from "../i18n";
import type { ClipItem, ClipMode } from "./api";

export type ClipKind = "link" | "color" | "json" | "email" | "phone" | "code" | "text";

const URL_ONLY = /^https?:\/\/\S+$/i;
const COLOR = /^(#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:rgb|hsl)a?\([^()]{1,60}\))$/i;
const EMAIL_ONLY = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^\+?[\d\s().-]+$/;
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const CODE_HINT = /[{};]\s*$|^\s*(?:import|export|const|let|function|def|class|select|insert|update|fn|pub|use|<\/?[a-z])\b|=>|::|\$\(|^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/im;

export function clipKind(text: string): ClipKind {
  const s = text.trim();
  if (URL_ONLY.test(s)) return "link";
  if (COLOR.test(s)) return "color";
  if (isJson(s)) return "json";
  if (EMAIL_ONLY.test(s)) return "email";
  if (isPhone(s)) return "phone";
  if (CODE_HINT.test(s)) return "code";
  return "text";
}

function isJson(t: string): boolean {
  const wrapped = (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
  if (!wrapped) return false;
  try {
    JSON.parse(t);
    return true;
  } catch {
    return false;
  }
}

// Only digits/spaces/()-.: a plain ISO date has the same characters, so it's excluded explicitly.
function isPhone(t: string): boolean {
  if (!PHONE_CHARS.test(t) || ISO_DATE_ONLY.test(t)) return false;
  const digits = t.replace(/\D/g, "").length;
  return digits >= 8 && digits <= 15;
}

export const KIND_LABEL: Record<ClipKind, string> = {
  link: t("clipboard.kind.link"),
  color: t("clipboard.kind.color"),
  json: t("clipboard.kind.json"),
  email: t("clipboard.kind.email"),
  phone: t("clipboard.kind.phone"),
  code: t("clipboard.kind.code"),
  text: t("clipboard.kind.text"),
};

export function compactCount(n: number): string {
  const fmt = (v: number) => v.toLocaleString(LOCALE, { maximumFractionDigits: 1 });
  if (n < 1_000) return String(n);
  if (n < 1_000_000) return t("clipboard.countThousands", { n: fmt(n / 1_000) });
  return t("clipboard.countMillions", { n: fmt(n / 1_000_000) });
}

export const sizeLabel = (chars: number) => t("clipboard.chars", { n: compactCount(chars) });

/** Rewrites that make sense for the item's kind: links, colors, e-mails and phones are copied as they are. */
export function clipTransforms(kind: ClipKind, preview: string): ClipMode[] {
  if (kind === "json") return ["json_pretty", "json_compact"];
  if (kind === "text" || kind === "code") {
    const modes: ClipMode[] = ["upper", "lower"];
    return preview.includes("\n") ? ["one_line", ...modes] : modes;
  }
  return [];
}

export const CLIP_KINDS: ClipKind[] = ["link", "color", "json", "email", "phone", "code", "text"];

/** How many of the given previews fall in each kind, for the counts on the filter chips. */
export function kindCounts(previews: string[]): Record<ClipKind, number> {
  const counts = { link: 0, color: 0, json: 0, email: 0, phone: 0, code: 0, text: 0 };
  for (const p of previews) counts[clipKind(p)]++;
  return counts;
}

/** The text that fits a max-pinned field: only whole numbers count, capped at 1000; anything else is a keystroke in progress. */
export function parseMaxPinned(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null;
  const next = Math.min(1000, Number(text));
  return next < 1 ? null : next;
}

/** Whether two clip lists show the same thing, so an idle poll can keep the old array and skip a re-render. */
export function sameClips(a: ClipItem[], b: ClipItem[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((x, n) => {
    const y = b[n];
    return x.id === y.id && x.preview === y.preview && x.pinned === y.pinned && x.copied_at === y.copied_at && x.kept === y.kept && x.chars === y.chars && x.truncated === y.truncated;
  });
}
