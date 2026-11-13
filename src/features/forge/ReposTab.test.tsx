import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

let calls: { cmd: string; args: unknown }[] = [];
let responses: Record<string, () => Promise<unknown>> = {};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: unknown) => {
    calls.push({ cmd, args });
    return (responses[cmd] ?? (() => Promise.resolve(null)))();
  },
}));

const { default: GithubTab } = await import("./GithubTab");
const { default: GitlabTab } = await import("./GitlabTab");
const { clearForgeCache } = await import("./forgeCache");
const { clearReposCache } = await import("./useRepos");

const empty = { total: 0, items: [] };
const repo = (full_name: string, group: string, extra = {}) => ({
  name: full_name.split("/").pop(),
  full_name,
  group,
  description: "",
  url: `https://github.com/${full_name}`,
  private: false,
  fork: false,
  archived: false,
  stars: 0,
  forks: 0,
  language: "",
  updated_at: new Date().toISOString(),
  ...extra,
});
const list = (repos: unknown[], extra = {}) => ({ repos, truncated: false, fetched_at: Date.now(), limited_until: null, ...extra });

function connect() {
  responses.github_status = () => Promise.resolve({ connected: true, login: "octocat", source: "pat", device_flow: true });
  responses.github_lists = () => Promise.resolve({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty });
}

async function openRepos(el = <GithubTab onError={() => {}} />) {
  render(el);
  for (let i = 0; i < 5; i++) await act(async () => {});
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: "repositórios" }));
  });
  for (let i = 0; i < 4; i++) await act(async () => {});
}

beforeEach(() => {
  clearForgeCache();
  clearReposCache();
  localStorage.clear();
  calls = [];
  responses = {};
  connect();
});
afterEach(cleanup);

test("the subtab sits beside mentions and fetches nothing until opened", async () => {
  render(<GithubTab onError={() => {}} />);
  for (let i = 0; i < 5; i++) await act(async () => {});
  expect(screen.getByRole("tab", { name: "menções" })).toBeTruthy();
  expect(screen.getByRole("tab", { name: "repositórios" })).toBeTruthy();
  expect(calls.some((c) => c.cmd === "github_repos" || c.cmd === "github_contributions")).toBe(false);
});

test("repositories are grouped: the user's own first, then each organization", async () => {
  responses.github_repos = () =>
    Promise.resolve(list([repo("octocat/dotfiles", "", { stars: 4 }), repo("acme/atlas", "acme", { description: "Mapas", language: "Rust", private: true })]));
  await openRepos();
  expect(calls.find((c) => c.cmd === "github_repos")?.args).toEqual({ force: false });
  expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["▸pessoais1", "▸acme1"]);
  const acme = screen.getByRole("region", { name: "acme" });
  expect(within(acme).getByText("privado")).toBeTruthy();
  expect(within(acme).getByText("Mapas")).toBeTruthy();
  expect(calls.some((c) => c.cmd === "github_contributions")).toBe(false);
});

test("list, cards and grid change the layout and the choice is remembered; a click opens the repo", async () => {
  responses.github_repos = () => Promise.resolve(list([repo("acme/atlas", "acme", { description: "Mapas" })]));
  await openRepos();
  expect(screen.getByText("Mapas")).toBeTruthy(); // cards by default
  fireEvent.click(screen.getByRole("button", { name: "grade" }));
  expect(screen.queryByText("Mapas")).toBeNull();
  expect(localStorage.getItem("canto.forge.repos.view")).toBe("grid");
  fireEvent.click(screen.getByRole("button", { name: "lista" }));
  expect(localStorage.getItem("canto.forge.repos.view")).toBe("list");
  calls = [];
  fireEvent.click(screen.getByRole("button", { name: "abrir acme/atlas" }));
  expect(calls[0]).toEqual({ cmd: "open_link", args: { url: "https://github.com/acme/atlas" } });
});

test("a group collapses and the filter narrows the list", async () => {
  responses.github_repos = () => Promise.resolve(list([repo("acme/atlas", "acme"), repo("acme/beta", "acme")]));
  await openRepos();
  fireEvent.change(screen.getByLabelText("Filtrar repositórios"), { target: { value: "atl" } });
  expect(screen.queryByText("beta")).toBeNull();
  fireEvent.change(screen.getByLabelText("Filtrar repositórios"), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "acme 2" }));
  expect(screen.queryByText("atlas")).toBeNull();
  fireEvent.change(screen.getByLabelText("Filtrar repositórios"), { target: { value: "zzz" } });
  expect(screen.getByText("nenhum repositório com esse filtro")).toBeTruthy();
});

test("the contribution calendar is only fetched after turning the statistics on, and the choice is remembered", async () => {
  responses.github_repos = () => Promise.resolve(list([repo("octocat/dotfiles", "", { stars: 4 })]));
  responses.github_contributions = () =>
    Promise.resolve({ days: [{ date: "2026-11-02", count: 3 }, { date: "2026-11-03", count: 0 }], total: 3, fetched_at: Date.now(), limited_until: null });
  await openRepos();
  expect(screen.queryByRole("figure")).toBeNull();
  expect(calls.some((c) => c.cmd === "github_contributions")).toBe(false);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "estatísticas" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(calls.find((c) => c.cmd === "github_contributions")?.args).toEqual({ force: false });
  expect(screen.getByRole("figure")).toBeTruthy();
  expect(screen.getByText("1 repositórios · 0 grupos · 4 estrelas")).toBeTruthy();
  expect(localStorage.getItem("canto.forge.repos.stats")).toBe("1");
});

test("loading, empty and error states are shown; retry asks Rust to skip its cache", async () => {
  let fail = true;
  responses.github_repos = () => (fail ? Promise.reject("o GitHub respondeu 500") : Promise.resolve(list([])));
  await openRepos();
  expect(screen.getByText("o GitHub respondeu 500")).toBeTruthy();
  fail = false;
  calls = [];
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /tentar de novo/i }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(calls.find((c) => c.cmd === "github_repos")?.args).toEqual({ force: true });
  expect(screen.getByText("nenhum repositório acessível com esta conta")).toBeTruthy();
});

test("GitLab lists its own projects through gitlab_repos", async () => {
  responses.gitlab_status = () => Promise.resolve({ connected: true, username: "ana", base_url: "https://gitlab.acme.io" });
  responses.gitlab_lists = () => Promise.resolve({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty });
  responses.gitlab_repos = () => Promise.resolve(list([repo("acme/infra/deploy", "acme/infra", { url: "https://gitlab.acme.io/acme/infra/deploy" })]));
  await openRepos(<GitlabTab onError={() => {}} />);
  expect(calls.some((c) => c.cmd === "github_repos")).toBe(false);
  expect(screen.getByRole("region", { name: "acme/infra" })).toBeTruthy();
});
