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

const { default: PrPeek } = await import("./PrPeek");

const item = {
  repo: "acme/atlas",
  number: 7,
  reference: "acme/atlas#7",
  title: "Corrige o cálculo de rotas",
  url: "https://github.com/acme/atlas/pull/7",
  created_at: "2026-11-01T00:00:00Z",
  updated_at: "2026-11-01T00:00:00Z",
  comments: 1,
  is_pr: true,
  draft: false,
  author: "ana",
};
const detail = {
  body: "Fecha o watcher quando a sessão termina.",
  head_branch: "fix/rotas",
  base_branch: "main",
  changed_files: 4,
  jobs: [
    { name: "build", state: "success", url: "https://github.com/acme/atlas/actions/runs/1" },
    { name: "test-windows", state: "failure", url: "" },
  ],
  reviewers: [
    { login: "bia", state: "approved" },
    { login: "caio", state: "pending" },
  ],
};

async function mount(who = "voce") {
  responses.github_pr_detail = () => Promise.resolve(detail);
  render(<PrPeek item={item} login={who} onClose={() => {}} />);
  for (let i = 0; i < 4; i++) await act(async () => {});
  return screen.getByRole("region", { name: "detalhes do PR" });
}

beforeEach(() => {
  calls = [];
  responses = {};
});
afterEach(cleanup);

test("shows the branches, description, CI jobs and reviewers of the PR", async () => {
  const panel = await mount();
  expect(calls[0]).toEqual({ cmd: "github_pr_detail", args: { repo: "acme/atlas", number: 7 } });
  expect(panel.textContent).toContain("fix/rotas → main");
  expect(panel.textContent).toContain("4 arquivos");
  expect(within(panel).getByText("Fecha o watcher quando a sessão termina.")).toBeTruthy();
  const jobs = within(within(panel).getByRole("list", { name: "jobs do CI" })).getAllByRole("listitem");
  expect(jobs.map((j) => j.textContent)).toEqual(["build✓ CI passou", "test-windows✗ CI falhou"]);
  expect(within(panel).getByText("@bia · aprovou")).toBeTruthy();
  expect(within(panel).getByText("@caio · aguardando")).toBeTruthy();
});

test("a failed lookup is said plainly", async () => {
  responses.github_pr_detail = () => Promise.reject("o GitHub respondeu 404");
  render(<PrPeek item={item} login="voce" onClose={() => {}} />);
  for (let i = 0; i < 4; i++) await act(async () => {});
  expect(screen.getByRole("alert").textContent).toBe("o GitHub respondeu 404");
});

test("approving takes a confirmation and only then writes", async () => {
  responses.github_pr_review = () => Promise.resolve(null);
  const panel = await mount();
  fireEvent.click(within(panel).getByRole("button", { name: "aprovar" }));
  expect(calls.some((c) => c.cmd === "github_pr_review")).toBe(false);
  await act(async () => {
    fireEvent.click(within(panel).getByRole("button", { name: "confirmar aprovação" }));
  });
  expect(calls.find((c) => c.cmd === "github_pr_review")?.args).toEqual({ repo: "acme/atlas", number: 7, action: "approve", body: "" });
  expect(within(panel).getByRole("status").textContent).toBe("aprovação enviada");
  expect(within(panel).queryByRole("group", { name: "confirmar aprovação" })).toBeNull();
});

test("cancelling the confirmation writes nothing", async () => {
  const panel = await mount();
  fireEvent.click(within(panel).getByRole("button", { name: "aprovar" }));
  fireEvent.click(within(panel).getByRole("button", { name: "cancelar" }));
  expect(calls.some((c) => c.cmd === "github_pr_review")).toBe(false);
  expect(within(panel).getByRole("button", { name: "aprovar" })).toBeTruthy();
});

test("your own PR has no approve button, and a comment needs text", async () => {
  const panel = await mount("ana");
  expect(within(panel).queryByRole("button", { name: "aprovar" })).toBeNull();
  const send = within(panel).getByRole("button", { name: "comentar" }) as HTMLButtonElement;
  expect(send.disabled).toBe(true);
  fireEvent.change(within(panel).getByLabelText("comentário"), { target: { value: "  Obrigada!  " } });
  expect(send.disabled).toBe(false);
  responses.github_pr_review = () => Promise.resolve(null);
  await act(async () => {
    fireEvent.click(send);
  });
  expect(calls.find((c) => c.cmd === "github_pr_review")?.args).toEqual({ repo: "acme/atlas", number: 7, action: "comment", body: "Obrigada!" });
  expect(within(panel).getByRole("status").textContent).toBe("comentário enviado");
  expect((within(panel).getByLabelText("comentário") as HTMLTextAreaElement).value).toBe("");
});

test("a read-only token shows what to change and keeps the text", async () => {
  responses.github_pr_review = () => Promise.reject("github: o token não pode escrever neste PR: crie-o com permissão de escrita em Pull requests");
  const panel = await mount();
  fireEvent.change(within(panel).getByLabelText("comentário"), { target: { value: "Oi" } });
  await act(async () => {
    fireEvent.click(within(panel).getByRole("button", { name: "comentar" }));
  });
  expect(within(panel).getByRole("alert").textContent).toContain("permissão de escrita");
  expect((within(panel).getByLabelText("comentário") as HTMLTextAreaElement).value).toBe("Oi");
});
