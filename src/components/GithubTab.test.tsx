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
const { clearForgeCache } = await import("../lib/forgeCache");

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
  clearForgeCache();
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
  const region = screen.getByRole("region", { name: "Revisão pedida a mim" });
  expect(region.querySelector("h3")?.textContent).toBe("Revisão pedida a mim3");
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

test("a PR waiting for review shows since when it was opened, in red once stale", async () => {
  responses.github_status = connected;
  const fourDaysAgo = new Date(Date.now() - 4 * 86_400_000).toISOString();
  responses.github_lists = () => Promise.resolve(lists({ review_requested: { total: 1, items: [{ ...item, created_at: fourDaysAgo }] } }));
  await mount();
  const badge = screen.getByText(/aguardando há 4 d/);
  expect(badge.className).toContain("text-danger");
});

test("a PR with no activity for a week is flagged as stale; a fresher one or an issue is not", async () => {
  responses.github_status = connected;
  const eightDaysAgo = new Date(Date.now() - 8 * 86_400_000).toISOString();
  const sixDaysAgo = new Date(Date.now() - 6 * 86_400_000).toISOString();
  const items = [
    { ...item, url: "https://github.com/octo/canto/pull/1", title: "Parado", updated_at: eightDaysAgo },
    { ...item, url: "https://github.com/octo/canto/pull/2", title: "Recente", updated_at: sixDaysAgo },
    { ...item, url: "https://github.com/octo/canto/issues/3", title: "Issue velha", is_pr: false, updated_at: eightDaysAgo },
  ];
  responses.github_lists = () => Promise.resolve(lists({ my_prs: { total: 3, items } }));
  await mount();
  const badges = screen.getAllByText(/parado há/);
  expect(badges.map((b) => b.textContent)).toEqual(["parado há 8 d"]);
  expect(badges[0].closest("li")?.textContent).toContain("Parado");
});

test("a review request shows only 'aguardando', never the stale badge", async () => {
  responses.github_status = connected;
  const tenDaysAgo = new Date(Date.now() - 10 * 86_400_000).toISOString();
  responses.github_lists = () =>
    Promise.resolve(lists({ review_requested: { total: 1, items: [{ ...item, created_at: tenDaysAgo, updated_at: tenDaysAgo }] } }));
  await mount();
  expect(screen.getByText(/aguardando há 10 d/)).toBeTruthy();
  expect(screen.queryByText(/parado há/)).toBeNull();
});

test("PRs get their CI badge in one batch after the list, without a click", async () => {
  responses.github_status = connected;
  const other = { ...item, number: 7, reference: "octo/canto#7", url: "https://github.com/octo/canto/pull/7" };
  responses.github_lists = () =>
    Promise.resolve(lists({ review_requested: { total: 1, items: [item] }, my_prs: { total: 1, items: [other] } }));
  responses.github_prs_checks = () =>
    Promise.resolve([
      { repo: "octo/canto", number: 42, status: "failure" },
      { repo: "octo/canto", number: 7, status: "running" },
    ]);
  await mount();
  expect(calls.filter((c) => c.cmd === "github_prs_checks").map((c) => c.args)).toEqual([
    { prs: [{ repo: "octo/canto", number: 42 }, { repo: "octo/canto", number: 7 }] },
  ]);
  expect(screen.getByRole("img", { name: "✗ CI falhou" })).toBeTruthy();
  expect(screen.getByRole("img", { name: "● CI rodando" })).toBeTruthy();
  expect(screen.queryByText("ver CI")).toBeNull();
});

test("a PR with a merge conflict is flagged once the batch finds it, and only that PR", async () => {
  responses.github_status = connected;
  const other = { ...item, number: 7, reference: "octo/canto#7", url: "https://github.com/octo/canto/pull/7" };
  responses.github_lists = () => Promise.resolve(lists({ my_prs: { total: 2, items: [item, other] } }));
  responses.github_prs_checks = () =>
    Promise.resolve([
      { repo: "octo/canto", number: 42, status: "success", conflict: true },
      { repo: "octo/canto", number: 7, status: "success", conflict: false },
    ]);
  await mount();
  const flagged = screen.getAllByText(/conflito/);
  expect(flagged).toHaveLength(1);
  expect(flagged[0].getAttribute("title")).toBe("tem conflito de merge com a branch base: resolva antes de mesclar");
  expect(flagged[0].closest("li")?.textContent).toContain(item.reference);
});

