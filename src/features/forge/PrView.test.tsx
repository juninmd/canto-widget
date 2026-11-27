import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

let calls: { cmd: string; args: Record<string, unknown> }[] = [];
let responses: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown>) => {
    calls.push({ cmd, args });
    return (responses[cmd] ?? (() => Promise.resolve(null)))(args);
  },
}));

const { default: PrView } = await import("./PrView");

const item = {
  repo: "acme/atlas", number: 7, reference: "acme/atlas#7", title: "Corrige o cálculo de rotas", url: "https://github.com/acme/atlas/pull/7",
  created_at: "2026-11-01T00:00:00Z", updated_at: "2026-11-01T00:00:00Z", comments: 1, is_pr: true, draft: false, author: "ana",
};
const detail = {
  body: "Fecha o watcher quando a sessão termina.", head_branch: "fix/rotas", base_branch: "main", changed_files: 2,
  jobs: [
    { name: "build", state: "success", url: "https://github.com/acme/atlas/actions/runs/1", stage: "", seconds: 0, label: "" },
    { name: "deploy", state: "none", url: "", stage: "", seconds: 0, label: "manual" },
  ],
  reviewers: [{ login: "bia", state: "approved" }, { login: "caio", state: "pending" }],
};
const thread = { id: 1, author: "bia", bot: false, body: "E se vier vazio?", created_at: "2026-11-01T10:00:00Z", url: "https://github.com/acme/atlas/pull/7#r1", path: "src/rotas.ts", line: 2, hunk: "", reply: false, thread: "1", resolved: false, resolvable: false };
const files = [{ name: "src/rotas.ts", status: "modified", additions: 1, deletions: 1, patch: "@@ -1,2 +1,2 @@\n a\n-b\n+c", truncated: false }];

async function mount(forge: "github" | "gitlab" = "github", who = "voce", it = item) {
  responses.github_pr_detail = responses.gitlab_mr_detail = () => Promise.resolve(detail);
  render(<PrView forge={forge} item={it} login={who} onClose={() => {}} />);
  for (let i = 0; i < 4; i++) await act(async () => {});
  return screen.getByRole("dialog");
}
async function open(view: HTMLElement, name: RegExp) {
  await act(async () => {
    fireEvent.click(within(view).getByRole("tab", { name }));
  });
  for (let i = 0; i < 4; i++) await act(async () => {});
}
const names = () => calls.map((c) => c.cmd);

beforeEach(() => {
  calls = [];
  responses = {};
});
afterEach(cleanup);

test("opens with the overview and reads the conversation, files and diff only when their tab opens", async () => {
  const view = await mount();
  expect(names()).toEqual(["github_pr_detail"]);
  expect(view.textContent).toContain("fix/rotas → main");
  expect(within(view).getByText("Fecha o watcher quando a sessão termina.")).toBeTruthy();
  responses.github_pr_conversation = () => Promise.resolve([thread]);
  responses.github_pr_files = () => Promise.resolve(files);
  await open(view, /Conversa/);
  expect(names()).toEqual(["github_pr_detail", "github_pr_conversation"]);
  await open(view, /Arquivos/);
  expect(names()).toContain("github_pr_files");
  expect(within(view).getByText("src/rotas.ts")).toBeTruthy();
});

test("the pipeline tab lists the jobs and the word of a state the app does not track", async () => {
  const view = await mount();
  await open(view, /Pipeline/);
  const jobs = within(view).getAllByRole("listitem").map((li) => li.textContent);
  expect(jobs[0]).toContain("build");
  expect(jobs[1]).toContain("manual");
});

test("the diff tab numbers the lines and shows the thread left on one of them", async () => {
  responses.github_pr_conversation = () => Promise.resolve([thread]);
  responses.github_pr_files = () => Promise.resolve(files);
  const view = await mount();
  await open(view, /^Diff/);
  const section = within(view).getByRole("region", { name: "ver o diff de src/rotas.ts" });
  expect(section.textContent).toContain("+ c");
  expect(section.textContent).toContain("E se vier vazio?");
  fireEvent.click(within(section).getByRole("button", { name: /src\/rotas.ts/ }));
  expect(section.textContent).not.toContain("+ c");
});

test("replying in a GitHub thread posts to its first comment and reloads the conversation", async () => {
  responses.github_pr_conversation = () => Promise.resolve([thread]);
  responses.github_pr_reply = () => Promise.resolve(null);
  const view = await mount();
  await open(view, /Conversa/);
  expect(within(view).queryByRole("button", { name: "resolver" })).toBeNull();
  fireEvent.click(within(view).getByRole("button", { name: "responder" }));
  fireEvent.change(within(view).getByLabelText("resposta"), { target: { value: "Coberto no último commit" } });
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "enviar" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(calls.find((c) => c.cmd === "github_pr_reply")?.args).toEqual({ repo: "acme/atlas", number: 7, comment: 1, body: "Coberto no último commit" });
  expect(names().filter((n) => n === "github_pr_conversation").length).toBe(2);
});

