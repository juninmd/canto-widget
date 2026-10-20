import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: string[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    return Promise.resolve(null);
  },
}));

const { default: ProtoMarket } = await import("./ProtoMarket");

beforeEach(() => {
  calls.length = 0;
});
afterEach(cleanup);

test("the market prototype shows every quote with the day's variation", () => {
  render(<ProtoMarket />);
  expect(screen.getAllByText("Dólar (PTAX)")).toHaveLength(2);
  expect(screen.getByText("+0,31% no dia")).toBeTruthy();
  expect(screen.getByText("-0,44%")).toBeTruthy();
  expect(document.querySelectorAll("[data-proto-quote]")).toHaveLength(4);
  expect(document.querySelectorAll("[data-market-delta=down]")).toHaveLength(2);
});

test("the first quote starts in the spotlight and picking a card moves its curve there", () => {
  render(<ProtoMarket />);
  expect(document.querySelector("[data-market-hero]")?.getAttribute("data-market-hero")).toBe("USD/BRL");
  fireEvent.click(screen.getByRole("button", { name: /Ibovespa/ }));
  expect(document.querySelector("[data-market-hero]")?.getAttribute("data-market-hero")).toBe("IBOV");
  expect(screen.getByRole("button", { name: /Ibovespa/ }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByText("-0,44% no dia")).toBeTruthy();
});

test("no prototype calls the backend on mount: they are mockups", () => {
  render(<ProtoMarket />);
  expect(calls).toEqual([]);
});
