import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

let calls: { cmd: string; args: unknown }[] = [];
let responses: Record<string, (args?: any) => Promise<unknown>> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: unknown) => {
    calls.push({ cmd, args });
    return (responses[cmd] ?? (() => Promise.resolve(null)))(args);
  },
}));

const { default: GithubTab } = await import("./GithubTab");
const { default: GitlabTab } = await import("./GitlabTab");
const { clearForgeCache } = await import("./forgeCache");
const { clearReposCache } = await import("./useRepos");
const { clearReadmes } = await import("./RepoDetail");
const { clearRepoAvatars } = await import("./useRepoAvatars");

const empty = { total: 0, items: [] };
const repo = (full_name: string, group: string, extra = {}) => ({
  id: "",
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
  open_issues: 0,
  language: "",
  updated_at: "2026-11-01T00:00:00Z",
  topics: [],
  avatar_url: "",
  group_avatar_url: "",
  default_branch: "main",
  ...extra,
});
const page = (repos: unknown[], extra = {}) => ({ page: 1, repos, has_next: false, fetched_at: Date.now(), limited_until: null, revalidated: false, ...extra });

function connect() {
  responses.github_status = () => Promise.resolve({ connected: true, login: "octocat", source: "pat", device_flow: true });
  responses.github_lists = () => Promise.resolve({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty });
}

async function settle(n = 5) {
  for (let i = 0; i < n; i++) await act(async () => {});
}

async function openRepos(el = <GithubTab onError={() => {}} />) {
  render(el);
  await settle();
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: "repositórios" }));
  });
  await settle(6);
}

const rowNames = () => screen.queryAllByRole("treeitem").map((r) => r.getAttribute("aria-label"));

beforeEach(() => {
  clearForgeCache();
  clearReposCache();
  clearReadmes();
  clearRepoAvatars();
  localStorage.clear();
  calls = [];
  responses = {};
  connect();
});
afterEach(cleanup);

test("the subtab sits beside mentions and fetches nothing until opened", async () => {
  render(<GithubTab onError={() => {}} />);
  await settle();
  expect(screen.getByRole("tab", { name: "menções" })).toBeTruthy();
  expect(screen.getByRole("tab", { name: "repositórios" })).toBeTruthy();
  expect(calls.some((c) => /repos|readme|contributions/.test(c.cmd))).toBe(false);
});