test("ver CI stays as the fallback for a PR the batch left out, and asks on click only", async () => {
  responses.github_status = connected;
  responses.github_lists = () => Promise.resolve(lists({ my_prs: { total: 1, items: [item] } }));
  responses.github_pr_checks = () => Promise.resolve("success");
  await mount();
  expect(calls.some((c) => c.cmd === "github_pr_checks")).toBe(false);
  await act(async () => {
    fireEvent.click(screen.getByText("ver CI"));
  });
  expect(calls.find((c) => c.cmd === "github_pr_checks")?.args).toEqual({ repo: item.repo, number: item.number });
  expect(screen.getByText("✓ CI passou")).toBeTruthy();
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

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const reviewItems = [
  { ...item, url: "https://github.com/octo/canto/pull/1", title: "Recente", created_at: hoursAgo(3), updated_at: hoursAgo(1) },
  { ...item, url: "https://github.com/octo/canto/pull/2", title: "Antigo", created_at: hoursAgo(52), updated_at: hoursAgo(50) },
];

test("review requests list the longest wait first and flag the ones past the 48 h SLA", async () => {
  localStorage.clear();
  responses.github_status = connected;
  responses.github_lists = () => Promise.resolve(lists({ review_requested: { total: 2, items: reviewItems } }));
  await mount();
  const titles = screen.getAllByText(/^(Recente|Antigo)$/).map((n) => n.textContent);
  expect(titles).toEqual(["Antigo", "Recente"]);
  expect(screen.getByText(/aguardando há 2 d/).className).toContain("text-danger");
  expect(screen.getByText(/aguardando há 3 h/).className).not.toContain("text-danger");
});

test("snoozing a review request hides it for 4 h, keeps a counter and can bring it back", async () => {
  localStorage.clear();
  responses.github_status = connected;
  responses.github_lists = () => Promise.resolve(lists({ review_requested: { total: 2, items: reviewItems } }));
  await mount();
  fireEvent.click(screen.getByRole("button", { name: "adiar Antigo por 4 horas" }));
  expect(screen.queryByText("Antigo")).toBeNull();
  fireEvent.click(screen.getByText("1 adiados"));
  expect(screen.getByText("Antigo")).toBeTruthy();
  expect(Object.keys(JSON.parse(localStorage.getItem("canto.reviewSnooze") ?? "{}"))).toEqual([reviewItems[1].url]);
});

test("the summary strip counts reviews owed and my PRs whose CI failed", async () => {
  responses.github_status = () => Promise.resolve({ connected: true, login: "octocat", source: "app", device_flow: true });
  responses.github_lists = () =>
    Promise.resolve({ assigned: empty, my_prs: { total: 1, items: [item] }, review_requested: { total: 3, items: [] }, my_issues: empty });
  responses.github_prs_checks = () => Promise.resolve([{ repo: item.repo, number: item.number, status: "failure" }]);
  await mount();
  const strip = screen.getByRole("group", { name: "resumo" });
  expect(strip.textContent).toContain("3revisões");
  expect(strip.textContent).toContain("1CI falhou");
});

const mention = {
  id: "github:octo/canto#42",
  title: "Revisar o cofre",
  reference: "octo/canto#42",
  url: "https://github.com/octo/canto/pull/42",
  is_pr: true,
  at: new Date().toISOString(),
  sender: { name: "Marina Souza", login: "marina", avatar: "data:image/png;base64,iVBORw0KGgo=" },
  preview: "…o retry está em 3 tentativas. @octocat consegue olhar o backoff?",
  unread: true,
  muted: false,
  done: false,
};

/** What Rust answers: the rows plus the cache and unread bookkeeping. */
const reply = (rows: unknown[], extra: Record<string, unknown> = {}) => ({ rows, fetched_at: 0, limited_until: null, unread: 0, ...extra });

async function openMentions(rows: unknown[]) {
  responses.github_status = () => Promise.resolve({ connected: true, login: "octocat", source: "pat", device_flow: true });
  responses.github_lists = () => Promise.resolve({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty });
  responses.github_mentions = () => Promise.resolve(reply(rows));
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: "menções" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
}

test("the mentions subtab is fetched only when opened, and shows who wrote what with their photo", async () => {
  responses.github_status = () => Promise.resolve({ connected: true, login: "octocat", source: "pat", device_flow: true });
  responses.github_lists = () => Promise.resolve({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty });
  await mount();
  expect(calls.some((c) => c.cmd === "github_mentions")).toBe(false);
  expect(screen.getByRole("tab", { name: "PRs e issues" }).getAttribute("aria-selected")).toBe("true");
  responses.github_mentions = () => Promise.resolve(reply([mention]));
  calls = [];
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: "menções" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(calls.find((c) => c.cmd === "github_mentions")?.args).toEqual({ force: false });
  expect(screen.getByText("Marina Souza")).toBeTruthy();
  expect(screen.getByText("@marina")).toBeTruthy();
  expect(screen.getByText(/@octocat consegue olhar o backoff\?/)).toBeTruthy();
  expect(screen.getByText("octo/canto#42")).toBeTruthy();
  expect(document.querySelector("[data-sender] img")?.getAttribute("src")).toMatch(/^data:image\/png/);
  expect(screen.queryByRole("region", { name: "PRs que eu abri" })).toBeNull();
});

test("a mention opens its thread in the browser; refresh asks Rust to skip its cache", async () => {
  await openMentions([mention]);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "abrir Revisar o cofre" }));
  });
  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({ url: mention.url });
  expect(calls.find((c) => c.cmd === "mention_read")?.args).toEqual({ ids: [mention.id], read: true });
  calls = [];
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "atualizar" }));
  });
  expect(calls.map((c) => c.cmd)).toEqual(["github_mentions"]);
  expect(calls[0].args).toEqual({ force: true });
});

