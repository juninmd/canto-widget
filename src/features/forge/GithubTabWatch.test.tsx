import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let responses: Record<string, () => Promise<unknown>> = {};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => (responses[cmd] ?? (() => Promise.resolve(null)))(),
}));

const { default: GithubTab } = await import("./GithubTab");
const { ToastProvider } = await import("../../lib/toast");
const { clearForgeCache } = await import("./forgeCache");

const empty = { total: 0, items: [] };
const pr = {
  repo: "octo/canto",
  number: 42,
  reference: "octo/canto#42",
  title: "Revisar o cofre",
  url: "https://github.com/octo/canto/pull/42",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  comments: 0,
  is_pr: true,
  draft: false,
  author: "voce",
};

async function mount(status: "running" | "success" | "failure") {
  responses.github_status = () => Promise.resolve({ connected: true, login: "voce", source: "pat", device_flow: true });
  responses.github_lists = () => Promise.resolve({ others_prs: empty, assigned: empty, review_requested: empty, my_issues: empty, my_prs: { total: 1, items: [pr] } });
  responses.github_prs_checks = () => Promise.resolve([{ repo: pr.repo, number: pr.number, status }]);
  render(
    <ToastProvider>
      <GithubTab onError={() => {}} />
    </ToastProvider>,
  );
  for (let i = 0; i < 6; i++) await act(async () => {});
}

beforeEach(() => {
  clearForgeCache();
  localStorage.clear();
  responses = {};
});
afterEach(cleanup);

test("a PR whose CI is running can be watched, and the choice is remembered", async () => {
  await mount("running");
  fireEvent.click(screen.getByRole("button", { name: "avisar quando o CI de Revisar o cofre terminar" }));
  expect(JSON.parse(localStorage.getItem("canto.ciWatch") ?? "{}")).toEqual({ "octo/canto#42": "Revisar o cofre" });
  expect(screen.getByRole("button", { name: "parar de avisar sobre o CI de Revisar o cofre" }).getAttribute("aria-pressed")).toBe("true");
});

test("a PR with a finished CI has no watch button", async () => {
  await mount("success");
  expect(screen.queryByRole("button", { name: /avisar quando o CI/ })).toBeNull();
});

test("when the CI of a watched PR ends, a toast says how and the watch is over", async () => {
  localStorage.setItem("canto.ciWatch", JSON.stringify({ "octo/canto#42": "Revisar o cofre" }));
  await mount("success");
  expect(screen.getByRole("status").textContent).toContain("CI passou: Revisar o cofre");
  expect(localStorage.getItem("canto.ciWatch")).toBe("{}");
});

test("a failed CI of a watched PR is an error toast", async () => {
  localStorage.setItem("canto.ciWatch", JSON.stringify({ "octo/canto#42": "Revisar o cofre" }));
  await mount("failure");
  expect(screen.getByRole("alert").textContent).toContain("CI falhou: Revisar o cofre");
});
