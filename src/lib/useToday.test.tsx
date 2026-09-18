import { afterEach, expect, jest, test } from "bun:test";
import { act } from "react";
import { cleanup, render } from "@testing-library/react";
import { useToday } from "./useToday";

let moment = new Date();

function Probe() {
  return <span data-testid="dia">{useToday(() => moment)}</span>;
}

afterEach(() => {
  jest.useRealTimers();
  cleanup();
});

test("rolls over the day without remounting the widget", async () => {
  moment = new Date(2026, 8, 9, 23, 59, 30);
  jest.useFakeTimers();
  const { getByTestId } = render(<Probe />);
  expect(getByTestId("dia").textContent).toBe("2026-09-09");

  moment = new Date(2026, 8, 10, 0, 0, 5);
  await act(async () => {
    jest.advanceTimersByTime(30_000);
  });
  expect(getByTestId("dia").textContent).toBe("2026-09-10");
});

test("does not re-render needlessly within the same day", async () => {
  moment = new Date(2026, 8, 9, 10, 0, 0);
  jest.useFakeTimers();
  const { getByTestId } = render(<Probe />);

  moment = new Date(2026, 8, 9, 10, 30, 0);
  await act(async () => {
    jest.advanceTimersByTime(30 * 60_000);
  });
  expect(getByTestId("dia").textContent).toBe("2026-09-09");
});