test("a mention whose comment was not found still lists, saying so, and an empty list explains itself", async () => {
  await openMentions([{ ...mention, sender: null, preview: "" }]);
  expect(screen.getByText("o comentário com a menção não foi encontrado; abra o link para ler")).toBeTruthy();
  expect(screen.getByText("Revisar o cofre")).toBeTruthy();
  cleanup();
  await openMentions([]);
  expect(screen.getByText("ninguém mencionou você em threads abertos")).toBeTruthy();
});

test("a failed mentions lookup is an alert with a retry, and going back to the lists keeps them", async () => {
  responses.github_status = () => Promise.resolve({ connected: true, login: "octocat", source: "pat", device_flow: true });
  responses.github_lists = () => Promise.resolve({ assigned: empty, my_prs: { total: 1, items: [item] }, review_requested: empty, my_issues: empty });
  responses.github_mentions = () => Promise.reject("github: limite de requisições");
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: "menções" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(screen.getByRole("alert").textContent).toContain("limite de requisições");
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: "PRs e issues" }));
  });
  expect(screen.getByText("octo/canto#42")).toBeTruthy();
});

test("opening an unread mention marks it read; marking, muting and the search work on the list at once", async () => {
  const other = { ...mention, id: "github:octo/canto#7", title: "Migração do lote", reference: "octo/canto#7", url: "https://github.com/octo/canto/issues/7", is_pr: false, unread: false, sender: { name: "", login: "caio", avatar: "" } };
  await openMentions([mention, other]);
  const row = (title: string) => screen.getByRole("button", { name: `abrir ${title}` }).closest("li") as HTMLElement;
  expect(row("Revisar o cofre").querySelector('[aria-label="não lida"]')).toBeTruthy();
  expect(row("Migração do lote").querySelector('[aria-label="não lida"]')).toBeNull();

  responses.mention_read = () => Promise.resolve(0);
  await act(async () => {
    fireEvent.click(within(row("Revisar o cofre")).getByRole("button", { name: "marcar como lida" }));
  });
  expect(calls.find((c) => c.cmd === "mention_read")?.args).toEqual({ ids: [mention.id], read: true });
  expect(row("Revisar o cofre").querySelector('[aria-label="não lida"]')).toBeNull();
  expect(within(row("Revisar o cofre")).getByRole("button", { name: "marcar como não lida" })).toBeTruthy();

  fireEvent.change(screen.getByLabelText("Filtrar menções"), { target: { value: "migracao" } });
  expect(screen.queryByText("Revisar o cofre")).toBeNull();
  expect(screen.getByText("Migração do lote")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Filtrar menções"), { target: { value: "zzz" } });
  expect(screen.getByText("nenhuma menção com esse filtro")).toBeTruthy();
});

test("muting a thread or a person hides it, tells Rust, and 'silenciadas' brings it back to unmute", async () => {
  await openMentions([mention]);
  responses.mention_mute_thread = () => Promise.resolve(0);
  responses.mention_mute_author = () => Promise.resolve(0);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "silenciar thread" }));
  });
  expect(calls.find((c) => c.cmd === "mention_mute_thread")?.args).toEqual({ url: mention.url, title: mention.title, muted: true });
  expect(screen.queryByText("Revisar o cofre")).toBeNull();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "silenciadas (1)" }));
  });
  expect(screen.getByText("silenciada")).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "reativar" }));
  });
  expect(calls.find((c) => c.cmd === "mention_mute_author")?.args).toEqual({ login: "marina", muted: false });
  expect(calls.filter((c) => c.cmd === "mention_mute_thread").at(-1)?.args).toEqual({ url: mention.url, title: mention.title, muted: false });
  expect(screen.queryByText("silenciada")).toBeNull();
});

