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
    expect((screen.getByRole("button", { name: "tentar de novo" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
