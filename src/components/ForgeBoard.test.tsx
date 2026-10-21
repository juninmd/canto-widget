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
const { clearForgeCache } = await import("../lib/forgeCache");

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const pr = (n: number, title: string, extra = {}) => ({
  repo: "acme/atlas",
  number: n,
  reference: `acme/atlas#${n}`,
  title,
  url: `https://github.com/acme/atlas/pull/${n}`,
  created_at: hoursAgo(3),
  updated_at: hoursAgo(1),
  comments: 0,
  is_pr: true,
  draft: false,
  author: "ana",
  ...extra,
});
const issue = (n: number, title: string) => pr(n, title, { is_pr: false, url: `https://github.com/acme/atlas/issues/${n}` });

const board = {
  review_requested: { total: 9, items: [pr(1, "Revisar o cofre")] },
  assigned: { total: 1, items: [issue(2, "Atribuída a mim")] },
  my_prs: { total: 4, items: [pr(3, "Meu PR verde"), pr(4, "Meu PR vermelho")] },
  my_issues: { total: 2, items: [issue(5, "Minha issue")] },
};
const checks = [
  { repo: "acme/atlas", number: 1, status: "running" },
  { repo: "acme/atlas", number: 3, status: "success" },
  { repo: "acme/atlas", number: 4, status: "failure" },
];

const empty = { total: 0, items: [] };

async function mountGithub(lists: unknown = board, batch: unknown[] = checks) {
  responses.github_status = () => Promise.resolve({ connected: true, login: "voce", source: "pat", device_flow: false });
  responses.github_lists = () => Promise.resolve(lists);
  responses.github_prs_checks = () => Promise.resolve(batch);
  render(<GithubTab onError={() => {}} />);
  for (let i = 0; i < 6; i++) await act(async () => {});
}

const regions = () => screen.queryAllByRole("region").map((r) => r.getAttribute("aria-label"));
const tile = (name: RegExp) => within(screen.getByRole("group", { name: "resumo" })).getByRole("button", { name });
const press = async (name: RegExp) => {
  await act(async () => {
    fireEvent.click(tile(name));
  });
};

beforeEach(() => {
  clearForgeCache();
  calls = [];
  responses = {};
  localStorage.clear();
});
afterEach(cleanup);

test("the summary tiles are toggles that keep their numbers and narrow the board to one group", async () => {
  await mountGithub();
  const strip = screen.getByRole("group", { name: "resumo" });
  const tiles = within(strip).getAllByRole("button");
  expect(tiles.map((b) => b.getAttribute("aria-pressed"))).toEqual(["false", "false", "false", "false"]);
  expect(regions()).toHaveLength(4);

  await press(/revisões/);
  expect(tile(/revisões/).getAttribute("aria-pressed")).toBe("true");
  expect(regions()).toEqual(["Revisão pedida a mim"]);
  expect(strip.textContent).toContain("9revisões");
  expect(strip.textContent).toContain("4meus PRs");

  await press(/meus PRs/);
  expect(regions()).toEqual(["PRs que eu abri"]);
  expect(tile(/revisões/).getAttribute("aria-pressed")).toBe("false");

  await press(/minhas issues/);
  expect(regions()).toEqual(["Issues que eu abri"]);

  await press(/minhas issues/);
  expect(tile(/minhas issues/).getAttribute("aria-pressed")).toBe("false");
  expect(regions()).toHaveLength(4);
});

test("pressing a tile filters in place, without asking GitHub again", async () => {
  await mountGithub();
  const before = calls.filter((c) => c.cmd === "github_lists").length;
  await press(/revisões/);
  await press(/revisões/);
  expect(calls.filter((c) => c.cmd === "github_lists").length).toBe(before);
});

test("the CI falhou tile keeps only my PRs whose CI failed, and drops 'mostrar mais'", async () => {
  await mountGithub();
  expect(screen.getByText("mostrar mais (2 restantes)")).toBeTruthy();
  await press(/CI falhou/);
  const mine = screen.getByRole("region", { name: "PRs que eu abri" });
  expect(regions()).toEqual(["PRs que eu abri"]);
  expect(within(mine).getByText("Meu PR vermelho")).toBeTruthy();
  expect(within(mine).queryByText("Meu PR verde")).toBeNull();
  expect(mine.querySelector("h3")?.textContent).toBe("PRs que eu abri1");
  expect(screen.queryByText(/mostrar mais/)).toBeNull();
});