test("a person can be muted from a row, 'marcar todas' reads everything unread, and a long text unfolds", async () => {
  const long = { ...mention, preview: "linha um\n" + "texto longo ".repeat(30) };
  await openMentions([long]);
  responses.mention_mute_author = () => Promise.resolve(0);
  responses.mention_read = () => Promise.resolve(0);
  const preview = () => document.querySelector("[data-preview]") as HTMLElement;
  expect(preview().className).toContain("line-clamp-3");
  fireEvent.click(screen.getByRole("button", { name: "ver mais" }));
  expect(preview().className).not.toContain("line-clamp-3");
  expect(screen.getByRole("button", { name: "ver menos" }).getAttribute("aria-expanded")).toBe("true");

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "marcar todas como lidas" }));
  });
  expect(calls.find((c) => c.cmd === "mention_read")?.args).toEqual({ ids: [mention.id], read: true });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "silenciar @marina" }));
  });
  expect(calls.find((c) => c.cmd === "mention_mute_author")?.args).toEqual({ login: "marina", muted: true });
});

test("the subtab shows the unread count the badge already knows, and says when the rate limit holds the list back", async () => {
  responses.github_status = () => Promise.resolve({ connected: true, login: "octocat", source: "pat", device_flow: true });
  responses.github_lists = () => Promise.resolve({ assigned: empty, my_prs: empty, review_requested: empty, my_issues: empty });
  responses.mentions_unread = () => Promise.resolve(3);
  responses.github_mentions = () => Promise.resolve(reply([mention], { limited_until: Date.now() + 600_000, unread: 1 }));
  await mount();
  expect(screen.getByRole("tab", { name: "menções · 3" })).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: "menções · 3" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(screen.getByRole("status").textContent).toContain("limite de requisições");
  expect(screen.getByRole("tab", { name: "menções · 1" })).toBeTruthy();
});

test("switching to the commenters view loads comments and displays the catalog", async () => {
  responses.github_status = connected;
  const commentedPr = { ...item, comments: 2 };
  responses.github_lists = () => Promise.resolve(lists({ my_prs: { total: 1, items: [commentedPr] } }));
  responses.github_pr_comments = () =>
    Promise.resolve([
      {
        id: 777,
        author: "joaorafaelsoarest",
        author_type: "User",
        avatar_url: "",
        body: "Que app legal! Vou testar",
        created_at: "2026-09-15T10:00:00Z",
        url: "https://github.com/octo/canto/pull/42#issuecomment-777",
      },
    ]);
  await mount();
  const commentersTab = screen.getByRole("tab", { name: "Comentários (1)" });
  expect(commentersTab).toBeTruthy();

  await act(async () => {
    fireEvent.click(commentersTab);
  });
  for (let i = 0; i < 5; i++) await act(async () => {});

  expect(calls.some((c) => c.cmd === "github_pr_comments")).toBe(true);
  expect(screen.getByText("Catálogo de comentaristas")).toBeTruthy();
  expect(screen.getAllByText(/@joaorafaelsoarest/).length).toBeGreaterThan(0);
  expect(screen.getByText("Que app legal! Vou testar")).toBeTruthy();
});

