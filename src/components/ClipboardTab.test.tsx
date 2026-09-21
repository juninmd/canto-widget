import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];

const items = [
  { id: "c1", preview: "https://example.com", chars: 20, kept: 20, truncated: false, copied_at: 1, pinned: false },
  { id: "c2", preview: "anotação qualquer", chars: 18, kept: 18, truncated: false, copied_at: 2, pinned: false },
];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "clip_list") return Promise.resolve({ items, max_pinned: 100 });
    return Promise.resolve(null);
  },
}));

const { default: ClipboardTab } = await import("./ClipboardTab");
const { ToastProvider } = await import("../lib/toast");

async function show(privacy = false) {
  render(
    <ToastProvider>
      <ClipboardTab privacy={privacy} onError={() => {}} />
    </ToastProvider>,
  );
  // The list only loads after ClipboardTab's own 150ms search debounce.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 200));
  });
}

beforeEach(() => {
  calls.length = 0;
});

afterEach(cleanup);

test("the type filter only keeps items matching the selected kind", async () => {
  await show();
  expect(screen.getByText("https://example.com")).toBeDefined();
  expect(screen.getByText("anotação qualquer")).toBeDefined();

  await act(async () => {
    fireEvent.change(screen.getByLabelText("filtrar por tipo"), { target: { value: "link" } });
  });

  expect(screen.getByText("https://example.com")).toBeDefined();
  expect(screen.queryByText("anotação qualquer")).toBeNull();
});

test("changing the pinned limit saves it through clip_set_max_pinned, clamped", async () => {
  await show();
  const input = screen.getByLabelText("máximo de itens fixados");

  await act(async () => {
    fireEvent.change(input, { target: { value: "5000" } });
  });
  expect(calls.at(-1)).toEqual({ cmd: "clip_set_max_pinned", args: { max: 1000 } });

  await act(async () => {
    fireEvent.change(input, { target: { value: "0" } });
  });
  expect(calls.at(-1)).toEqual({ cmd: "clip_set_max_pinned", args: { max: 1 } });
});

test("privacy mode blurs the preview text without hiding the card itself", async () => {
  await show(true);
  expect(screen.getByText("anotação qualquer").className).toContain("blur-sm");
  expect(screen.getByLabelText("máximo de itens fixados")).toBeTruthy();
});
