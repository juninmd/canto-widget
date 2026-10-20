import { afterEach, expect, mock, spyOn, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let hidden = 0;
mock.module("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    hide: () => {
      hidden += 1;
      return Promise.resolve();
    },
  }),
}));

const { default: WindowBoundary } = await import("./WindowBoundary");

function Broken(): never {
  throw new Error("aba quebrou");
}

afterEach(cleanup);

test("a render error leaves a solid panel instead of an invisible window that eats clicks", () => {
  const quiet = spyOn(console, "error").mockImplementation(() => {});
  render(
    <WindowBoundary>
      <Broken />
    </WindowBoundary>,
  );
  quiet.mockRestore();
  expect(screen.getByRole("alert").textContent).toContain("Não foi possível carregar. aba quebrou");
  fireEvent.click(screen.getByRole("button", { name: "fechar" }));
  expect(hidden).toBe(1);
  expect(screen.getByRole("button", { name: "tentar de novo" })).toBeTruthy();
});

test("without an error it renders the window as is", () => {
  render(
    <WindowBoundary>
      <p>canto</p>
    </WindowBoundary>,
  );
  expect(screen.getByText("canto")).toBeTruthy();
});
