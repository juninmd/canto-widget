import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { AgendaItem } from "../lib/api";

const calls: string[] = [];
const args: Record<string, unknown>[] = [];
let watched: string[] = [];
let rang = 0;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, a?: Record<string, unknown>) => {
    calls.push(cmd);
    args.push(a ?? {});
    if (cmd === "status_alerts_get") return Promise.resolve(watched);
    if (cmd === "status_alerts_set") return Promise.resolve((a as { ids: string[] }).ids);
    return Promise.resolve(null);
  },
}));
mock.module("../lib/sound", () => ({ playAlert: () => void (rang += 1) }));

const { default: Alert } = await import("./Alert");

const base = { end: "", all_day: false, location: "", meet: "", link: "" };

const meeting: AgendaItem = {
  ...base,
  id: "e1",
  title: "Daily",
  start: new Date(Date.now() + 3 * 60_000).toISOString(),
  meet: "https://meet.google.com/aaa-bbbb-ccc",
};

const outage: AgendaItem = {
  ...base,
  id: "status:github",
  title: "GitHub",
  start: new Date(Date.now() - 18 * 60_000).toISOString(),
  link: "https://www.githubstatus.com",
  description: "Partial System Outage",
  tag: "major",
};

const model: AgendaItem = {
  ...base,
  id: "model:m1",
  title: "Acme-7",
  start: "",
  organizer: "Acme AI",
  description: "Acme AI · #2 com 92,5 pontos",
  tag: "Novo no top 10 · #2",
};

type Handlers = { onDismiss?: (id: string) => void; onOpenModels?: () => void };

function ui(events: AgendaItem[], handlers: Handlers = {}) {
  return <Alert events={events} onDismiss={handlers.onDismiss ?? (() => {})} onOpenModels={handlers.onOpenModels} />;
}

async function show(events: AgendaItem[], handlers: Handlers = {}) {
  let view!: ReturnType<typeof render>;
  await act(async () => {
    view = render(ui(events, handlers));
  });
  return view;
}

const cards = () => within(screen.getByRole("group", { name: "avisos pendentes" })).getAllByRole("button");

beforeEach(() => {
  calls.length = 0;
  args.length = 0;
  watched = [];
  rang = 0;
});

afterEach(cleanup);

test("a Status API alert says how bad and for how long, opens its page, and has no snooze", async () => {
  await show([outage]);
  expect(screen.getByText("serviço com problema")).toBeTruthy();
  expect(screen.getByText("Partial System Outage")).toBeTruthy();
  expect(screen.getByText("interrupção parcial")).toBeTruthy();
  expect(screen.getByText("há 18 min")).toBeTruthy();
  expect(screen.queryByText(/adiar/)).toBeNull();
  await act(async () => {
    fireEvent.click(screen.getByText("abrir página de status"));
  });
  expect(args[calls.indexOf("open_link")]).toEqual({ url: "https://www.githubstatus.com" });
});

test("muting a service stops watching just that one and dismisses the alert", async () => {
  watched = ["github", "aws"];
  const closed: string[] = [];
  await show([outage], { onDismiss: (id) => closed.push(id) });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "silenciar" }));
  });
  expect(args[calls.indexOf("status_alerts_set")]).toEqual({ ids: ["aws"] });
  expect(closed).toEqual(["status:github"]);
});

test("a new model shows its maker and rank and jumps to the Models tab", async () => {
  let opened = false;
  await show([model], { onOpenModels: () => (opened = true) });
  expect(screen.getAllByText("Acme AI").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Novo no top 10 · #2").length).toBeGreaterThan(0);
  expect(screen.queryByText(/adiar/)).toBeNull();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "abrir aba Modelos" }));
  });
  expect(opened).toBe(true);
});

test("everything pending is listed with the worst first, and a click picks which one is detailed", async () => {
  await show([model, meeting, outage]);
  const list = cards();
  expect(list.map((c) => c.textContent)).toEqual([
    expect.stringContaining("GitHub"),
    expect.stringContaining("Daily"),
    expect.stringContaining("Acme-7"),
  ]);
  expect(list[0].getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("button", { name: "abrir página de status" })).toBeTruthy();

  await act(async () => {
    list[1].focus(); // a real click focuses the button; fireEvent alone doesn't
    fireEvent.click(list[1]);
  });
  expect(screen.getByRole("button", { name: "entrar no Meet" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "abrir página de status" })).toBeNull();
  expect(document.activeElement === cards()[1], "picking from the strip must not pull focus away from it").toBe(true);
});

test("a worse alert arriving does not swap the card someone is acting on", async () => {
  const { rerender } = await show([meeting, model]);
  expect(screen.getByRole("button", { name: "entrar no Meet" })).toBeTruthy();

  await act(async () => {
    rerender(ui([meeting, model, outage]));
  });

  expect(screen.getByRole("button", { name: "entrar no Meet" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "abrir página de status" })).toBeNull();
  expect(cards()[0].textContent).toContain("GitHub");
});

test("an alert that rings again after leaving the overlay sounds again", async () => {
  const { rerender } = await show([meeting, outage]);
  expect(rang).toBe(1);

  await act(async () => {
    rerender(ui([meeting, outage, model]));
  });
  expect(rang, "a newly arrived alert sounds").toBe(2);

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "fechar" }));
  });
  await act(async () => {
    rerender(ui([meeting, model, outage]));
  });
  expect(rang, "the closed alert ringing again must not be silent").toBe(3);
});