test("a tile works with the kind chips: a group the chip hides leaves an explained empty board", async () => {
  await mountGithub();
  responses.github_lists = () => Promise.resolve({ ...board, review_requested: { total: 0, items: [] } });
  await press(/revisões/);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "issues" }));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(regions()).toEqual([]);
  expect(screen.getByText("nada neste recorte com o filtro atual")).toBeTruthy();
  expect(tile(/revisões/).getAttribute("aria-pressed")).toBe("true");
});

test("the CI pill says passou, rodando or falhou in its own color", async () => {
  await mountGithub();
  const failed = screen.getByRole("img", { name: "✗ CI falhou" });
  const passed = screen.getByRole("img", { name: "✓ CI passou" });
  const running = screen.getByRole("img", { name: "● CI rodando" });
  expect(failed.className).toContain("text-danger");
  expect(passed.className).toContain("text-ok");
  expect(running.className).not.toContain("text-danger");
  expect(running.className).not.toContain("text-ok");
  expect(failed.textContent).toBe("✗ CI falhou");
});

test("the waiting badge turns danger-colored exactly when the 48 h SLA is passed", async () => {
  await mountGithub({
    ...board,
    review_requested: { total: 2, items: [pr(1, "Quase", { created_at: hoursAgo(47) }), pr(2, "Vencido", { created_at: hoursAgo(49) })] },
  });
  expect(screen.getByText("aguardando há 47 h").className).not.toContain("text-danger");
  expect(screen.getByText("aguardando há 2 d").className).toContain("text-danger");
});

test("section headings stick while the list scrolls", async () => {
  await mountGithub();
  for (const h of document.querySelectorAll("section h3")) expect(h.className).toContain("sticky");
});

test("row actions appear on hover or focus but stay in the tab order, snooze included once the CI is known", async () => {
  await mountGithub();
  const snooze = screen.getByRole("button", { name: "adiar Revisar o cofre por 4 horas" });
  const bar = snooze.parentElement as HTMLElement;
  expect(bar.className).toContain("opacity-0");
  expect(bar.className).toContain("group-hover:opacity-100");
  expect(bar.className).toContain("group-focus-within:opacity-100");
  expect(snooze.getAttribute("tabindex")).toBeNull();
  expect(snooze.closest("[hidden],[inert]")).toBeNull();
  expect(bar.closest("li")?.className).toContain("group");
  expect(screen.queryByText("ver CI")).toBeNull();
});

test("ver CI sits in the hover actions and its answer stays on the row", async () => {
  responses.github_pr_checks = () => Promise.resolve("failure");
  await mountGithub({ ...board, review_requested: empty, assigned: empty, my_issues: empty, my_prs: { total: 1, items: [pr(9, "Sem lote")] } }, []);
  const btn = screen.getByText("ver CI");
  expect(btn.parentElement?.className).toContain("opacity-0");
  await act(async () => {
    fireEvent.click(btn);
  });
  expect(screen.getByRole("img", { name: "✗ CI falhou" })).toBeTruthy();
  expect(screen.queryByText("ver CI")).toBeNull();
});

test("atualizar is an icon button and desconectar hides in the '···' menu behind the same confirmation", async () => {
  await mountGithub();
  const refresh = screen.getByRole("button", { name: "atualizar" });
  expect(refresh.textContent).toBe("");
  expect(refresh.querySelector("svg")).toBeTruthy();
  const more = screen.getByRole("button", { name: "mais ações" });
  expect(more.getAttribute("aria-haspopup")).toBe("menu");
  expect(more.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(more);
  expect(more.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("menuitem", { name: "desconectar" })).toBeTruthy();
  fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(more);
  expect(calls.some((c) => c.cmd === "github_disconnect")).toBe(false);
});

test("GitLab keeps three toggle tiles (no CI) and narrows the same way", async () => {
  responses.gitlab_status = () => Promise.resolve({ connected: true, username: "bia", base_url: "https://gitlab.acme.io" });
  responses.gitlab_lists = () => Promise.resolve({ ...board, review_requested: { total: 1, items: [pr(1, "Revisar MR")] } });
  render(<GitlabTab onError={() => {}} />);
  for (let i = 0; i < 6; i++) await act(async () => {});
  const tiles = within(screen.getByRole("group", { name: "resumo" })).getAllByRole("button");
  expect(tiles).toHaveLength(3);
  await press(/revisões/);
  expect(regions()).toEqual(["Revisão pedida a mim"]);
  expect(screen.getByRole("button", { name: "ordenar por: atualização" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "mais ações" })).toBeTruthy();
});