test("the tree opens on the user's own repositories; organizations expand on demand and show about and topics", async () => {
  responses.github_repos_page = () =>
    Promise.resolve(page([repo("octocat/dotfiles", "", { stars: 4 }), repo("acme/atlas", "acme", { description: "Mapas", topics: ["gis", "frota"], private: true })]));
  await openRepos();
  expect(calls.find((c) => c.cmd === "repos_cached")?.args).toEqual({ forge: "github" });
  expect(calls.find((c) => c.cmd === "github_repos_page")?.args).toEqual({ page: 1, force: false });
  expect(rowNames()).toEqual(["pessoais, 1 repositórios", "octocat/dotfiles", "acme, 1 repositórios"]);
  expect(screen.getByRole("treeitem", { name: "acme, 1 repositórios" }).getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(screen.getByRole("treeitem", { name: "acme, 1 repositórios" }));
  expect(rowNames()).toEqual(["pessoais, 1 repositórios", "octocat/dotfiles", "acme, 1 repositórios", "acme/atlas"]);
  const atlas = screen.getByRole("treeitem", { name: "acme/atlas" });
  expect(within(atlas).getByText("Mapas")).toBeTruthy();
  expect(within(atlas).getByText("gis")).toBeTruthy();
  expect(within(atlas).getByText("privado")).toBeTruthy();
  expect(screen.getByText("2 repositórios · 1 grupos")).toBeTruthy();
  expect(calls.some((c) => c.cmd === "github_contributions")).toBe(false);
});

test("pages arrive one after another until the forge says there is no next", async () => {
  responses.github_repos_page = ({ page: n }: { page: number }) =>
    Promise.resolve(page([repo(`octocat/r${n}`, "")], { page: n, has_next: n < 3 }));
  await openRepos();
  expect(calls.filter((c) => c.cmd === "github_repos_page").map((c) => (c.args as { page: number }).page)).toEqual([1, 2, 3]);
  expect(rowNames()).toEqual(["pessoais, 3 repositórios", "octocat/r1", "octocat/r2", "octocat/r3"]);
});

test("a rate limit stops the walk, keeps the cached pages and says when it lifts", async () => {
  responses.github_repos_page = ({ page: n }: { page: number }) =>
    Promise.resolve(page([repo(`octocat/r${n}`, "")], { page: n, has_next: true, limited_until: n === 2 ? Date.now() + 600_000 : null }));
  await openRepos();
  expect(calls.filter((c) => c.cmd === "github_repos_page").length).toBe(2);
  expect(rowNames()).toContain("octocat/r2");
  expect(screen.getByText(/limite de requisições/i)).toBeTruthy();
});

test("what Rust already holds is painted before the first request answers", async () => {
  responses.repos_cached = () => Promise.resolve([page([repo("octocat/cached", "")])]);
  let release: (v: unknown) => void = () => {};
  responses.github_repos_page = () => new Promise((r) => (release = r));
  await openRepos();
  expect(rowNames()).toContain("octocat/cached");
  await act(async () => release(page([repo("octocat/cached", ""), repo("octocat/novo", "")])));
  await settle();
  expect(rowNames()).toContain("octocat/novo");
});

test("the search covers name, about and topics, opens the groups with hits and a click closes one", async () => {
  responses.github_repos_page = () =>
    Promise.resolve(page([repo("acme/atlas", "acme", { description: "Mapas", topics: ["gis"] }), repo("acme/beta", "acme"), repo("zed/gamma", "zed", { topics: ["gis"] })]));
  await openRepos();
  fireEvent.change(screen.getByLabelText("Filtrar repositórios"), { target: { value: "gis" } });
  await settle();
  expect(rowNames()).toEqual(["acme, 1 repositórios", "acme/atlas", "zed, 1 repositórios", "zed/gamma"]);
  expect(screen.getByText("2 de 3 repositórios")).toBeTruthy();
  fireEvent.click(screen.getByRole("treeitem", { name: "acme, 1 repositórios" }));
  expect(rowNames()).toEqual(["acme, 1 repositórios", "zed, 1 repositórios", "zed/gamma"]);
  fireEvent.change(screen.getByLabelText("Filtrar repositórios"), { target: { value: "zzz" } });
  await settle();
  expect(screen.getByText("nenhum repositório com esse filtro")).toBeTruthy();
});

test("the flat list names each repository with its group and the choice is remembered", async () => {
  responses.github_repos_page = () => Promise.resolve(page([repo("acme/atlas", "acme"), repo("octocat/x", "")]));
  await openRepos();
  fireEvent.click(screen.getByRole("button", { name: "lista" }));
  await settle();
  expect(rowNames().sort()).toEqual(["acme/atlas", "octocat/x"]);
  expect(localStorage.getItem("canto.forge.repos.view")).toBe("flat");
});

test("selecting a repository shows its details; the README is only fetched when asked and then cached", async () => {
  responses.github_repos_page = () => Promise.resolve(page([repo("octocat/dotfiles", "", { description: "Configurações", topics: ["shell"], language: "Shell", open_issues: 3 })]));
  responses.github_readme = () => Promise.resolve({ text: "# Dotfiles\n\nMinha <b>configuração</b>.", truncated: false, fetched_at: 1, limited_until: null });
  await openRepos();
  fireEvent.click(screen.getByRole("treeitem", { name: "octocat/dotfiles" }));
  const detail = screen.getByRole("region", { name: "detalhes do repositório" });
  expect(within(detail).getByText("Configurações")).toBeTruthy();
  expect(within(detail).getByText("shell")).toBeTruthy();
  expect(within(detail).getByText(/3 issues abertas/)).toBeTruthy();
  expect(calls.some((c) => c.cmd === "github_readme")).toBe(false);
  await act(async () => {
    fireEvent.click(within(detail).getByRole("button", { name: "ver README" }));
  });
  await settle();
  expect(calls.find((c) => c.cmd === "github_readme")?.args).toEqual({ fullName: "octocat/dotfiles", force: false });
  await waitFor(() => expect(within(detail).getByText("Dotfiles")).toBeTruthy());
  expect(within(detail).getByText(/Minha configuração\./)).toBeTruthy();
  calls = [];
  fireEvent.click(within(detail).getByRole("button", { name: "ocultar README" }));
  await act(async () => {
    fireEvent.click(within(detail).getByRole("button", { name: "ver README" }));
  });
  expect(calls.some((c) => c.cmd === "github_readme")).toBe(false);
  fireEvent.click(within(detail).getByRole("button", { name: "abrir octocat/dotfiles" }));
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: "https://github.com/octocat/dotfiles" });
  fireEvent.click(within(detail).getByRole("button", { name: "fechar detalhes" }));
  expect(screen.queryByRole("region", { name: "detalhes do repositório" })).toBeNull();
});

