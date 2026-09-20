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

const { default: GitlabTab } = await import("./GitlabTab");

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