test("a GitLab discussion can be resolved, and a resolved one folds away", async () => {
  const gl = { ...thread, thread: "abcdef0123456789", resolvable: true };
  responses.gitlab_mr_conversation = () => Promise.resolve([gl, { ...gl, id: 2, thread: "0123456789abcdef", resolved: true, body: "ok feito" }]);
  responses.gitlab_mr_resolve = () => Promise.resolve(null);
  const view = await mount("gitlab", "voce", { ...item, repo: "acme/grupo/atlas" });
  await open(view, /Conversa/);
  expect(within(view).queryByText("ok feito")).toBeNull();
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "resolver" }));
  });
  expect(calls.find((c) => c.cmd === "gitlab_mr_resolve")?.args).toEqual({ project: "acme/grupo/atlas", iid: 7, discussion: "abcdef0123456789", resolved: true });
});

test("approving takes a confirmation and only then writes; the text is optional", async () => {
  responses.github_pr_review = () => Promise.resolve(null);
  const view = await mount();
  await open(view, /Revisores/);
  expect(within(view).getByText("aprovou")).toBeTruthy();
  fireEvent.click(within(view).getByRole("button", { name: "aprovar" }));
  expect(calls.some((c) => c.cmd === "github_pr_review")).toBe(false);
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "confirmar aprovação" }));
  });
  expect(calls.find((c) => c.cmd === "github_pr_review")?.args).toEqual({ repo: "acme/atlas", number: 7, action: "approve", body: "" });
  expect(within(view).getByRole("status").textContent).toBe("aprovação enviada");
});

test("requesting changes needs a reason, and your own PR cannot be reviewed", async () => {
  responses.github_pr_review = () => Promise.resolve(null);
  const view = await mount();
  await open(view, /Revisores/);
  fireEvent.click(within(view).getByRole("button", { name: "pedir mudanças" }));
  expect((within(view).getByRole("button", { name: "confirmar pedido" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(within(view).getByLabelText("motivo"), { target: { value: "Falta teste" } });
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "confirmar pedido" }));
  });
  expect(calls.find((c) => c.cmd === "github_pr_review")?.args).toMatchObject({ action: "request_changes", body: "Falta teste" });
  cleanup();
  const mine = await mount("github", "ana");
  await open(mine, /Revisores/);
  expect(within(mine).queryByRole("button", { name: "aprovar" })).toBeNull();
  expect(within(mine).getByText(/não dá para aprová-lo/)).toBeTruthy();
});

test("a comment is sent from its own tab, and a refused write keeps the text and says why", async () => {
  responses.github_pr_review = () => Promise.reject("o token não pode escrever neste PR");
  const view = await mount();
  await open(view, /^Comentar/);
  const box = within(view).getByLabelText("comentário") as HTMLTextAreaElement;
  fireEvent.change(box, { target: { value: "Obrigado!" } });
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "comentar" }));
  });
  expect(calls.find((c) => c.cmd === "github_pr_review")?.args).toEqual({ repo: "acme/atlas", number: 7, action: "comment", body: "Obrigado!" });
  expect(within(view).getByRole("alert").textContent).toContain("o token não pode escrever");
  expect(box.value).toBe("Obrigado!");
});

test("a failed lookup is said plainly", async () => {
  responses.github_pr_detail = () => Promise.reject("o GitHub respondeu 404");
  render(<PrView forge="github" item={item} login="voce" onClose={() => {}} />);
  for (let i = 0; i < 4; i++) await act(async () => {});
  expect(screen.getByRole("alert").textContent).toBe("o GitHub respondeu 404");
});

test("focus lands inside the view, and Escape closes it unless a text field has focus", async () => {
  let closed = 0;
  responses.github_pr_detail = () => Promise.resolve(detail);
  render(<PrView forge="github" item={item} login="voce" onClose={() => closed++} />);
  for (let i = 0; i < 4; i++) await act(async () => {});
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "voltar à lista" }));
  fireEvent.keyDown(document.body, { key: "Escape" });
  expect(closed).toBe(1);
  const box = document.createElement("textarea");
  document.body.append(box);
  fireEvent.keyDown(box, { key: "Escape" });
  expect(closed).toBe(1);
  box.remove();
});
