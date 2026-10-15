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

const { default: GitlabTab } = await import("./GitlabTab");
const { clearForgeCache } = await import("../lib/forgeCache");

const empty = { total: 0, items: [] };
const mr = {
  repo: "acme/api",
  number: 12,
  reference: "acme/api!12",
  title: "Limitar requisições",
  url: "https://gitlab.acme.io/acme/api/-/merge_requests/12",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  comments: 2,
  is_pr: true,
  draft: false,
  author: "bia",
};

async function mount() {
  render(<GitlabTab onError={() => {}} />);
  for (let i = 0; i < 5; i++) await act(async () => {});
}

beforeEach(() => {
  clearForgeCache();
  calls = [];
  responses = {};
});
afterEach(cleanup);

test("connecting sends the instance address and token to Rust, then lists", async () => {
  let connected = false;
  responses.gitlab_status = () =>
    Promise.resolve(connected ? { connected, username: "ana", base_url: "https://gitlab.acme.io" } : { connected, username: "", base_url: "" });
  responses.gitlab_connect = () => {
    connected = true;
    return Promise.resolve("ana");
  };
  responses.gitlab_lists = () => Promise.resolve({ assigned: empty, my_prs: { total: 1, items: [mr] }, review_requested: empty, my_issues: empty });
  await mount();
  fireEvent.change(screen.getByLabelText("Endereço do GitLab"), { target: { value: "https://gitlab.acme.io" } });
  fireEvent.change(screen.getByLabelText("Token de acesso pessoal"), { target: { value: "glpat-abc" } });
  await act(async () => {
    fireEvent.click(screen.getByText("conectar"));
  });
  for (let i = 0; i < 5; i++) await act(async () => {});
  expect(calls.find((c) => c.cmd === "gitlab_connect")?.args).toEqual({ baseUrl: "https://gitlab.acme.io", token: "glpat-abc" });
  expect(screen.getByRole("region", { name: "MRs que eu abri" })).toBeTruthy();
  expect(screen.getByText("acme/api!12")).toBeTruthy();
  expect(screen.getByText(/gitlab\.acme\.io/)).toBeTruthy();
});

test("a rejected token stays on the form with the reason", async () => {
  responses.gitlab_status = () => Promise.resolve({ connected: false, username: "", base_url: "" });
  responses.gitlab_connect = () => Promise.reject("gitlab: o token nao tem acesso; ele precisa do escopo read_api");
  await mount();
  fireEvent.change(screen.getByLabelText("Token de acesso pessoal"), { target: { value: "glpat-abc" } });
  await act(async () => {
    fireEvent.click(screen.getByText("conectar"));
  });
  expect(screen.getByRole("alert").textContent).toContain("read_api");
  expect(calls.some((c) => c.cmd === "gitlab_lists")).toBe(false);
});

test("ver CI asks the vault for the MR's pipeline status by project and iid", async () => {
  responses.gitlab_status = () => Promise.resolve({ connected: true, username: "ana", base_url: "https://gitlab.acme.io" });
  responses.gitlab_lists = () => Promise.resolve({ assigned: empty, my_prs: { total: 1, items: [mr] }, review_requested: empty, my_issues: empty });
  responses.gitlab_mr_checks = () => Promise.resolve("failure");
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByText("ver CI"));
  });
  expect(calls.find((c) => c.cmd === "gitlab_mr_checks")?.args).toEqual({ project: mr.repo, iid: mr.number });
  expect(screen.getByText("✗ CI falhou")).toBeTruthy();
});

test("GitLab doesn't offer sorting by comments, which its API can't do", async () => {
  responses.gitlab_status = () => Promise.resolve({ connected: true, username: "ana", base_url: "https://gitlab.com" });
  responses.gitlab_lists = () => Promise.resolve({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty });
  await mount();
  const options = [...(screen.getByLabelText("ordenar por") as HTMLSelectElement).options].map((o) => o.value);
  expect(options).toEqual(["updated", "created"]);
  expect(screen.getByRole("button", { name: "MRs" })).toBeTruthy();
});

test("shows the summary strip without a CI tile", async () => {
  responses.gitlab_status = () => Promise.resolve({ connected: true, username: "bia", base_url: "https://gitlab.acme.io" });
  responses.gitlab_lists = () =>
    Promise.resolve({ review_requested: { total: 2, items: [mr] }, assigned: empty, my_prs: empty, my_issues: empty });
  await mount();
  expect(screen.getByText("revisões")).toBeDefined();
  expect(screen.queryByText("CI falhou")).toBeNull();
});

