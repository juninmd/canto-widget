import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ErrorBanner from "./ErrorBanner";

describe("ErrorBanner", () => {
  afterEach(cleanup);

  test("announces the failure and retries on click", () => {
    const onRetry = mock(() => {});
    render(<ErrorBanner message="Falhou" onRetry={onRetry} />);
    expect(screen.getByRole("alert").textContent).toContain("Falhou");
    fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test("disables the retry while busy", () => {
    render(<ErrorBanner message="Falhou" onRetry={() => {}} busy />);
    const retry = screen.getByRole("button", { name: "tentar de novo" }) as HTMLButtonElement;
    expect(retry.disabled).toBe(true);
    // The disabled button alone reads as "unavailable"; aria-busy and the spinner say the retry is running.
    expect(retry.getAttribute("aria-busy")).toBe("true");
    expect(retry.querySelector("svg")).toBeTruthy();
  });

  test("an idle retry shows no spinner", () => {
    render(<ErrorBanner message="Falhou" onRetry={() => {}} />);
    const retry = screen.getByRole("button", { name: "tentar de novo" });
    expect(retry.getAttribute("aria-busy")).toBe("false");
    expect(retry.querySelector("svg") === null).toBe(true);
  });
});
