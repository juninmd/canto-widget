import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";

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
  expect(screen.getByText("Dólar (PTAX)")).toBeTruthy();
  expect(screen.getByText("+0,31% no dia")).toBeTruthy();
  expect(screen.getByText("-0,44% no dia")).toBeTruthy();
  expect(document.querySelectorAll("[data-proto-quote]")).toHaveLength(4);
  expect(document.querySelectorAll("polyline")).toHaveLength(4);
});

test("no prototype calls the backend on mount: they are mockups", () => {
  render(<ProtoMarket />);
  expect(calls).toEqual([]);
});
