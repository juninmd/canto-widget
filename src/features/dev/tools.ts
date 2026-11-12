// Pure helpers behind the Utilitários sub-tab: nothing here touches the network or the disk.

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const fail = (e: unknown): { ok: false; error: string } => ({ ok: false, error: e instanceof Error ? e.message : String(e) });

export function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]));
  return v;
}

export function jsonDepth(v: unknown): number {
  return v && typeof v === "object" ? 1 + Math.max(0, ...Object.values(v).map(jsonDepth)) : 0;
}

/** `abas[0].id` into the value it points at, or undefined. */
export function jsonPath(v: unknown, path: string): unknown {
  let cur: unknown = v;
  for (const key of path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean)) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

export type JsonMode = "format" | "minify" | "sort";

export function formatJson(text: string, mode: JsonMode): Parsed<{ out: string; value: unknown }> {
  try {
    const value: unknown = JSON.parse(text);
    const shown = mode === "sort" ? sortKeys(value) : value;
    return { ok: true, value: { out: mode === "minify" ? JSON.stringify(shown) : JSON.stringify(shown, null, 2), value } };
  } catch (e) {
    return fail(e);
  }
}

const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

export function toBase64(bytes: Uint8Array, urlSafe = false): string {
  const s = btoa(String.fromCharCode(...bytes));
  return urlSafe ? s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : s;
}

