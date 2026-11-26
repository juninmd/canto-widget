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

test("the author and each reviewer open their profile card, and a second click closes it", async () => {
  responses.github_profile = (args) =>
    Promise.resolve({ login: String(args.login), name: `Nome de ${String(args.login)}`, bio: "", company: "Acme", location: "", public_repos: 3, followers: 1, since: 2020, url: `https://github.com/${String(args.login)}` });
  const panel = await mount();
  await act(async () => {
    fireEvent.click(within(panel).getByRole("button", { name: "ver perfil de @ana" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  const card = within(panel).getByRole("region", { name: "perfil de @ana" });
  expect(card.textContent).toContain("Nome de ana");
  expect(card.querySelector("a")?.getAttribute("href")).toBe("https://github.com/ana");
  await act(async () => {
    fireEvent.click(within(panel).getByRole("button", { name: "ver perfil de @bia" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(within(panel).queryByRole("region", { name: "perfil de @ana" })).toBeNull();
  expect(within(panel).getByRole("region", { name: "perfil de @bia" })).toBeTruthy();
  fireEvent.click(within(panel).getByRole("button", { name: "ver perfil de @bia" }));
  expect(within(panel).queryByRole("region", { name: "perfil de @bia" })).toBeNull();
});

test("a bot is shown as plain text: it has no profile to open", async () => {
  responses.github_pr_detail = () => Promise.resolve({ ...detail, reviewers: [{ login: "copilot[bot]", state: "approved" }] });
  render(<PrPeek item={item} login="voce" onClose={() => {}} />);
  for (let i = 0; i < 4; i++) await act(async () => {});
  expect(screen.queryByRole("button", { name: /ver perfil de @copilot/ })).toBeNull();
  expect(screen.getByText("@copilot[bot] · aprovou")).toBeTruthy();
});

const talk = [
  { id: 1, author: "bia", bot: false, body: "e se vier vazio?", created_at: "2026-11-01T10:00:00Z", url: "https://github.com/acme/atlas/pull/7#discussion_r1", path: "src/rotas.ts", line: 12, hunk: "-a\n+b", reply: false },
  { id: 2, author: "ana", bot: false, body: "coberto no teste", created_at: "2026-11-01T11:00:00Z", url: "https://github.com/acme/atlas/pull/7#discussion_r2", path: "src/rotas.ts", line: 12, hunk: "", reply: true },
  { id: 3, author: "ci[bot]", bot: true, body: "cobertura 87%", created_at: "2026-11-01T12:00:00Z", url: "https://github.com/acme/atlas/pull/7#issuecomment-3", path: "", line: 0, hunk: "", reply: false },
];

test("the web button opens the PR in the browser", async () => {
  const panel = await mount();
  fireEvent.click(within(panel).getByRole("button", { name: "abrir no GitHub" }));
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: item.url });
});

test("comments are only fetched once the conversation is opened", async () => {
  responses.github_pr_conversation = () => Promise.resolve(talk);
  const panel = await mount();
  expect(calls.some((c) => c.cmd === "github_pr_conversation")).toBe(false);
  await act(async () => {
    fireEvent.click(within(panel).getByRole("button", { name: "ver conversa (1)" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(calls.find((c) => c.cmd === "github_pr_conversation")?.args).toEqual({ repo: "acme/atlas", number: 7 });
  const list = within(panel).getByRole("list", { name: "comentários do PR" });
  expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  expect(list.textContent).toContain("src/rotas.ts:12");
  expect(within(list).getByLabelText("trecho do diff").textContent).toBe("-a\n+b");
});

test("each comment opens itself in the browser and bots can be hidden", async () => {
  responses.github_pr_conversation = () => Promise.resolve(talk);
  const panel = await mount();
  await act(async () => {
    fireEvent.click(within(panel).getByRole("button", { name: "ver conversa (1)" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  fireEvent.click(within(panel).getByRole("button", { name: "abrir comentário de @bia no GitHub" }));
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: talk[0]!.url });
  fireEvent.click(within(panel).getByRole("button", { name: "ocultar bots" }));
  expect(within(panel).queryByText("cobertura 87%")).toBeNull();
  expect(within(panel).getByText("coberto no teste")).toBeTruthy();
});

test("a failed conversation says why and the rest of the panel keeps working", async () => {
  responses.github_pr_conversation = () => Promise.reject("o GitHub respondeu 403");
  const panel = await mount();
  await act(async () => {
    fireEvent.click(within(panel).getByRole("button", { name: "ver conversa (1)" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(within(panel).getByRole("alert").textContent).toBe("o GitHub respondeu 403");
  expect(within(panel).getByRole("button", { name: "aprovar" })).toBeTruthy();
});
