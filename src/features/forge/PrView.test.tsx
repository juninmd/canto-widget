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
const { loadMarkdown } = await import("../../lib/markdown");
await loadMarkdown();

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
const meta = {
  title: "Corrige o cálculo de rotas", state: "open", draft: false, conflict: false, author: "ana", author_avatar: "", created_at: "2026-11-01T00:00:00Z",
  body: "Fecha o watcher quando a sessão termina.", labels: [{ name: "bug", color: "d73a4a" }], assignees: ["bia"], milestone: "v1",
  merge_methods: ["squash", "merge"], reactions: [{ id: 11, emoji: "👍", user: "voce" }, { id: 12, emoji: "🎉", user: "bia" }],
};
const files = [{ name: "src/rotas.ts", status: "modified", additions: 1, deletions: 1, patch: "@@ -1,2 +1,2 @@\n a\n-b\n+c", truncated: false }];

async function mount(forge: "github" | "gitlab" = "github", who = "voce", it = item) {
  responses.github_pr_detail ??= () => Promise.resolve(detail);
  responses.gitlab_mr_detail ??= () => Promise.resolve(detail);
  responses.github_pr_meta ??= responses.gitlab_mr_meta ??= () => Promise.resolve(meta);
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

test("opens with the overview and reads the conversation and the files only when their tab opens", async () => {
  const view = await mount();
  expect(names()).toEqual(["github_pr_detail", "github_pr_meta"]);
  expect(view.textContent).toContain("fix/rotas → main");
  expect(within(view).getByText("Fecha o watcher quando a sessão termina.")).toBeTruthy();
  responses.github_pr_conversation = () => Promise.resolve([thread]);
  responses.github_pr_files = () => Promise.resolve(files);
  await open(view, /Conversa/);
  expect(names()).toEqual(["github_pr_detail", "github_pr_meta", "github_pr_conversation"]);
  await open(view, /Arquivos/);
  expect(names()).toContain("github_pr_files");
  expect(within(view).getByText("rotas.ts")).toBeTruthy();
});

test("the pipeline tab lists the jobs and the word of a state the app does not track", async () => {
  const view = await mount();
  await open(view, /Pipeline/);
  const jobs = within(view).getAllByRole("listitem").map((li) => li.textContent);
  expect(jobs[0]).toContain("build");
  expect(jobs[1]).toContain("manual");
});

test("a file opens its diff in the files tab, numbered, with the thread left on one of its lines", async () => {
  responses.github_pr_conversation = () => Promise.resolve([thread]);
  responses.github_pr_files = () => Promise.resolve(files);
  const view = await mount();
  await open(view, /Arquivos/);
  const section = within(view).getByRole("region", { name: "ver o diff de src/rotas.ts" });
  expect(section.textContent).not.toContain("+ c");
  fireEvent.click(within(section).getByRole("button", { name: /rotas.ts/ }));
  expect(section.textContent).toContain("+ c");
  expect(section.textContent).toContain("E se vier vazio?");
  fireEvent.click(within(section).getByRole("button", { name: /rotas.ts/ }));
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

test("a comment is sent from the conversation, and a refused write keeps the text and says why", async () => {
  responses.github_pr_review = () => Promise.reject("o token não pode escrever neste PR");
  responses.github_pr_conversation = () => Promise.resolve([]);
  const view = await mount();
  await open(view, /Conversa/);
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

test("the header says the state and who opened it", async () => {
  const view = await mount();
  expect(view.textContent).toContain("aberto");
  expect(view.textContent).toContain("@ana");
});

test("merging asks first, then sends the chosen method; a draft or a conflict can't be merged", async () => {
  responses.github_pr_act = () => Promise.resolve(null);
  const view = await mount();
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "mesclar" }));
  });
  expect(calls.some((c) => c.cmd === "github_pr_act")).toBe(false);
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "confirmar mesclagem" }));
  });
  expect(calls.find((c) => c.cmd === "github_pr_act")?.args).toEqual({ repo: "acme/atlas", number: 7, action: { kind: "merge", method: "squash", auto: false } });
  expect(within(view).getByRole("status").textContent).toBe("mesclado");
  expect(names().filter((n) => n === "github_pr_meta").length).toBe(2);
  cleanup();
  responses.github_pr_meta = () => Promise.resolve({ ...meta, conflict: true });
  const clash = await mount();
  expect((within(clash).getByRole("button", { name: /conflitos/ }) as HTMLButtonElement).disabled).toBe(true);
});

