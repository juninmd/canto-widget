import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { loadWindowRoot, windowKind } from "./windowRoot";

test("the query string picks the window", () => {
  expect(windowKind("?alert")).toBe("alert");
  expect(windowKind("?capture")).toBe("capture");
  expect(windowKind("")).toBe("main");
  expect(windowKind("?other=1")).toBe("main");
  // Same precedence as before: an alert flag wins over capture.
  expect(windowKind("?capture&alert")).toBe("alert");
});

test("each kind loads its own component", async () => {
  expect(await loadWindowRoot("alert")).toBe((await import("../AlertWindow")).default);
  expect(await loadWindowRoot("capture")).toBe((await import("../CaptureWindow")).default);
  expect(await loadWindowRoot("main")).toBe((await import("../App")).default);
});

test("the entry imports no window statically, so the pop-up never parses the widget", () => {
  const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
  expect(main).not.toMatch(/^import .* from "\.\/(App|AlertWindow|CaptureWindow)";$/m);
});
