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
  reference: "octo/canto#42",
  title: "Revisar o cofre",
  url: "https://github.com/octo/canto/pull/42",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  comments: 0,
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

const connected = () => Promise.resolve({ connected: true, login: "octocat", source: "pat", device_flow: false });
const lists = (over = {}) => ({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty, ...over });

test("while GitHub answers, the tab shows a busy skeleton instead of a blank area", async () => {
  responses.github_status = connected;
  responses.github_lists = () => new Promise(() => {});
  await mount();
  expect(screen.getByRole("status", { name: "carregando issues e PRs" }).getAttribute("aria-busy")).toBe("true");
});

test("show more fetches the next page of that section only and skips repeats", async () => {
  responses.github_status = connected;
  responses.github_lists = () => Promise.resolve(lists({ my_prs: { total: 3, items: [item] } }));
  const next = { ...item, url: "https://github.com/octo/canto/pull/43", number: 43, title: "Segundo PR" };
  responses.github_section = () => Promise.resolve({ total: 3, items: [item, next] });
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByText("mostrar mais (2 restantes)"));
  });
  expect(calls.find((c) => c.cmd === "github_section")?.args).toEqual({
    section: "my_prs",
    page: 2,
    filter: { text: "", kind: "all", sort: "updated", order: "desc" },
  });
  expect(screen.getAllByText("Revisar o cofre")).toHaveLength(1);
  expect(screen.getByText("Segundo PR")).toBeTruthy();
  expect(screen.getByText("mostrar mais (1 restantes)")).toBeTruthy();
});

test("the filter goes to the search and the issues chip hides PR-only sections", async () => {
  responses.github_status = connected;
  responses.github_lists = () => Promise.resolve(lists());
  await mount();
  fireEvent.change(screen.getByLabelText("Filtrar issues e PRs"), { target: { value: " repo:acme/atlas " } });
  await act(async () => {
    fireEvent.click(screen.getByText("issues"));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(calls.filter((c) => c.cmd === "github_lists").at(-1)?.args).toEqual({
    filter: { text: "repo:acme/atlas", kind: "issue", sort: "updated", order: "desc" },
    force: false,
  });
  expect(screen.queryByRole("region", { name: "Revisão pedida a mim" })).toBeNull();
  expect(screen.getByRole("region", { name: "Issues que eu abri" })).toBeTruthy();
  expect(screen.getAllByText("nada com esse filtro").length).toBeGreaterThan(0);
});

test("sort and order go to the search, so 500 issues come back in the order asked", async () => {
  responses.github_status = connected;
  responses.github_lists = () => Promise.resolve(lists());
  await mount();
  await act(async () => {
    fireEvent.change(screen.getByLabelText("ordenar por"), { target: { value: "comments" } });
  });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /ordem decrescente/ }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  const last = calls.filter((c) => c.cmd === "github_lists").at(-1)?.args as { filter: { sort: string; order: string } };
  expect([last.filter.sort, last.filter.order]).toEqual(["comments", "asc"]);
});

test("opening the tab uses the cache; only atualizar forces a trip to GitHub", async () => {
  responses.github_status = connected;
  responses.github_lists = () => Promise.resolve(lists());
  await mount();
  expect((calls.find((c) => c.cmd === "github_lists")?.args as { force: boolean }).force).toBe(false);
  await act(async () => {
    fireEvent.click(screen.getByText("atualizar"));
  });
  expect((calls.filter((c) => c.cmd === "github_lists").at(-1)?.args as { force: boolean }).force).toBe(true);
});

test("near the rate limit the tab says it shows the last copy and when fresh data comes", async () => {
  responses.github_status = connected;
  const at = new Date(2026, 8, 18, 14, 32).getTime();
  responses.github_lists = () => Promise.resolve(lists({ my_prs: { total: 1, items: [item], fetched_at: at - 600_000, limited_until: at } }));
  await mount();
  expect(screen.getByRole("status").textContent).toContain("14:32");
  expect(screen.getByText(/atualizado há/)).toBeTruthy();
});

test("a slow answer for an old filter never replaces the current list", async () => {
  responses.github_status = connected;
  let releaseOld: (v: unknown) => void = () => {};
  responses.github_lists = () => new Promise((r) => (releaseOld = r));
  await mount();
  responses.github_lists = () => Promise.resolve(lists({ my_issues: { total: 1, items: [{ ...item, title: "Atual" }] } }));
  await act(async () => {
    fireEvent.click(screen.getByText("issues"));
  });
  await act(async () => releaseOld(lists({ my_issues: { total: 1, items: [{ ...item, title: "Velho" }] } })));
  expect(screen.getByText("Atual")).toBeTruthy();
  expect(screen.queryByText("Velho")).toBeNull();
});

test("a failed filter change keeps the previous filter as the applied one", async () => {
  responses.github_status = connected;
  responses.github_lists = () => Promise.resolve(lists({ my_prs: { total: 3, items: [item] } }));
  await mount();
  responses.github_lists = () => Promise.reject("github: limite de requisicoes atingido");
  await act(async () => {
    fireEvent.click(screen.getByText("issues"));
  });
  expect(screen.getByRole("alert").textContent).toContain("limite");
  expect(screen.getByRole("button", { name: "tudo" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByRole("button", { name: "issues" }).getAttribute("aria-pressed")).toBe("false");
  expect(screen.getByText("Revisar o cofre")).toBeTruthy();
});