test("the arrow keys walk the tree, Right opens a group and Enter shows the details", async () => {
  responses.github_repos_page = () => Promise.resolve(page([repo("octocat/a", ""), repo("acme/atlas", "acme")]));
  await openRepos();
  const tree = screen.getByRole("tree");
  tree.focus();
  fireEvent.keyDown(tree, { key: "ArrowDown" });
  fireEvent.keyDown(tree, { key: "ArrowDown" });
  expect(tree.getAttribute("aria-activedescendant")).toBe("rr-acme");
  fireEvent.keyDown(tree, { key: "ArrowRight" });
  expect(rowNames()).toContain("acme/atlas");
  fireEvent.keyDown(tree, { key: "ArrowDown" });
  fireEvent.keyDown(tree, { key: "Enter" });
  expect(screen.getByRole("region", { name: "detalhes do repositório" })).toBeTruthy();
  fireEvent.keyDown(tree, { key: "ArrowLeft" });
  expect(tree.getAttribute("aria-activedescendant")).toBe("rr-acme");
});

test("a very long list renders only the rows near the viewport", async () => {
  const many = Array.from({ length: 4000 }, (_, i) => repo(`octocat/r${i}`, ""));
  responses.github_repos_page = () => Promise.resolve(page(many));
  await openRepos();
  const rows = screen.getAllByRole("treeitem").length;
  expect(rows).toBeGreaterThan(5);
  expect(rows).toBeLessThan(40);
  expect(screen.getByText("4000 repositórios · 0 grupos")).toBeTruthy();
});

test("the contribution calendar is only fetched after turning the statistics on, and the choice is remembered", async () => {
  responses.github_repos_page = () => Promise.resolve(page([repo("octocat/dotfiles", "", { stars: 4 })]));
  responses.github_contributions = () =>
    Promise.resolve({ days: [{ date: "2026-11-02", count: 3 }, { date: "2026-11-03", count: 0 }], total: 3, fetched_at: Date.now(), limited_until: null });
  await openRepos();
  expect(screen.queryByRole("figure")).toBeNull();
  expect(calls.some((c) => c.cmd === "github_contributions")).toBe(false);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "estatísticas" }));
  });
  await settle(3);
  expect(calls.find((c) => c.cmd === "github_contributions")?.args).toEqual({ force: false });
  expect(screen.getByRole("figure")).toBeTruthy();
  expect(screen.getByText("1 repositórios · 0 grupos · 4 estrelas")).toBeTruthy();
  expect(localStorage.getItem("canto.forge.repos.stats")).toBe("1");
});

test("an error is shown; retry walks the pages again asking Rust to skip its cache", async () => {
  let fail = true;
  responses.github_repos_page = () => (fail ? Promise.reject("o GitHub respondeu 500") : Promise.resolve(page([])));
  await openRepos();
  expect(screen.getByText("o GitHub respondeu 500")).toBeTruthy();
  fail = false;
  calls = [];
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /tentar de novo/i }));
  });
  await settle(3);
  expect(calls.find((c) => c.cmd === "github_repos_page")?.args).toEqual({ page: 1, force: true });
  expect(screen.getByText("nenhum repositório acessível com esta conta")).toBeTruthy();
});

test("GitLab lists its projects through gitlab_repos_page, subgroups nested and the README by project id", async () => {
  responses.gitlab_status = () => Promise.resolve({ connected: true, username: "ana", base_url: "https://gitlab.acme.io" });
  responses.gitlab_lists = () => Promise.resolve({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty });
  responses.gitlab_repos_page = () =>
    Promise.resolve(page([repo("acme/infra/deploy", "acme/infra", { id: "7", url: "https://gitlab.acme.io/acme/infra/deploy", default_branch: "trunk" })]));
  responses.gitlab_readme = () => Promise.resolve({ text: "", truncated: false, fetched_at: 1, limited_until: null });
  await openRepos(<GitlabTab onError={() => {}} />);
  expect(calls.some((c) => c.cmd === "github_repos_page")).toBe(false);
  expect(rowNames()).toEqual(["acme, 1 repositórios"]);
  fireEvent.click(screen.getByRole("treeitem", { name: "acme, 1 repositórios" }));
  fireEvent.click(screen.getByRole("treeitem", { name: "infra, 1 repositórios" }));
  fireEvent.click(screen.getByRole("treeitem", { name: "acme/infra/deploy" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "ver README" }));
  });
  await settle();
  expect(calls.find((c) => c.cmd === "gitlab_readme")?.args).toEqual({ id: "7", branch: "trunk", force: false });
  expect(screen.getByText("este repositório não tem README")).toBeTruthy();
});
