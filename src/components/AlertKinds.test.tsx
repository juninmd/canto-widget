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

const failingCi: AgendaItem = {
  ...base,
  start: "",
  id: "pr:ci:acme/atlas#12",
  title: "Corrige o parser de CSV",
  organizer: "acme/atlas#12",
  link: "https://github.com/acme/atlas/pull/12",
  description: "O CI falhou neste pull request.",
  tag: "ci",
};

const waiting: AgendaItem = {
  ...failingCi,
  id: "pr:stalled:acme/atlas#12",
  start: new Date(Date.now() - 50 * 3_600_000).toISOString(),
  description: "Sem revisão há 50 h.",
  tag: "stalled",
};

test("a failing CI names the PR, opens it and has no snooze", async () => {
  await show([failingCi]);
  expect(screen.getAllByText("pull request").length).toBeGreaterThan(0);
  expect(screen.getByText("CI falhou")).toBeTruthy();
  expect(screen.getByText("acme/atlas#12")).toBeTruthy();
  expect(screen.getByText("O CI falhou neste pull request.")).toBeTruthy();
  expect(screen.queryByText(/adiar/)).toBeNull();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "abrir PR" }));
  });
  expect(args[calls.indexOf("open_link")]).toEqual({ url: "https://github.com/acme/atlas/pull/12" });
});

test("a PR without a review says for how long it has waited", async () => {
  await show([waiting]);
  expect(screen.getByText("sem revisão")).toBeTruthy();
  expect(screen.getByText("há 2 d")).toBeTruthy();
});

test("a red CI ranks above a stalled PR, and both above a meeting", async () => {
  await show([meeting, waiting, failingCi]);
  const texts = cards().map((c) => c.textContent ?? "");
  expect(texts[0]).toContain("CI falhou");
  expect(texts[1]).toContain("sem revisão");
  expect(texts[2]).toContain("Daily");
});

test("a failing CI lists the jobs that broke, each opening its own page", async () => {
  await show([
    {
      ...failingCi,
      description: "2 falhou: build, lint.",
      attachments: [
        { title: "build · Run tests", url: "https://github.com/acme/atlas/runs/1", mime: "" },
        { title: "ci/legado", url: "", mime: "" },
      ],
    },
  ]);
  expect(screen.getByText("✖ ci/legado").tagName).toBe("P");
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "✖ build · Run tests" }));
  });
  expect(args[calls.indexOf("open_link")]).toEqual({ url: "https://github.com/acme/atlas/runs/1" });
});

const mentionedOnGitlab: AgendaItem = {
  ...base,
  start: "",
  id: "mention:gitlab:42",
  title: "Falha no deploy de produção",
  organizer: "acme/atlas",
  link: "https://git.example.com/acme/atlas/-/issues/9",
  description: "@ana: @voce consegue olhar isso hoje?",
  tag: "gitlab",
};

test("a mention says where it happened, shows what was said and opens the thread", async () => {
  await show([mentionedOnGitlab]);
  expect(screen.getAllByText("você foi mencionado").length).toBeGreaterThan(0);
  expect(screen.getByText("GitLab")).toBeTruthy();
  expect(screen.getByText("acme/atlas")).toBeTruthy();
  expect(screen.getByText("@ana: @voce consegue olhar isso hoje?")).toBeTruthy();
  expect(screen.queryByText(/adiar/)).toBeNull();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "abrir" }));
  });
  expect(args[calls.indexOf("open_link")]).toEqual({ url: "https://git.example.com/acme/atlas/-/issues/9" });
});

test("a GitHub mention is tagged GitHub in the strip and the summary has no open button", async () => {
  const gh: AgendaItem = { ...mentionedOnGitlab, id: "mention:github:acme/atlas#3", tag: "github" };
  const summary: AgendaItem = { ...mentionedOnGitlab, id: "mention:github:summary", link: "", title: "5 menções novas" };
  await show([gh, summary]);
  expect(screen.getAllByText("mencionou você").length).toBe(2);
  expect(screen.getByText("GitHub")).toBeTruthy();
  await act(async () => {
    fireEvent.click(cards()[1]);
  });
  expect(screen.queryByRole("button", { name: "abrir" })).toBeNull();
});
