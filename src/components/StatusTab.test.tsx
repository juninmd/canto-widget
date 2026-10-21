import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

let status: () => Promise<unknown>;
let watched: string[] = [];
const calls: { cmd: string; args: Record<string, unknown> }[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "status_alerts_get") return Promise.resolve(watched);
    if (cmd === "status_alerts_set") return Promise.resolve((args as { ids: string[] }).ids);
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
  watched = [];
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
    fireEvent.click(screen.getByRole("button", { name: "atualizar" }));
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

test("services are a single column with a labeled state pill, and the header counts what is wrong", async () => {
  const down = { ...aws, id: "npm", label: "npm", live: { indicator: "major", description: "Partial System Outage" } };
  const fine = { ...aws, id: "github", label: "GitHub", live: { indicator: "none", description: "All Systems Operational" } };
  status = () => Promise.resolve([down, fine]);
  await show();
  expect(document.querySelector(".grid-cols-2")).toBeNull();
  expect(screen.getByText("npm").closest("section")?.getAttribute("data-level")).toBe("down");
  expect(screen.getByText("fora do ar")).toBeTruthy();
  expect(screen.getByText("operacional")).toBeTruthy();
  expect(screen.getByText("GitHub").closest("section")?.getAttribute("data-level")).toBe("ok");
  expect(screen.getByText("1 com problema · 1 operacionais")).toBeTruthy();
});

const live = (indicator: string) => ({ indicator, description: indicator });
const sections = () => [...document.querySelectorAll("section")].map((s) => s.querySelector(".font-semibold")?.textContent);

test("services are sorted by severity: down, degraded or recent, maintenance, ok", async () => {
  const recent = { ...claude, id: "recent", label: "Recente", items: [{ ...claude.items[0], published_at: Date.now() - 60_000 }] };
  status = () =>
    Promise.resolve([
      { ...aws, id: "ok1", label: "Ok A", live: live("none") },
      { ...aws, id: "mnt", label: "Manutenção X", live: live("maintenance") },
      { ...aws, id: "deg", label: "Instável", live: live("minor") },
      recent,
      { ...aws, id: "dn", label: "Fora", live: live("critical") },
      { ...aws, id: "ok2", label: "Ok B", live: live("none") },
    ]);
  await show();
  expect(sections()).toEqual(["Fora", "Recente", "Instável", "Manutenção X", "Ok A", "Ok B"]);
});

test("a summary bar shows the states in proportion, and the filter chips carry the counts", async () => {
  status = () =>
    Promise.resolve([
      { ...aws, id: "dn", label: "Fora", live: live("major") },
      { ...aws, id: "deg", label: "Instável", live: live("minor") },
      { ...aws, id: "mnt", label: "Obras", live: live("maintenance") },
      { ...aws, id: "a", label: "A", live: live("none") },
      { ...aws, id: "b", label: "B", live: live("none") },
    ]);
  await show();
  expect(screen.getByRole("img", { name: "1 fora do ar, 1 instáveis, 1 em manutenção, 2 operacionais" })).toBeTruthy();
  const chips = screen.getByRole("group", { name: "filtrar serviços por estado" });
  expect(within(chips).getAllByRole("button").map((b) => b.textContent)).toEqual(["Todos5", "Com problema2", "Operacionais2", "Manutenção1"]);
  expect(within(chips).getByRole("button", { name: /Todos/ }).getAttribute("aria-pressed")).toBe("true");
});

