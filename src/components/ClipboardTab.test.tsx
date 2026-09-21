import { afterEach, beforeEach, expect, jest, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];

const items = [
  { id: "c1", preview: "https://example.com", chars: 20, kept: 20, truncated: false, copied_at: 1, pinned: false },
  { id: "c2", preview: "anotação qualquer", chars: 18, kept: 18, truncated: false, copied_at: 2, pinned: false },
];

// Per-query response and delay, so a test can make one query resolve slower than another and
// prove the slower (older) reply doesn't overwrite the faster (newer) one.
type ClipResponse = { items: typeof items; delayMs?: number };
let responses: Record<string, ClipResponse> = { "": { items } };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "clip_list") {
      const q = (args?.query as string | undefined) ?? "";
      const { items: got, delayMs = 0 } = responses[q] ?? { items: [] };
      return new Promise((resolve) => setTimeout(() => resolve({ items: got, max_pinned: 100 }), delayMs));
    }
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
  responses = { "": { items } };
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

test("a slow reply for an older query does not overwrite a faster, newer search", async () => {
  jest.useFakeTimers();
  try {
    // The initial (empty-query) background poll is made slow; a search typed right after starts
    // a faster request for a different query, which must win even though it started later.
    responses[""] = { items, delayMs: 400 };
    responses.notas = { items: [items[1]], delayMs: 10 };

    render(
      <ToastProvider>
        <ClipboardTab privacy={false} onError={() => {}} />
      </ToastProvider>,
    );

    // Fires the initial 150ms debounce (query "") and lets its slow request start.
    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText("buscar no clipboard"), { target: { value: "notas" } });
    });

    // Fires the "notas" debounce, lets its fast reply land, then the earlier slow "" reply
    // arrives last and must be dropped as stale.
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.getByText("anotação qualquer")).toBeDefined();
    expect(screen.queryByText("https://example.com")).toBeNull();
  } finally {
    jest.useRealTimers();
  }
});
