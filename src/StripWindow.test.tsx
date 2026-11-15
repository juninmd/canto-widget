import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: string[] = [];
const emitted: { event: string; payload?: unknown }[] = [];
let snapshot: Record<string, unknown>;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    if (cmd === "strip_config_get") return Promise.resolve({ enabled: true, edge: "top", items: ["cpu", "event"] });
    if (cmd === "strip_snapshot") return Promise.resolve(snapshot);
    return Promise.resolve(null);
  },
}));
mock.module("@tauri-apps/api/event", () => ({
  listen: () => Promise.resolve(() => {}),
  emit: (event: string, payload?: unknown) => {
    emitted.push({ event, payload });
    return Promise.resolve();
  },
}));

const { default: StripWindow } = await import("./StripWindow");

beforeEach(() => {
  calls.length = 0;
  emitted.length = 0;
  snapshot = { cpu: 23, memory: 60, weather: null, event: { title: "Daily", in_min: 14, meet: true }, reviews: 0, notices: 0 };
});
afterEach(cleanup);

async function ready() {
  render(<StripWindow />);
  await act(async () => {});
}

test("the pill shows only the switched-on items", async () => {
  await ready();
  const pill = screen.getByRole("button", { name: "Mini-dashboard do Canto" });
  expect(pill.textContent).toContain("23%");
  expect(pill.textContent).toContain("em 14 min");
  expect(pill.textContent).not.toContain("60%");
});

test("a click pins the details open and shows Entrar for a Meet event", async () => {
  await ready();
  expect(screen.queryByText("Entrar")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Mini-dashboard do Canto" }));
  fireEvent.click(await screen.findByText("Entrar"));
  expect(calls).toContain("strip_join");
});

test("opening an item asks the widget for its tab and brings it up", async () => {
  await ready();
  fireEvent.click(screen.getByRole("button", { name: "Mini-dashboard do Canto" }));
  fireEvent.click(await screen.findByText("CPU"));
  expect(emitted).toEqual([{ event: "canto://open-tab", payload: "system" }]);
  expect(calls).toContain("main_show");
});

test("Escape closes the details", async () => {
  await ready();
  fireEvent.click(screen.getByRole("button", { name: "Mini-dashboard do Canto" }));
  await screen.findByText("Entrar");
  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByText("Entrar")).toBeNull();
});
