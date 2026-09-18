export type ClipKind = "link" | "color" | "code" | "text";

const URL_ONLY = /^https?:\/\/\S+$/i;
const COLOR = /^(#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:rgb|hsl)a?\([^()]{1,60}\))$/i;
const CODE_HINT = /[{};]\s*$|^\s*(?:import|export|const|let|function|def|class|select|insert|update|fn|pub|use|<\/?[a-z])\b|=>|::|\$\(|^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/im;

export function clipKind(text: string): ClipKind {
  const t = text.trim();
  if (URL_ONLY.test(t)) return "link";
  if (COLOR.test(t)) return "color";
  if (CODE_HINT.test(t)) return "code";
  return "text";
}

export const KIND_LABEL: Record<ClipKind, string> = { link: "link", color: "cor", code: "código", text: "texto" };

export function compactCount(n: number): string {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  if (n < 1_000) return String(n);
  if (n < 1_000_000) return `${fmt(n / 1_000)} mil`;
  return `${fmt(n / 1_000_000)} mi`;
}

export const sizeLabel = (chars: number) => `${compactCount(chars)} caracteres`;
