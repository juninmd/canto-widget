export type ClipKind = "link" | "color" | "json" | "email" | "phone" | "code" | "text";

const URL_ONLY = /^https?:\/\/\S+$/i;
const COLOR = /^(#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:rgb|hsl)a?\([^()]{1,60}\))$/i;
const EMAIL_ONLY = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^\+?[\d\s().-]+$/;
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const CODE_HINT = /[{};]\s*$|^\s*(?:import|export|const|let|function|def|class|select|insert|update|fn|pub|use|<\/?[a-z])\b|=>|::|\$\(|^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/im;

export function clipKind(text: string): ClipKind {
  const t = text.trim();
  if (URL_ONLY.test(t)) return "link";
  if (COLOR.test(t)) return "color";
  if (isJson(t)) return "json";
  if (EMAIL_ONLY.test(t)) return "email";
  if (isPhone(t)) return "phone";
  if (CODE_HINT.test(t)) return "code";
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
  link: "link",
  color: "cor",
  json: "json",
  email: "e-mail",
  phone: "telefone",
  code: "código",
  text: "texto",
};

export function compactCount(n: number): string {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  if (n < 1_000) return String(n);
  if (n < 1_000_000) return `${fmt(n / 1_000)} mil`;
  return `${fmt(n / 1_000_000)} mi`;
}

export const sizeLabel = (chars: number) => `${compactCount(chars)} caracteres`;
