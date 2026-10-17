import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: string[] = [];
let clipboard = "";

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    return Promise.resolve(null);
  },
}));

const { default: ProtoWeather } = await import("./ProtoWeather");
const { default: ProtoHabits } = await import("./ProtoHabits");
const { default: ProtoMarket } = await import("./ProtoMarket");
const { default: ProtoSnippets } = await import("./ProtoSnippets");
const { default: ProtoReads } = await import("./ProtoReads");

beforeEach(() => {
  calls.length = 0;
  clipboard = "";
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: async (text: string) => void (clipboard = text) },
  });
});
afterEach(cleanup);

test("the weather prototype shows now, the next hours and the next days", () => {
  render(<ProtoWeather />);
  expect(screen.getByText("protótipo")).toBeTruthy();
  expect(screen.getByText("22 °C")).toBeTruthy();
  expect(document.querySelector("[data-proto-now]")?.textContent).toContain("parcialmente nublado");
  expect(screen.getByText("chuva a partir das 16:00")).toBeTruthy();
  expect(screen.getByText("próximas horas")).toBeTruthy();
  expect(document.querySelector("polyline")?.getAttribute("points")).toBeTruthy();
  expect(document.querySelectorAll("[data-proto-day]")).toHaveLength(4);
  expect(screen.getByText(/Open-Meteo, que é aberto e sem chave/)).toBeTruthy();
});

test("the habits prototype checks a habit off without touching the vault", () => {
  render(<ProtoHabits />);
  const water = screen.getByLabelText("Beber 2 L de água") as HTMLInputElement;
  expect(water.checked).toBe(true);
  fireEvent.click(water);
  expect(water.checked).toBe(false);
  expect(screen.getByText("3 dias seguidos · recorde: 9")).toBeTruthy();
  expect(document.querySelectorAll("[data-proto-habit]")).toHaveLength(3);
  expect(calls).toEqual([]);
});

test("the market prototype shows every quote with the day's variation", () => {
  render(<ProtoMarket />);
  expect(screen.getByText("Dólar (PTAX)")).toBeTruthy();
  expect(screen.getByText("+0,31% no dia")).toBeTruthy();
  expect(screen.getByText("-0,44% no dia")).toBeTruthy();
  expect(document.querySelectorAll("[data-proto-quote]")).toHaveLength(4);
  expect(document.querySelectorAll("polyline")).toHaveLength(4);
});

test("the snippets prototype searches, copies and offers the paste shortcut", async () => {
  render(<ProtoSnippets />);
  expect(document.querySelectorAll("[data-proto-snippet]")).toHaveLength(3);
  await act(async () => fireEvent.change(screen.getByLabelText("buscar no snippet"), { target: { value: "sql" } }));
  expect(document.querySelectorAll("[data-proto-snippet]")).toHaveLength(1);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "copiar" })));
  expect(clipboard).toContain("select date_trunc");
  expect(screen.getByRole("button", { name: "copiar ✓" })).toBeTruthy();
  expect(calls).toEqual([]);
});

test("the reads prototype marks one as read and only opens the browser on a click", async () => {
  render(<ProtoReads />);
  expect(screen.getByText("2 não lidos")).toBeTruthy();
  await act(async () => fireEvent.click(screen.getAllByRole("button", { name: "marcar como lido" })[0]));
  expect(screen.getByText("1 não lidos")).toBeTruthy();
  expect(calls).toEqual([]);
  await act(async () => fireEvent.click(screen.getAllByRole("button", { name: "abrir no navegador" })[0]));
  expect(calls).toEqual(["open_link"]);
});

test("no prototype calls the backend on mount: they are mockups", () => {
  render(
    <>
      <ProtoWeather />
      <ProtoHabits />
      <ProtoMarket />
      <ProtoSnippets />
      <ProtoReads />
    </>,
  );
  expect(calls).toEqual([]);
});