test("a draft offers to be marked ready instead of merged, and closing asks again", async () => {
  responses.github_pr_act = () => Promise.resolve(null);
  responses.github_pr_meta = () => Promise.resolve({ ...meta, draft: true });
  const view = await mount();
  expect(within(view).queryByRole("button", { name: "mesclar" })).toBeNull();
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "marcar como pronto" }));
  });
  expect(calls.find((c) => c.cmd === "github_pr_act")?.args).toMatchObject({ action: { kind: "draft", on: false } });
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "fechar PR" }));
  });
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "confirmar fechamento" }));
  });
  expect(calls.filter((c) => c.cmd === "github_pr_act").at(-1)?.args).toMatchObject({ action: { kind: "close" } });
});

test("labels are toggled from a picker over the repository's own", async () => {
  responses.github_repo_labels = () => Promise.resolve([{ name: "bug", color: "d73a4a" }, { name: "docs", color: "0075ca" }]);
  responses.github_pr_act = () => Promise.resolve(null);
  const view = await mount();
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "editar" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect((within(view).getByRole("checkbox", { name: /bug/ }) as HTMLInputElement).checked).toBe(true);
  await act(async () => {
    fireEvent.click(within(view).getByRole("checkbox", { name: /docs/ }));
  });
  expect(calls.find((c) => c.cmd === "github_pr_act")?.args).toEqual({ repo: "acme/atlas", number: 7, action: { kind: "label_add", name: "docs" } });
  await act(async () => {
    fireEvent.click(within(view).getByRole("checkbox", { name: /bug/ }));
  });
  expect(calls.filter((c) => c.cmd === "github_pr_act").at(-1)?.args).toMatchObject({ action: { kind: "label_remove", name: "bug" } });
});

test("a reaction of yours is taken back by its id, someone else's is added, and the picker offers more", async () => {
  responses.github_pr_act = () => Promise.resolve(null);
  const view = await mount();
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "reagir com 👍" }));
  });
  expect(calls.find((c) => c.cmd === "github_pr_act")?.args).toEqual({ repo: "acme/atlas", number: 7, action: { kind: "unreact", target: "pr", reaction: 11 } });
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "reagir com 🎉" }));
  });
  expect(calls.filter((c) => c.cmd === "github_pr_act").at(-1)?.args).toMatchObject({ action: { kind: "react", target: "pr", emoji: "🎉" } });
  fireEvent.click(within(view).getByRole("button", { name: "reagir" }));
  expect(within(view).getAllByRole("menuitem").length).toBe(8);
});

test("the description is markdown and its pictures come through Rust as data URLs", async () => {
  responses.forge_image = () => Promise.resolve("data:image/png;base64,AAAA");
  responses.github_pr_meta = () => Promise.resolve({ ...meta, body: "## Resumo\n\n![print](https://user-images.githubusercontent.com/1/a.png)\n\n- um\n- dois" });
  const view = await mount();
  expect(calls.find((c) => c.cmd === "forge_image")?.args).toEqual({ forge: "github", url: "https://user-images.githubusercontent.com/1/a.png" });
  expect((within(view).getByAltText("print") as HTMLImageElement).src).toBe("data:image/png;base64,AAAA");
  expect(within(view).getByText("dois")).toBeTruthy();
  fireEvent.click(within(view).getByRole("button", { name: "ver código-fonte" }));
  expect(view.textContent).toContain("## Resumo");
});

