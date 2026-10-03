import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";

const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    return Promise.resolve(null);
  },
}));
const { default: FocusedAlert } = await import("./FocusedAlert");

afterEach(() => {
  cleanup();
  calls.length = 0;
});

const meeting: AgendaItem = {
  id: "e1",
  title: "Planejamento da sprint",
  start: new Date(Date.now() + 120_000).toISOString(),
  end: "",
  all_day: false,
  location: "",
  meet: "https://meet.google.com/aaa-bbbb-ccc",
  link: "",
};

test("shows the kind, the title and the same actions as the pop-up", () => {
  render(<FocusedAlert event={meeting} onGone={() => {}} onCompleted={() => {}} onOpenModels={() => {}} />);
  const region = screen.getByRole("region", { name: "aviso em foco" });
  expect(region.textContent).toContain("reunião começando");
  expect(region.textContent).toContain("Planejamento da sprint");
  expect(screen.getByRole("button", { name: "entrar no Meet" })).toBeDefined();
  expect(screen.getByRole("button", { name: "fechar" })).toBeDefined();
});

test("closing drops the alert in Rust too, so the dock stops listing it", () => {
  const gone: string[] = [];
  render(<FocusedAlert event={meeting} onGone={(id) => gone.push(id)} onCompleted={() => {}} onOpenModels={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: "fechar" }));
  expect(calls).toContainEqual({ cmd: "alert_close", args: { id: "e1" } });
  expect(gone).toEqual(["e1"]);
});
