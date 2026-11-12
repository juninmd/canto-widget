import { expect, test } from "bun:test";
import { decodeJwt, decodeText, digests, encodeText, expiry, formatJson, jsonPath, lineDiff, parseInstant, parseUrl, randomSecret, signJwt, span, testRegex, verifyJwt } from "./tools";

test("JSON formats, minifies and sorts keys, and reports the parse error", () => {
  const r = (m: "format" | "minify" | "sort") => formatJson('{"b":1,"a":{"d":[1,2],"c":0}}', m) as { ok: true; value: { out: string; value: unknown } };
  expect(r("minify")).toEqual({ ok: true, value: { out: '{"b":1,"a":{"d":[1,2],"c":0}}', value: { b: 1, a: { d: [1, 2], c: 0 } } } });
  expect(r("sort").ok && r("sort").value.out.indexOf('"a"') < r("sort").value.out.indexOf('"b"')).toBe(true);
  expect(formatJson("{x", "format").ok).toBe(false);
});

test("a JSON path walks keys and array indexes", () => {
  const v = { abas: [{ id: "portas" }, { id: "docker" }] };
  expect(jsonPath(v, "abas[1].id")).toBe("docker");
  expect(jsonPath(v, "abas[5].id")).toBeUndefined();
  expect(jsonPath(v, "")).toEqual(v);
});

test("Base64 round-trips UTF-8 and has a URL-safe form", () => {
  expect(encodeText("ação ✓")).toBe("YcOnw6NvIOKckw==");
  expect(decodeText("YcOnw6NvIOKckw==")).toBe("ação ✓");
  expect(encodeText("???>>>", true)).toBe("Pz8_Pj4-");
  expect(decodeText("Pz8_Pj4-")).toBe("???>>>");
  expect(decodeText("%%%")).toBeNull();
});

test("a JWT signs, decodes and verifies with its secret", async () => {
  const token = await signJwt({ alg: "HS256", typ: "JWT" }, { sub: "42", exp: 2_000_000_000 }, "segredo");
  expect(token).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsImV4cCI6MjAwMDAwMDAwMH0.y3FrJ6vUBLmSEuARNPQLIt97Vj7gvnV8sOhPm0hezl8");
  expect(decodeJwt(token)?.payload).toEqual({ sub: "42", exp: 2_000_000_000 });
  expect(await verifyJwt(token, "segredo")).toBe(true);
  expect(await verifyJwt(token, "outro")).toBe(false);
  expect(await verifyJwt(await signJwt({ alg: "none" }, { a: 1 }, ""), "")).toBeNull();
  expect(decodeJwt("lixo")).toBeNull();
  await expect(signJwt({ alg: "RS256" }, {}, "x")).rejects.toThrow();
});

test("expiry tells valid, expired and none", () => {
  expect(expiry({}, 0)).toEqual({ kind: "none" });
  expect(expiry({ exp: 100 }, 50_000)).toEqual({ kind: "valid", ms: 50_000 });
  expect(expiry({ exp: 100 }, 150_000)).toEqual({ kind: "expired", ms: -50_000 });
});

test("span picks the largest unit that fits", () => {
  expect(span(45_000)).toEqual({ n: 45, unit: "s" });
  expect(span(-3 * 3_600_000)).toEqual({ n: 3, unit: "h" });
  expect(span(40 * 86_400_000)).toEqual({ n: 1, unit: "mo" });
});

test("a URL breaks into its parts and a bad one is null", () => {
  const p = parseUrl("https://api.x.dev/v1/t?status=aberta&tag=a&tag=b#top");
  expect(p?.url.hostname).toBe("api.x.dev");
  expect(p?.params).toEqual([["status", "aberta"], ["tag", "a"], ["tag", "b"]]);
  expect(parseUrl("sem protocolo")).toBeNull();
});

test("hashes match known digests and HMAC needs a key", async () => {
  const rows = await digests("abc", "");
  expect(rows[0]).toEqual(["SHA-1", "a9993e364706816aba3e25717850c26c9cd0d89d"]);
  expect(rows[1][1]).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  expect(rows).toHaveLength(3);
  expect((await digests("abc", "k"))[3][0]).toBe("HMAC-SHA256");
});

test("random secrets have the asked size", () => {
  const s = randomSecret(16);
  expect(s.hex).toHaveLength(32);
  expect(s.base64).not.toMatch(/[+/=]/);
});

test("instants read seconds, milliseconds and dates", () => {
  expect(parseInstant("1762000000")).toBe(1_762_000_000_000);
  expect(parseInstant("1762000000000")).toBe(1_762_000_000_000);
  expect(parseInstant("2026-11-12T21:00:00Z")).toBe(Date.UTC(2026, 10, 12, 21));
  expect(parseInstant("amanhã")).toBeNull();
  expect(parseInstant("")).toBeNull();
});

test("a regex marks its matches, groups included, and reports a bad pattern", () => {
  const r = testRegex("(\\w+)@(\\w+)\\.com", "", "ana@canto.com, x@y.org");
  if ("error" in r) throw new Error(r.error);
  expect(r.matches).toEqual([{ text: "ana@canto.com", index: 0, groups: ["ana", "canto"] }]);
  expect(r.pieces.map((p) => p.hit)).toEqual([true, false]);
  expect("error" in testRegex("(", "", "x")).toBe(true);
  expect(testRegex("a*", "g", "bbb")).toEqual({ pieces: [{ text: "bbb", hit: false }], matches: [] });
});

test("the line diff marks what left and what came", () => {
  expect(lineDiff("a\nb\nc", "a\nc\nd")).toEqual([
    { op: " ", text: "a" }, { op: "-", text: "b" }, { op: " ", text: "c" }, { op: "+", text: "d" },
  ]);
  expect(lineDiff("x".repeat(1), "x")?.every((l) => l.op === " ")).toBe(true);
  expect(lineDiff("\n".repeat(3000), "\n".repeat(3000))).toBeNull();
});
