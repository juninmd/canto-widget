import { afterEach, expect, jest, test } from "bun:test";
import { act } from "react";
import { cleanup, render } from "@testing-library/react";
import { useToday } from "./useToday";

let momento = new Date();

function Sonda() {
  return <span data-testid="dia">{useToday(() => momento)}</span>;
}

afterEach(() => {
  jest.useRealTimers();
  cleanup();
});

test("vira o dia sem precisar remontar o widget", async () => {
  momento = new Date(2026, 8, 9, 23, 59, 30);
  jest.useFakeTimers();
  const { getByTestId } = render(<Sonda />);
  expect(getByTestId("dia").textContent).toBe("2026-09-09");

  momento = new Date(2026, 8, 10, 0, 0, 5);
  await act(async () => {
    jest.advanceTimersByTime(30_000);
  });
  expect(getByTestId("dia").textContent).toBe("2026-09-10");
});

test("nao rerenderiza a toa dentro do mesmo dia", async () => {
  momento = new Date(2026, 8, 9, 10, 0, 0);
  jest.useFakeTimers();
  const { getByTestId } = render(<Sonda />);

  momento = new Date(2026, 8, 9, 10, 30, 0);
  await act(async () => {
    jest.advanceTimersByTime(30 * 60_000);
  });
  expect(getByTestId("dia").textContent).toBe("2026-09-09");
});
