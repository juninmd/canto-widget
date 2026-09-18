import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let calls: { cmd: string; args: unknown }[] = [];
let responses: Record<string, () => Promise<unknown>> = {};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: unknown) => {
    calls.push({ cmd, args });
    return (responses[cmd] ?? (() => Promise.resolve(null)))();
  },
}));

const { default: GithubTab } = await import("./GithubTab");

const empty = { total: 0, items: [] };
const item = {
  repo: "octo/canto",
  number: 42,
  title: "Revisar o cofre",
  url: "https://github.com/octo/canto/pull/42",
  updated_at: new Date().toISOString(),
  is_pr: true,
  draft: true,
  author: "octocat",
};

async function mount() {
  render(<GithubTab onError={() => {}} />);
  for (let i = 0; i < 5; i++) await act(async () => {});
}

beforeEach(() => {
  calls = [];
  responses = {};
});
afterEach(cleanup);

test("no account shows the token field and hides the device flow when the build has no GitHub App", async () => {
  responses.github_status = () => Promise.resolve({ connected: false, login: "", source: "", device_flow: false });
  await mount();
  expect(screen.getByLabelText("Token pessoal do GitHub")).toBeTruthy();
  expect(screen.queryByText("entrar com o GitHub")).toBeNull();
  expect(calls.some((c) => c.cmd === "github_lists")).toBe(false);
});

test("saving the token sends it to Rust and starts listing", async () => {
  let connected = false;
  responses.github_status = () => Promise.resolve({ connected, login: "octocat", source: "pat", device_flow: true });
  responses.github_save_token = () => {
    connected = true;
    return Promise.resolve("octocat");
  };
  responses.github_lists = () => Promise.resolve({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty });
  await mount();
  fireEvent.change(screen.getByPlaceholderText("github_pat_..."), { target: { value: "github_pat_abc" } });
  await act(async () => {
    fireEvent.click(screen.getByText("salvar token"));
  });
  for (let i = 0; i < 5; i++) await act(async () => {});
  expect(calls.find((c) => c.cmd === "github_save_token")?.args).toEqual({ token: "github_pat_abc" });
  expect(screen.getByText("@octocat")).toBeTruthy();
});

test("connected shows all four lists with totals and opens the item in the browser", async () => {
  responses.github_status = () => Promise.resolve({ connected: true, login: "octocat", source: "app", device_flow: true });
  responses.github_lists = () =>
    Promise.resolve({ assigned: empty, my_prs: empty, review_requested: { total: 3, items: [item] }, my_issues: empty });
  await mount();
  for (const t of ["Revisão pedida a mim", "Atribuídos a mim", "PRs que eu abri", "Issues que eu abri"]) {
    expect(screen.getByRole("region", { name: t })).toBeTruthy();
  }
  expect(screen.getByText("(3)")).toBeTruthy();
  expect(screen.getByText("octo/canto#42")).toBeTruthy();
  expect(screen.getByText("rascunho")).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByText("Revisar o cofre"));
  });
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: item.url });
});

test("expired token shows as an error in the tab, without breaking the rest", async () => {
  responses.github_status = () => Promise.resolve({ connected: true, login: "octocat", source: "pat", device_flow: false });
  responses.github_lists = () => Promise.reject("github: token expirado ou revogado; conecte de novo");
  await mount();
  expect(screen.getByRole("alert").textContent).toContain("token expirado");
  expect(screen.getByText("desconectar")).toBeTruthy();
});

test("the card names who opened it only when it isn't me, and marks PR vs issue", async () => {
  responses.github_status = () => Promise.resolve({ connected: true, login: "octocat", source: "pat", device_flow: false });
  const theirs = { ...item, url: "https://github.com/octo/canto/issues/7", number: 7, is_pr: false, draft: false, author: "hubot" };
  responses.github_lists = () =>
    Promise.resolve({ assigned: { total: 2, items: [item, theirs] }, my_prs: empty, review_requested: empty, my_issues: empty });
  await mount();
  expect(screen.getByText("@hubot")).toBeTruthy();
  expect(screen.getAllByText("@octocat")).toHaveLength(1);
  expect(screen.getByRole("img", { name: "PR rascunho" })).toBeTruthy();
  expect(screen.getByRole("img", { name: "issue" })).toBeTruthy();
});
