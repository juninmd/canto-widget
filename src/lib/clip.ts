import { LOCALE, t } from "../i18n";

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
