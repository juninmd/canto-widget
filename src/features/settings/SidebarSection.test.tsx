import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: { cmd: string; args: unknown }[] = [];
let sidebar = false;
let side = "right";
let monitor: string | null = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: { enabled?: boolean; side?: string; monitor?: string | null }) => {
    calls.push({ cmd, args });
    if (cmd === "window_sidebar_set") sidebar = args.enabled === true;
    if (cmd === "window_sidebar_target") ({ side, monitor } = { side: args.side ?? "right", monitor: args.monitor ?? null });
    if (cmd === "strip_monitors") return Promise.resolve(["DP-1", "HDMI-2"]);
    return Promise.resolve({
      position: null, size: null, always_on_top: true, mini: false, sidebar, sidebar_side: side, sidebar_monitor: monitor,
    });
  },
}));

const { default: SidebarSection } = await import("./SidebarSection");

afterEach(() => {
  cleanup();
  calls.length = 0;
  sidebar = false;
  side = "right";
  monitor = null;
});

test("the sidebar box reflects Rust and turning it on asks Rust to dock the window", async () => {
  render(<SidebarSection onError={() => {}} />);
  await act(async () => {});
  const box = screen.getByLabelText("barra lateral que se esconde sozinha") as HTMLInputElement;
  expect(box.checked).toBe(false);
  expect(screen.queryByLabelText("lado da tela")).toBeNull();
  await act(async () => {
    fireEvent.click(box);
  });
  expect(calls.find((c) => c.cmd === "window_sidebar_set")?.args).toEqual({ enabled: true });
  expect(box.checked).toBe(true);
});

test("with the sidebar on, the user picks the edge and the monitor, and both are kept together", async () => {
  sidebar = true;
  render(<SidebarSection onError={() => {}} />);
  await act(async () => {});
  await act(async () => {
    fireEvent.click(screen.getByLabelText("esquerda"));
  });
  expect(calls.find((c) => c.cmd === "window_sidebar_target")?.args).toEqual({ side: "left", monitor: null });
  await act(async () => {
    fireEvent.change(await screen.findByLabelText("monitor"), { target: { value: "HDMI-2" } });
  });
  expect(calls.filter((c) => c.cmd === "window_sidebar_target").at(-1)?.args).toEqual({ side: "left", monitor: "HDMI-2" });
});
