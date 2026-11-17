import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { api } from "./api";

describe("api", () => {
  test("every domain's methods reach `api` with no name shadowed by another domain", async () => {
    const dir = new URL("./ipc/", import.meta.url);
    let total = 0;
    for (const file of readdirSync(dir)) {
      if (file.endsWith(".test.ts")) continue;
      const mod = (await import(new URL(file, dir).href)) as Record<string, unknown>;
      for (const [name, value] of Object.entries(mod)) {
        if (!name.endsWith("Api") || typeof value !== "object" || value === null) continue;
        const keys = Object.keys(value);
        for (const k of keys) expect(Object.hasOwn(api, k)).toBe(true);
        total += keys.length;
      }
    }
    expect(Object.keys(api).length).toBe(total);
  });
});