test("a filter chip narrows the list and pressing 'Todos' brings it back", async () => {
  status = () =>
    Promise.resolve([
      { ...aws, id: "dn", label: "Fora", live: live("major") },
      { ...aws, id: "mnt", label: "Obras", live: live("maintenance") },
      { ...aws, id: "a", label: "A", live: live("none") },
    ]);
  await show();
  const chip = (name: RegExp) => screen.getByRole("button", { name });
  fireEvent.click(chip(/Com problema/));
  expect(sections()).toEqual(["Fora"]);
  expect(chip(/Com problema/).getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(chip(/Manutenção/));
  expect(sections()).toEqual(["Obras"]);
  fireEvent.click(chip(/Operacionais/));
  expect(sections()).toEqual(["A"]);
  fireEvent.click(chip(/Todos/));
  expect(sections()).toEqual(["Fora", "Obras", "A"]);
});

test("a filter with nothing in it says so", async () => {
  status = () => Promise.resolve([{ ...aws, id: "a", label: "A", live: live("none") }]);
  await show();
  fireEvent.click(screen.getByRole("button", { name: /Manutenção/ }));
  expect(screen.getByText("nenhum serviço neste filtro")).toBeTruthy();
});

test("the bell is its own button: it never opens the incidents, and opening never toggles the alert", async () => {
  const fine = { ...claude, id: "github", label: "GitHub", live: live("none") };
  status = () => Promise.resolve([fine]);
  await show();
  const bell = screen.getByRole("button", { name: "avisar quando GitHub cair ou ficar instável" });
  const expand = screen.getByRole("button", { name: /GitHub/, expanded: false });
  expect(expand.contains(bell)).toBe(false);
  await act(async () => {
    fireEvent.click(bell);
  });
  expect(screen.queryByText(/Elevated latency/)).toBeNull();
  calls.length = 0;
  await act(async () => {
    fireEvent.click(expand);
  });
  expect(screen.getByText(/Elevated latency/)).toBeTruthy();
  expect(calls.some((c) => c.cmd === "status_alerts_set")).toBe(false);
});

test("the refresh and 'atualizado' controls share the row of the sub-tabs, and '+ endereço' replaces them on the other one", async () => {
  await show();
  const tabs = screen.getByRole("tablist", { name: "visão do status" });
  const row = tabs.parentElement as HTMLElement;
  expect(within(row).getByRole("button", { name: "atualizar" })).toBeTruthy();
  expect(within(row).getByText(/atualizado/)).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: "meus endpoints" }));
  });
  expect(within(row).getByRole("button", { name: "+ endereço" })).toBeTruthy();
  expect(within(row).queryByRole("button", { name: "atualizar" })).toBeNull();
});

test("the bell turns notifications on and off for a service with live status", async () => {
  const fine = { ...aws, id: "github", label: "GitHub", live: { indicator: "none", description: "All Systems Operational" } };
  status = () => Promise.resolve([fine, aws]);
  await show();
  const bell = screen.getByRole("button", { name: "avisar quando GitHub cair ou ficar instável" });
  expect(bell.getAttribute("aria-pressed")).toBe("false");
  await act(async () => {
    fireEvent.click(bell);
  });
  expect(calls.find((c) => c.cmd === "status_alerts_set")?.args).toEqual({ ids: ["github"] });
  const on = screen.getByRole("button", { name: "parar de avisar sobre GitHub" });
  expect(on.getAttribute("aria-pressed")).toBe("true");
  await act(async () => {
    fireEvent.click(on);
  });
  expect(calls.filter((c) => c.cmd === "status_alerts_set").at(-1)?.args).toEqual({ ids: [] });
});

test("two fast bell clicks on different services keep both watched", async () => {
  const live = { indicator: "none", description: "ok" };
  const github = { ...aws, id: "github", label: "GitHub", live };
  const slack = { ...aws, id: "slack", label: "Slack", live };
  status = () => Promise.resolve([github, slack]);
  await show();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "avisar quando GitHub cair ou ficar instável" }));
    fireEvent.click(screen.getByRole("button", { name: "avisar quando Slack cair ou ficar instável" }));
  });
  expect(calls.filter((c) => c.cmd === "status_alerts_set").at(-1)?.args).toEqual({ ids: ["github", "slack"] });
  expect(screen.getByRole("button", { name: "parar de avisar sobre GitHub" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("button", { name: "parar de avisar sobre Slack" }).getAttribute("aria-pressed")).toBe("true");
});

test("a service without live status can't be watched", async () => {
  status = () => Promise.resolve([aws]);
  await show();
  const bell = screen.getByRole("button", { name: "AWS não tem status ao vivo: não dá para avisar" }) as HTMLButtonElement;
  expect(bell.disabled).toBe(true);
});

test("watched services come back checked from Rust", async () => {
  watched = ["github"];
  const fine = { ...aws, id: "github", label: "GitHub", live: { indicator: "none", description: "ok" } };
  status = () => Promise.resolve([fine]);
  await show();
  expect(screen.getByRole("button", { name: "parar de avisar sobre GitHub" }).getAttribute("aria-pressed")).toBe("true");
});

test("the sub-tabs switch between the public services and the user's own endpoints", async () => {
  await show();
  expect(screen.getByRole("tab", { name: "serviços" }).getAttribute("aria-selected")).toBe("true");
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: "meus endpoints" }));
  });
  expect(calls.some((c) => c.cmd === "health_list")).toBe(true);
  expect(screen.getByRole("tab", { name: "meus endpoints" }).getAttribute("aria-selected")).toBe("true");
  expect(screen.queryByText("Claude")).toBeNull();
});
