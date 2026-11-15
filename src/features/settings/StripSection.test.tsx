import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const saved: unknown[] = [];
let stored = { enabled: false, edge: "top", items: ["cpu", "event"] };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: { config?: typeof stored }) => {
    if (cmd === "strip_config_get") return Promise.resolve(stored);
    if (cmd === "strip_config_set") {
      saved.push(args?.config);
      stored = args!.config!;
      return Promise.resolve(stored);
    }
    return Promise.resolve(null);
  },
}));

const { default: StripSection } = await import("./StripSection");

beforeEach(() => {
  saved.length = 0;
  stored = { enabled: false, edge: "top", items: ["cpu", "event"] };
});
afterEach(cleanup);

test("it is off by default and the options only appear once it is on", async () => {
  render(<StripSection onError={() => {}} />);
  const box = await screen.findByLabelText("mostrar o mini-dashboard na borda da tela");
  expect((box as HTMLInputElement).checked).toBe(false);
  expect(screen.queryByLabelText("Memória")).toBeNull();
  await act(async () => fireEvent.click(box));
  expect(saved).toEqual([{ enabled: true, edge: "top", items: ["cpu", "event"] }]);
  expect(await screen.findByLabelText("Memória")).toBeTruthy();
});

test("switching an item on and the edge to the bottom is saved", async () => {
  stored = { enabled: true, edge: "top", items: ["cpu"] };
  render(<StripSection onError={() => {}} />);
  const memory = await screen.findByLabelText("Memória");
  await act(async () => fireEvent.click(memory));
  await act(async () => fireEvent.click(screen.getByLabelText("base")));
  expect(saved).toEqual([
    { enabled: true, edge: "top", items: ["cpu", "memory"] },
    { enabled: true, edge: "bottom", items: ["cpu", "memory"] },
  ]);
});