test("a failed status check is an alert with a retry; the lists cached for GitLab come back at once, apart from GitHub's", async () => {
  responses.gitlab_status = () => Promise.reject("instância fora do ar");
  const first = render(<GitlabTab onError={() => {}} />);
  for (let i = 0; i < 5; i++) await act(async () => {});
  expect(screen.getByRole("alert").textContent).toContain("instância fora do ar");
  responses.gitlab_status = () => Promise.resolve({ connected: true, username: "ana", base_url: "https://gitlab.acme.io" });
  responses.gitlab_lists = () => Promise.resolve({ assigned: empty, my_prs: { total: 1, items: [mr] }, review_requested: empty, my_issues: empty });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  });
  for (let i = 0; i < 5; i++) await act(async () => {});
  expect(screen.getByText("acme/api!12")).toBeTruthy();
  first.unmount();

  responses.gitlab_status = () => new Promise(() => {});
  responses.gitlab_lists = () => new Promise(() => {});
  await mount();
  expect(screen.getByText("acme/api!12")).toBeTruthy();
  expect(screen.getByLabelText("Filtrar issues e PRs").getAttribute("data-shortcut")).toBe("search");
});

test("the GitLab mentions subtab lists the pending to-dos with their author and text", async () => {
  responses.gitlab_status = () => Promise.resolve({ connected: true, username: "ana", base_url: "https://gitlab.acme.io" });
  responses.gitlab_lists = () => Promise.resolve({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty });
  responses.gitlab_mentions = () =>
    Promise.resolve({
      rows: [
      {
        id: "gitlab:5",
        title: "Falha no deploy",
        reference: "acme/atlas",
        url: "https://gitlab.acme.io/acme/atlas/-/merge_requests/5",
        is_pr: true,
        at: new Date().toISOString(),
        sender: { name: "Bia Lima", login: "bia", avatar: "" },
        preview: "@ana pode revisar antes da release?",
        unread: true,
        muted: false,
        done: false,
      },
      ],
      fetched_at: 0,
      limited_until: null,
      unread: 1,
    });
  await mount();
  expect(screen.getByRole("tab", { name: "MRs e issues" })).toBeTruthy();
  expect(calls.some((c) => c.cmd === "gitlab_mentions")).toBe(false);
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: "menções" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(calls.find((c) => c.cmd === "gitlab_mentions")?.args).toEqual({ includeDone: false });
  expect(screen.getByText("Bia Lima")).toBeTruthy();
  expect(screen.getByText("@bia")).toBeTruthy();
  expect(screen.getByText("@ana pode revisar antes da release?")).toBeTruthy();
  expect(screen.getByText("acme/atlas")).toBeTruthy();
  expect(screen.getByText("BL", { exact: false })).toBeTruthy();
});

test("'incluir concluídas' asks Rust for the done to-dos too and tags them", async () => {
  responses.gitlab_status = () => Promise.resolve({ connected: true, username: "ana", base_url: "https://gitlab.acme.io" });
  responses.gitlab_lists = () => Promise.resolve({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty });
  const row = (id: string, done: boolean) => ({
    id: `gitlab:${id}`,
    title: done ? "Já resolvido" : "Pendente",
    reference: "acme/atlas",
    url: `https://gitlab.acme.io/acme/atlas/-/issues/${id}`,
    is_pr: false,
    at: new Date().toISOString(),
    sender: { name: "Bia Lima", login: "bia", avatar: "" },
    preview: "@ana olha",
    unread: !done,
    muted: false,
    done,
  });
  responses.gitlab_mentions = () => Promise.resolve({ rows: calls.some((c) => (c.args as { includeDone?: boolean } | undefined)?.includeDone) ? [row("1", false), row("2", true)] : [row("1", false)], fetched_at: 0, limited_until: null, unread: 1 });
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: /menções/ }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(screen.queryByText("Já resolvido")).toBeNull();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "incluir concluídas" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(calls.filter((c) => c.cmd === "gitlab_mentions").at(-1)?.args).toEqual({ includeDone: true });
  expect(screen.getByText("Já resolvido")).toBeTruthy();
  expect(screen.getByText("concluída")).toBeTruthy();
  const doneRow = screen.getByText("Já resolvido").closest("li") as HTMLElement;
  expect(within(doneRow).queryByRole("button", { name: /marcar como/ }), "a done to-do has nothing to mark").toBeNull();
});
