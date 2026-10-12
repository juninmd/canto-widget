import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { AgendaItem, ResolvedAlert } from "../lib/api";

const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
let failing = new Set<string>();
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "alert_close" && failing.has(String(args?.id))) return Promise.reject("falha do Rust");
    return Promise.resolve(null);
  },
}));
const { default: NotificationsColumn } = await import("./NotificationsColumn");

afterEach(() => {
  cleanup();
  calls.length = 0;
  failing = new Set();
});

const base = { start: "", end: "", all_day: false, location: "", meet: "", link: "" };
const daily: AgendaItem = { ...base, id: "e1", title: "Daily do time", start: new Date(Date.now() + 120_000).toISOString(), meet: "https://meet.example.com/a" };
const ci: AgendaItem = { ...base, id: "pr:acme/atlas#4", title: "PR #4 falhou", tag: "ci", link: "https://github.com/acme/atlas/pull/4" };

const handlers = () => {
  const gone: string[] = [];
  let refreshed = 0;
  return { gone, refreshed: () => refreshed, props: { onGone: (id: string) => gone.push(id), onRefresh: () => refreshed++, onCompleted: () => {}, onOpenModels: () => {} } };
};

test("each pending alert is a card with the pop-up's actions, under a count", () => {
  const h = handlers();
  render(<NotificationsColumn alerts={[ci, daily]} log={[]} {...h.props} />);
  const column = screen.getByRole("complementary", { name: "notificações" });
  expect(within(column).getByText("2")).toBeDefined();
  const list = within(column).getByRole("list", { name: "avisos pendentes" });
  expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  expect(within(list).getByRole("button", { name: "abrir PR" })).toBeDefined();
  expect(within(list).getByRole("button", { name: "entrar no Meet" })).toBeDefined();
});

test("nothing pending says so and offers no dismiss-all", () => {
  render(<NotificationsColumn alerts={[]} log={[]} {...handlers().props} />);
  expect(screen.getByText("nenhum aviso pendente")).toBeDefined();
  expect(screen.getByText("tudo em dia")).toBeDefined();
  expect(screen.queryByRole("button", { name: "dispensar todas" })).toBeNull();
});

test("closing a card releases it in Rust and asks for the log again once Rust answered", async () => {
  const h = handlers();
  render(<NotificationsColumn alerts={[daily]} log={[]} {...h.props} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "fechar" }));
  });
  expect(calls).toContainEqual({ cmd: "alert_close", args: { id: "e1" } });
  expect(h.gone).toEqual(["e1"]);
  expect(h.refreshed()).toBe(1);
});

test("dismiss all closes every pending alert", async () => {
  const h = handlers();
  render(<NotificationsColumn alerts={[ci, daily]} log={[]} {...h.props} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "dispensar todas" }));
  });
  expect(calls.filter((c) => c.cmd === "alert_close").map((c) => c.args?.id)).toEqual(["pr:acme/atlas#4", "e1"]);
  expect(h.gone).toEqual(["pr:acme/atlas#4", "e1"]);
  expect(h.refreshed(), "one reread after all the closes, not one per alert").toBe(1);
});

test("dismiss all keeps the alerts that failed to close and offers a retry", async () => {
  failing = new Set(["e1"]);
  const h = handlers();
  render(<NotificationsColumn alerts={[ci, daily]} log={[]} {...h.props} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "dispensar todas" }));
  });
  expect(h.gone).toEqual(["pr:acme/atlas#4"]);
  expect(screen.getByRole("alert").textContent).toContain("Não foi possível dispensar 1 aviso(s).");
  failing = new Set();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  });
  expect(h.gone).toContain("e1");
});

test("a card that fails to close stays, says why and can try again", async () => {
  failing = new Set(["e1"]);
  const h = handlers();
  render(<NotificationsColumn alerts={[daily]} log={[]} {...h.props} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "fechar" }));
  });
  expect(h.gone, "the alert vanished although Rust still holds it").toEqual([]);
  expect(screen.getByRole("alert").textContent).toContain("Não foi possível fechar o aviso. falha do Rust");
  expect(h.refreshed()).toBe(1);
  failing = new Set();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  });
  expect(h.gone).toEqual(["e1"]);
});

test("more than eight resolved alerts are capped, with a button to see the rest", () => {
  const now = Date.now();
  const log: ResolvedAlert[] = Array.from({ length: 11 }, (_, i) => ({
    item: { ...daily, id: `e${i}`, title: `Reunião ${i}` },
    outcome: "closed",
    at: now - i * 1000,
  }));
  render(<NotificationsColumn alerts={[]} log={log} {...handlers().props} />);
  const list = () => within(screen.getByRole("complementary")).getAllByRole("listitem");
  expect(list()).toHaveLength(8);
  fireEvent.click(screen.getByRole("button", { name: "ver mais (3)" }));
  expect(list()).toHaveLength(11);
  fireEvent.click(screen.getByRole("button", { name: "ver menos" }));
  expect(list()).toHaveLength(8);
});

test("resolved alerts show what was done, only from today", () => {
  const now = new Date();
  const earlier = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 1).getTime();
  const log: ResolvedAlert[] = [
    { item: daily, outcome: "done", at: Math.max(earlier, now.getTime() - 60_000) },
    { item: ci, outcome: "snoozed", at: Math.max(earlier, now.getTime() - 120_000) },
    { item: { ...daily, id: "old", title: "Reunião de ontem" }, outcome: "closed", at: now.getTime() - 2 * 86_400_000 },
  ];
  render(<NotificationsColumn alerts={[]} log={log} {...handlers().props} />);
  expect(screen.getByText("entrou no Meet")).toBeDefined();
  expect(screen.getByText("adiado")).toBeDefined();
  expect(screen.queryByText("Reunião de ontem")).toBeNull();
});

test("with nothing resolved yet it says so", () => {
  render(<NotificationsColumn alerts={[daily]} log={[]} {...handlers().props} />);
  expect(screen.getByText("nada resolvido ainda hoje")).toBeDefined();
});