export function fromBase64(text: string): Uint8Array | null {
  try {
    const std = text.trim().replace(/-/g, "+").replace(/_/g, "/");
    return Uint8Array.from(atob(std), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export const encodeText = (text: string, urlSafe = false) => toBase64(enc.encode(text), urlSafe);

export function decodeText(text: string): string | null {
  const bytes = fromBase64(text);
  if (!bytes) return null;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export type Jwt = { header: Record<string, unknown>; payload: Record<string, unknown>; signature: string };

export function decodeJwt(token: string): Jwt | null {
  const [h, p, s = ""] = token.trim().split(".");
  const part = (x?: string): Record<string, unknown> | null => {
    const text = x ? decodeText(x) : null;
    try {
      const v: unknown = text === null ? null : JSON.parse(text);
      return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  };
  const [header, payload] = [part(h), part(p)];
  return header && payload ? { header, payload, signature: s } : null;
}

const HMAC: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };
export const JWT_ALGS = ["HS256", "HS384", "HS512", "none"] as const;

async function hmacBytes(hash: string, key: string, data: string): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(data)));
}

export async function signJwt(header: object, payload: object, secret: string): Promise<string> {
  const alg = (header as { alg?: string }).alg ?? "HS256";
  const base = `${encodeText(JSON.stringify(header), true)}.${encodeText(JSON.stringify(payload), true)}`;
  if (alg === "none") return `${base}.`;
  const hash = HMAC[alg];
  if (!hash) throw new Error(alg);
  return `${base}.${toBase64(await hmacBytes(hash, secret, base), true)}`;
}

/** null when the algorithm isn't an HMAC one (an RSA signature needs the public key, which isn't here). */
export async function verifyJwt(token: string, secret: string): Promise<boolean | null> {
  const jwt = decodeJwt(token);
  const hash = HMAC[String(jwt?.header.alg)];
  if (!jwt || !hash) return null;
  const [h, p] = token.trim().split(".");
  return toBase64(await hmacBytes(hash, secret, `${h}.${p}`), true) === jwt.signature;
}

export type Expiry = { kind: "none" } | { kind: "valid" | "expired"; ms: number };

export function expiry(payload: Record<string, unknown>, now = Date.now()): Expiry {
  const exp = payload.exp;
  if (typeof exp !== "number") return { kind: "none" };
  const ms = exp * 1000 - now;
  return { kind: ms < 0 ? "expired" : "valid", ms };
}

/** One count and unit for a span: "3 d", "12 min". */
export function span(ms: number): { n: number; unit: "s" | "min" | "h" | "d" | "mo" | "y" } {
  const s = Math.abs(ms) / 1000;
  const steps: [number, "s" | "min" | "h" | "d" | "mo" | "y"][] = [[60, "s"], [3600, "min"], [86400, "h"], [2592000, "d"], [31536000, "mo"]];
  const divisors = { s: 1, min: 60, h: 3600, d: 86400, mo: 2592000, y: 31536000 };
  const unit = steps.find(([limit]) => s < limit)?.[1] ?? "y";
  return { n: Math.floor(s / divisors[unit]), unit };
}

export function parseUrl(text: string): { url: URL; params: [string, string][] } | null {
  try {
    const url = new URL(text.trim());
    return { url, params: [...url.searchParams] };
  } catch {
    return null;
  }
}

export function safeDecodeUri(text: string): string | null {
  try {
    return decodeURIComponent(text);
  } catch {
    return null;
  }
}

export const randomUuids = (n: number) => Array.from({ length: n }, () => crypto.randomUUID());

export function randomSecret(bytes = 32): { hex: string; base64: string } {
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  return { hex: [...b].map((x) => x.toString(16).padStart(2, "0")).join(""), base64: toBase64(b, true) };
}

export const HASHES = ["SHA-1", "SHA-256", "SHA-512"] as const;

export async function digests(text: string, key: string): Promise<[string, string][]> {
  const rows: [string, string][] = [];
  for (const alg of HASHES) rows.push([alg, hex(await crypto.subtle.digest(alg, enc.encode(text)))]);
  if (key) rows.push(["HMAC-SHA256", [...(await hmacBytes("SHA-256", key, text))].map((x) => x.toString(16).padStart(2, "0")).join("")]);
  return rows;
}

/** Seconds or milliseconds since 1970 (told apart by size), or any date text `Date` reads. */
export function parseInstant(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  const ms = /^-?\d+(\.\d+)?$/.test(t) ? (Math.abs(Number(t)) > 1e11 ? Number(t) : Number(t) * 1000) : Date.parse(t);
  return Number.isFinite(ms) && Math.abs(ms) < 8.64e15 ? ms : null;
}

export type Piece = { text: string; hit: boolean };
export type RegexResult = { error: string } | { pieces: Piece[]; matches: { text: string; index: number; groups: string[] }[] };

export function testRegex(pattern: string, flags: string, text: string): RegexResult {
  try {
    const clean = [...new Set(flags.replace(/[^dgimsuvy]/g, ""))].join("");
    const re = new RegExp(pattern, clean.includes("g") ? clean : clean + "g");
    const found = [...text.matchAll(re)].filter((m) => m[0] !== "");
    const pieces: Piece[] = [];
    let at = 0;
    for (const m of found) {
      if (m.index > at) pieces.push({ text: text.slice(at, m.index), hit: false });
      pieces.push({ text: m[0], hit: true });
      at = m.index + m[0].length;
    }
    if (at < text.length) pieces.push({ text: text.slice(at), hit: false });
    return { pieces, matches: found.map((m) => ({ text: m[0], index: m.index, groups: m.slice(1).map((g) => g ?? "") })) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export type DiffLine = { op: " " | "+" | "-"; text: string };

/** Line diff by longest common subsequence; null when the inputs are too big to diff in the webview. */
export function lineDiff(a: string, b: string): DiffLine[] | null {
  const [x, y] = [a.split("\n"), b.split("\n")];
  if (x.length * y.length > 4_000_000) return null;
  const d = Array.from({ length: x.length + 1 }, () => new Array<number>(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) d[i][j] = x[i] === y[j] ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
  const out: DiffLine[] = [];
  let [i, j] = [0, 0];
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) out.push({ op: " ", text: x[i++] }), j++;
    else if (d[i + 1][j] >= d[i][j + 1]) out.push({ op: "-", text: x[i++] });
    else out.push({ op: "+", text: y[j++] });
  }
  while (i < x.length) out.push({ op: "-", text: x[i++] });
  while (j < y.length) out.push({ op: "+", text: y[j++] });
  return out;
}
