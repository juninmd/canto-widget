import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: { cmd: string; args: unknown }[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: { config?: unknown }) => {
    calls.push({ cmd, args });
    if (cmd === "bar_agenda_get") return Promise.resolve({ enabled: false, count: 1 });
    return Promise.resolve(args.config);
  },
}));

const { default: BarAgendaSection } = await import("./BarAgendaSection");

afterEach(() => {
  cleanup();
  calls.length = 0;
});

test("it starts off, and turning it on saves in Rust and offers the event count", async () => {
  render(<BarAgendaSection onError={() => {}} />);
  await act(async () => {});
  const box = screen.getByLabelText("mostrar o próximo evento na barra do sistema") as HTMLInputElement;
  expect(box.checked).toBe(false);
  expect(screen.queryByLabelText("eventos na dica da bandeja")).toBeNull();
  await act(async () => {
    fireEvent.click(box);
  });
  expect(calls.find((c) => c.cmd === "bar_agenda_set")?.args).toEqual({ config: { enabled: true, count: 1 } });
  const count = screen.getByLabelText("eventos na dica da bandeja") as HTMLSelectElement;
  await act(async () => {
    fireEvent.change(count, { target: { value: "3" } });
  });
  expect(calls.filter((c) => c.cmd === "bar_agenda_set").at(-1)?.args).toEqual({ config: { enabled: true, count: 3 } });
});
