import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { HealthEndpoint, HealthView } from "../lib/healthTypes";

type Call = { cmd: string; args?: Record<string, unknown> };
let calls: Call[] = [];
let views: HealthView[] = [];

const api: HealthEndpoint = {
  id: "a", name: "API principal", kind: "http", url: "https://api.exemplo.dev/health",
  every_secs: 60, limit_ms: 500, alert_down: true, alert_slow: true, alert_cert: false,
};
const sample = (ms: number | null, cert_days: number | null = null) => ({ at: 0, ms, err: ms === null ? "conexão recusada" : null, cert_days });
const view = (endpoint: HealthEndpoint, health: HealthView["health"], samples: ReturnType<typeof sample>[]): HealthView => ({ endpoint, health, samples });

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "health_save") {
      const e = args?.endpoint as HealthEndpoint;
      views = e.id ? views.map((v) => (v.endpoint.id === e.id ? { ...v, endpoint: e } : v)) : [...views, view({ ...e, id: "new" }, "unknown", [])];
      return Promise.resolve(views);
    }
    if (cmd === "health_remove") {
      views = views.filter((v) => v.endpoint.id !== args?.id);
      return Promise.resolve(views);
    }
    if (cmd === "health_list" || cmd === "health_check_now") return Promise.resolve(views);
    return Promise.resolve(null);
  },
}));

const { default: HealthTab } = await import("./HealthTab");

async function mount() {
  render(<HealthTab />);
  for (let i = 0; i < 3; i++) await act(async () => {});
}

beforeEach(() => {
  calls = [];
  views = [
    view(api, "up", [sample(110), sample(130)]),
    view({ ...api, id: "b", name: "Painel", url: "https://admin.exemplo.dev" }, "down", [sample(90), sample(null), sample(null)]),
    view({ ...api, id: "c", name: "exemplo.dev", kind: "dns", url: undefined, host: "exemplo.dev", port: 443, alert_cert: true }, "up", [sample(20, 9)]),
  ];
});
afterEach(cleanup);

test("the grid shows each endpoint's state and the summary counts what needs attention", async () => {
  await mount();
  expect(screen.getByText("API principal")).toBeTruthy();
  expect(screen.getByText("fora do ar")).toBeTruthy();
  expect(screen.getByText("certificado: 9 d")).toBeTruthy();
  expect(screen.getByText("1 fora · 0 lentos · 1 a vencer")).toBeTruthy();
});

test("clicking a tile opens it as a wide item with the chart, and clicking the header closes it", async () => {
  await mount();
  fireEvent.click(screen.getByText("API principal"));
  const open = screen.getByRole("region", { name: "API principal" });
  expect(within(open).getByRole("img", { name: "latência de API principal" })).toBeTruthy();
  expect(within(open).getByText("https://api.exemplo.dev/health")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "recolher API principal" }));
  expect(screen.queryByRole("region", { name: "API principal" })).toBeNull();
});

test("changing the limit or an alert saves the endpoint with the new value", async () => {
  await mount();
  fireEvent.click(screen.getByText("API principal"));
  await act(async () => {
    fireEvent.change(screen.getByLabelText("latência alta acima de"), { target: { value: "800" } });
  });
  expect((calls.find((c) => c.cmd === "health_save")?.args?.endpoint as HealthEndpoint).limit_ms).toBe(800);
  await act(async () => {
    fireEvent.click(screen.getByLabelText("avisar se ficar lento"));
  });
  expect((calls.filter((c) => c.cmd === "health_save").at(-1)?.args?.endpoint as HealthEndpoint).alert_slow).toBe(false);
});

test("the DNS kind asks for host and port and offers the certificate alert", async () => {
  await mount();
  fireEvent.click(screen.getByText("+ adicionar endpoint"));
  const form = screen.getByRole("form", { name: "novo endpoint" });
  fireEvent.click(within(form).getByRole("button", { name: "DNS + certificado" }));
  expect(within(form).getByLabelText("porta")).toBeTruthy();
  expect(within(form).getByLabelText("avisar 14 dias antes do certificado vencer")).toBeTruthy();
  fireEvent.change(within(form).getByLabelText("nome"), { target: { value: "Site" } });
  fireEvent.change(within(form).getByLabelText("host"), { target: { value: "exemplo.dev" } });
  await act(async () => {
    fireEvent.click(within(form).getByRole("button", { name: "adicionar" }));
  });
  const saved = calls.find((c) => c.cmd === "health_save")?.args?.endpoint as HealthEndpoint;
  expect(saved).toMatchObject({ id: "", name: "Site", kind: "dns", host: "exemplo.dev", port: 443, alert_cert: true });
});

test("a bad address stays in the form with the reason and nothing is sent", async () => {
  await mount();
  fireEvent.click(screen.getByText("+ adicionar endpoint"));
  const form = screen.getByRole("form", { name: "novo endpoint" });
  fireEvent.change(within(form).getByLabelText("nome"), { target: { value: "X" } });
  fireEvent.change(within(form).getByLabelText("endereço (http ou https)"), { target: { value: "ftp://x.dev" } });
  fireEvent.click(within(form).getByRole("button", { name: "adicionar" }));
  expect(within(form).getByRole("alert").textContent).toContain("http:// ou https://");
  expect(calls.some((c) => c.cmd === "health_save")).toBe(false);
});

test("TCP takes a port, and removing sends the id", async () => {
  await mount();
  fireEvent.click(screen.getByText("+ adicionar endpoint"));
  const form = screen.getByRole("form", { name: "novo endpoint" });
  fireEvent.click(within(form).getByRole("button", { name: "TCP + porta" }));
  fireEvent.change(within(form).getByLabelText("nome"), { target: { value: "Banco" } });
  fireEvent.change(within(form).getByLabelText("host"), { target: { value: "db.interno" } });
  fireEvent.change(within(form).getByLabelText("porta"), { target: { value: "5432" } });
  await act(async () => {
    fireEvent.click(within(form).getByRole("button", { name: "adicionar" }));
  });
  expect(calls.find((c) => c.cmd === "health_save")?.args?.endpoint).toMatchObject({ kind: "tcp", host: "db.interno", port: 5432 });

  fireEvent.click(screen.getByText("Painel"));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "remover" }));
  });
  expect(calls.find((c) => c.cmd === "health_remove")?.args).toEqual({ id: "b" });
});

test("an empty list explains what to add", async () => {
  views = [];
  await mount();
  expect(screen.getByText(/nenhum endpoint ainda/)).toBeTruthy();
});
