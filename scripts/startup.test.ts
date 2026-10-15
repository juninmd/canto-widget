import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

test("webviews wait for Rust state initialization before sending startup commands", () => {
  const config = JSON.parse(readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8"));
  const windows = config.app.windows as { label: string; create?: boolean }[];
  expect(windows.map((window) => window.label).sort()).toEqual(["alert", "capture", "main"]);
  for (const window of windows) {
    expect(window.create, `${window.label} can invoke commands before setup registers their state`).toBe(false);
  }
});
