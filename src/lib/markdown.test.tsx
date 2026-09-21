import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: { url: string }[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    if (cmd === "open_link") calls.push({ url: args?.url as string });
    return Promise.resolve(null);
  },
}));

const { renderMarkdown } = await import("./markdown");

afterEach(cleanup);

test("bold, italic and inline code render as their tags", () => {
  render(<div>{renderMarkdown("**forte** e *itálico* e `codigo`")}</div>);
  expect(screen.getByText("forte").tagName).toBe("STRONG");
  expect(screen.getByText("itálico").tagName).toBe("EM");
  expect(screen.getByText("codigo").tagName).toBe("CODE");
});

test("headings use the number of # as the level", () => {
  render(<div>{renderMarkdown("# um\n## dois\n### tres")}</div>);
  expect(screen.getByText("um").tagName).toBe("H1");
  expect(screen.getByText("dois").tagName).toBe("H2");
  expect(screen.getByText("tres").tagName).toBe("H3");
});

test("bullet and numbered lists render as ul/ol", () => {
  render(<div>{renderMarkdown("- a\n- b")}</div>);
  expect(screen.getByText("a").closest("ul")).toBeTruthy();
  cleanup();
  render(<div>{renderMarkdown("1. a\n2. b")}</div>);
  expect(screen.getByText("a").closest("ol")).toBeTruthy();
});

test("an http(s) link becomes a clickable button that opens through the validated command", async () => {
  render(<div>{renderMarkdown("veja [o site](https://exemplo.com)")}</div>);
  const link = screen.getByRole("button", { name: "o site" });
  fireEvent.click(link);
  await Promise.resolve();
  expect(calls).toContainEqual({ url: "https://exemplo.com" });
});

test("a non-http(s) link is kept as literal text, never turned into a clickable element", () => {
  render(<div>{renderMarkdown("[clique aqui](javascript:alert(1))")}</div>);
  expect(screen.queryByRole("button", { name: "clique aqui" })).toBeNull();
  expect(screen.getByText("[clique aqui](javascript:alert(1))")).toBeTruthy();
});