test("a picture that can't be fetched becomes a link, not a broken image", async () => {
  responses.forge_image = () => Promise.reject("não deu para baixar a imagem");
  responses.github_pr_meta = () => Promise.resolve({ ...meta, body: "![print](https://example.com/a.png)" });
  const view = await mount();
  expect(within(view).getByRole("button", { name: /imagem indisponível: print/ })).toBeTruthy();
});

test("files show as a folder tree or a list, and a picture asks for its before and after", async () => {
  responses.github_pr_files = () => Promise.resolve([
    ...files,
    { name: "docs/prints/a.png", status: "modified", additions: 1, deletions: 1, patch: "", truncated: false },
  ]);
  responses.pr_blob_image = (a) => Promise.resolve(`data:image/png;base64,${String(a.gitRef).length}`);
  const view = await mount();
  await open(view, /Arquivos/);
  expect(within(view).getByText("docs/prints")).toBeTruthy();
  fireEvent.click(within(view).getByRole("button", { name: "lista" }));
  expect(within(view).queryByText("docs/prints")).toBeNull();
  expect(within(view).getByText("docs/prints/a.png")).toBeTruthy();
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: /docs\/prints\/a.png/ }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  const blobs = calls.filter((c) => c.cmd === "pr_blob_image").map((c) => c.args);
  expect(blobs).toEqual([
    { forge: "github", repo: "acme/atlas", path: "docs/prints/a.png", gitRef: "main" },
    { forge: "github", repo: "acme/atlas", path: "docs/prints/a.png", gitRef: "fix/rotas" },
  ]);
  expect(within(view).getByRole("button", { name: "fusão" })).toBeTruthy();
  fireEvent.click(within(view).getByRole("button", { name: "fusão" }));
  expect(within(view).getByLabelText("fusão entre antes e depois")).toBeTruthy();
  fireEvent.change(within(view).getByLabelText("filtrar arquivos"), { target: { value: "rotas" } });
  expect(within(view).queryByText("docs/prints/a.png")).toBeNull();
});

test("the tabs follow the app's layout: a vertical bar when it is vertical, pills otherwise", async () => {
  localStorage.setItem("canto.tabLayout", "vertical");
  const view = await mount();
  expect(within(view).getByRole("tablist").getAttribute("aria-orientation")).toBe("vertical");
  expect(within(view).getByRole("button", { name: "manter aberta" })).toBeTruthy();
  fireEvent.click(within(view).getByRole("button", { name: "manter aberta" }));
  expect(localStorage.getItem("canto.railPinned")).toBe("1");
  localStorage.removeItem("canto.tabLayout");
  localStorage.removeItem("canto.railPinned");
  cleanup();
  const flat = await mount();
  expect(within(flat).getByRole("tablist").getAttribute("aria-orientation")).toBeNull();
});

test("a GitLab MR merges through its own command, offers no rebase, waits for the pipeline on request and has ten emoji", async () => {
  responses.gitlab_mr_act = () => Promise.resolve(null);
  responses.gitlab_mr_meta = () => Promise.resolve({ ...meta, merge_methods: ["merge", "squash"] });
  responses.gitlab_mr_detail = () => Promise.resolve({ ...detail, jobs: [{ ...detail.jobs[0], state: "running" }] });
  const view = await mount("gitlab", "voce", { ...item, repo: "acme/grupo/atlas" });
  expect(within(view).queryByRole("option", { name: "rebase" })).toBeNull();
  fireEvent.click(within(view).getByLabelText("mesclar quando o pipeline passar"));
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "mesclar" }));
  });
  await act(async () => {
    fireEvent.click(within(view).getByRole("button", { name: "confirmar mesclagem" }));
  });
  expect(calls.find((c) => c.cmd === "gitlab_mr_act")?.args).toEqual({ project: "acme/grupo/atlas", iid: 7, action: { kind: "merge", method: "squash", auto: true } });
  fireEvent.click(within(view).getByRole("button", { name: "reagir" }));
  expect(within(view).getAllByRole("menuitem").length).toBe(10);
});
