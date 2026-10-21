import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { DriveFile } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];

const FILES: DriveFile[] = [
  { id: "1", name: "Roadmap Q4 2026", kind: "doc", link: "https://docs.google.com/document/d/1/edit", modified: "2026-10-01T14:20:00Z", starred: true, editor: "" },
  { id: "2", name: "Kickoff Vértice", kind: "slide", link: "", modified: "2026-10-02T09:00:00Z", starred: false, editor: "Rafael Prado" },
];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    return Promise.resolve(cmd === "gdrive_list" ? FILES : null);
  },
}));

const { default: GDriveTab } = await import("./GDriveTab");

beforeEach(() => {
  calls.length = 0;
});
afterEach(cleanup);

test("recent files show their kind, who edited them and open in the browser", async () => {
  render(<GDriveTab />);
  expect(await screen.findByText("Roadmap Q4 2026")).toBeTruthy();
  expect(screen.getByText("DOC")).toBeTruthy();
  expect(screen.getByText("APRES")).toBeTruthy();
  expect(screen.getByText(/^editado por você · 01\/10/)).toBeTruthy();
  expect(screen.getByText(/^Rafael Prado editou · 02\/10/)).toBeTruthy();
  expect(screen.getByRole("img", { name: "com estrela" })).toBeTruthy();
  const open = screen.getAllByRole("button", { name: "abrir" });
  expect(open).toHaveLength(1);
  fireEvent.click(open[0]);
  expect(calls.at(-1)).toEqual({ cmd: "open_link", args: { url: "https://docs.google.com/document/d/1/edit" } });
  expect(calls[0]).toEqual({ cmd: "gdrive_list", args: { filter: "recent", search: "" } });
});

test("a filter and a name search go to Rust", async () => {
  render(<GDriveTab />);
  fireEvent.click(await screen.findByRole("button", { name: "Compartilhados comigo" }));
  await waitFor(() => expect(calls.at(-1)).toEqual({ cmd: "gdrive_list", args: { filter: "shared", search: "" } }));
  fireEvent.change(screen.getByLabelText("buscar no Drive"), { target: { value: "roadmap" } });
  await waitFor(() => expect(calls.at(-1)).toEqual({ cmd: "gdrive_list", args: { filter: "shared", search: "roadmap" } }));
});
