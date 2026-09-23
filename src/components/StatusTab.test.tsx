import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let status: () => Promise<unknown>;
const calls: { cmd: string; args: Record<string, unknown> }[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown>) => {
    calls.push({ cmd, args });
    return cmd === "api_status" ? status() : Promise.resolve(null);
  },
}));

const { default: StatusTab } = await import("./StatusTab");

const claude = {
  id: "claude",
  label: "Claude",
  items: [{ title: "Elevated latency", link: "https://status.claude.com/incidents/1", published_at: 1_758_000_000_000 }],
  error: null,
};
const aws = { id: "aws", label: "AWS", items: [], error: null };
const magalu = { id: "magalu", label: "Magalu Cloud", items: [], error: "sem resposta" };

async function show() {
  render(<StatusTab />);
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  status = () => Promise.resolve([claude, aws, magalu]);
});
afterEach(cleanup);

async function openAccordion(label: string) {
  await act(async () => {
    fireEvent.click(screen.getByText(label));
  });
}

test("every source starts collapsed; opening one shows its incidents and opens the link", async () => {
  await show();
  expect(screen.getByText("Claude")).toBeTruthy();
  expect(screen.queryByText(/Elevated latency/)).toBeNull();
  await openAccordion("Claude");
  expect(screen.getByText(/Elevated latency/)).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByText(/Elevated latency/));
  });
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: claude.items[0].link });
});

test("a source with no recent incidents says so instead of showing an empty list", async () => {
  await show();
  await openAccordion("AWS");
  expect(screen.getByText("nenhum incidente recente")).toBeTruthy();
});

test("a source that failed to fetch shows its error instead of the incident list", async () => {
  await show();
  await openAccordion("Magalu Cloud");
  expect(screen.getByText(/indisponível: sem resposta/)).toBeTruthy();
});

test("opening a second source closes the first one", async () => {
  await show();
  await openAccordion("Claude");
  expect(screen.getByText(/Elevated latency/)).toBeTruthy();
  await openAccordion("AWS");
  expect(screen.queryByText(/Elevated latency/)).toBeNull();
});

test("atualizar forces a fresh fetch instead of the cache", async () => {
  await show();
  calls.length = 0;
  await act(async () => {
    fireEvent.click(screen.getByText("atualizar"));
  });
  expect(calls.find((c) => c.cmd === "api_status")?.args).toEqual({ force: true });
});

test("services are listed by last incident and the ones with an incident in the last 24h are highlighted", async () => {
  const recent = { ...claude, id: "gh", label: "GitHub", items: [{ ...claude.items[0], published_at: Date.now() - 60_000 }] };
  status = () => Promise.resolve([aws, claude, recent]);
  await show();
  const labels = [...document.querySelectorAll("section")].map((s) => s.querySelector(".font-semibold")?.textContent);
  expect(labels).toEqual(["GitHub", "Claude", "AWS"]);
  expect(screen.getByText("GitHub").closest("section")?.hasAttribute("data-troubled")).toBe(true);
  expect(screen.getByText("Claude").closest("section")?.hasAttribute("data-troubled")).toBe(false);
});

test("a live outage from Statuspage is highlighted with its description even without recent history", async () => {
  const down = { ...aws, id: "npm", label: "npm", live: { indicator: "major", description: "Partial System Outage" } };
  status = () => Promise.resolve([down, claude]);
  await show();
  expect(screen.getByText("npm").closest("section")?.hasAttribute("data-troubled")).toBe(true);
  expect(screen.getByText(/Partial System Outage/)).toBeTruthy();
});
