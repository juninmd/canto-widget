import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { CommenterGroup } from "../lib/prCommenters";

let calls: { cmd: string; args: unknown }[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: unknown) => {
    calls.push({ cmd, args });
    return Promise.resolve(null);
  },
}));

const { default: PrCommentersCatalog } = await import("./PrCommentersCatalog");

const sampleCommenters: CommenterGroup[] = [
  {
    login: "joaorafaelsoarest",
    avatarUrl: "https://avatar.url/joao",
    isBot: false,
    totalComments: 1,
    prsCount: 1,
    prs: [
      {
        repo: "juninmd/canto-widget",
        number: 7,
        title: "feat: lembretes e atalhos",
        url: "https://github.com/juninmd/canto-widget/pull/7",
        comments: [
          {
            id: 101,
            author: "joaorafaelsoarest",
            author_type: "User",
            avatar_url: "https://avatar.url/joao",
            body: "Que app legal! Vou testar",
            created_at: "2026-09-15T10:26:50Z",
            url: "https://github.com/juninmd/canto-widget/pull/7#issuecomment-101",
            repo: "juninmd/canto-widget",
            prNumber: 7,
            prTitle: "feat: lembretes e atalhos",
            prUrl: "https://github.com/juninmd/canto-widget/pull/7",
          },
        ],
      },
    ],
  },
  {
    login: "github-actions[bot]",
    isBot: true,
    totalComments: 3,
    prsCount: 2,
    prs: [
      {
        repo: "juninmd/canto-widget",
        number: 7,
        title: "feat: lembretes e atalhos",
        url: "https://github.com/juninmd/canto-widget/pull/7",
        comments: [
          {
            id: 102,
            author: "github-actions[bot]",
            author_type: "Bot",
            avatar_url: "",
            body: "CI passed successfully",
            created_at: "2026-09-15T09:00:00Z",
            url: "https://github.com/juninmd/canto-widget/pull/7#issuecomment-102",
            repo: "juninmd/canto-widget",
            prNumber: 7,
            prTitle: "feat: lembretes e atalhos",
            prUrl: "https://github.com/juninmd/canto-widget/pull/7",
          },
        ],
      },
    ],
  },
];

beforeEach(() => {
  calls = [];
});
afterEach(cleanup);

test("renders commenters catalog grid with counts and tags", () => {
  render(<PrCommentersCatalog commenters={sampleCommenters} />);

  expect(screen.getByText("Catálogo de comentaristas")).toBeTruthy();
  expect(screen.getByText(/2 pessoas/)).toBeTruthy();
  expect(screen.getAllByText(/@joaorafaelsoarest/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/@github-actions\[bot\]/).length).toBeGreaterThan(0);
  expect(screen.getByText("pessoa")).toBeTruthy();
  expect(screen.getByText("bot")).toBeTruthy();
});

test("toggling hide bots filters out bot cards from the grid", async () => {
  render(<PrCommentersCatalog commenters={sampleCommenters} />);

  const toggle = screen.getByRole("button", { name: /Ocultar bots/ });
  await act(async () => {
    fireEvent.click(toggle);
  });

  const grid = screen.getByRole("region", { name: "Catálogo de comentaristas" });
  expect(within(grid).getByText(/@joaorafaelsoarest/)).toBeTruthy();
  expect(within(grid).queryByText(/@github-actions\[bot\]/)).toBeNull();
  expect(screen.getByRole("button", { name: /Mostrar bots/ })).toBeTruthy();
});

test("selecting a commenter filters PRs and clicking opens link", async () => {
  render(<PrCommentersCatalog commenters={sampleCommenters} />);

  const grid = screen.getByRole("region", { name: "Catálogo de comentaristas" });
  const cardBtn = within(grid).getByText(/@joaorafaelsoarest/).closest("button")!;
  await act(async () => {
    fireEvent.click(cardBtn);
  });

  expect(screen.getByText(/Filtrando por @joaorafaelsoarest/)).toBeTruthy();
  expect(screen.getByText(/Que app legal! Vou testar/)).toBeTruthy();

  await act(async () => {
    fireEvent.click(screen.getByText(/Que app legal! Vou testar/));
  });

  expect(calls.find((c) => c.cmd === "open_link")?.args).toEqual({
    url: "https://github.com/juninmd/canto-widget/pull/7#issuecomment-101",
  });
});

test("empty list displays empty message", () => {
  render(<PrCommentersCatalog commenters={[]} />);
  expect(screen.getByText(/Nenhum comentário encontrado/)).toBeTruthy();
});

test("paginates large lists of commenters with show more button", async () => {
  const manyCommenters: CommenterGroup[] = Array.from({ length: 25 }, (_, i) => ({
    login: `user_${i + 1}`,
    isBot: false,
    totalComments: 1,
    prsCount: 1,
    prs: [],
  }));

  render(<PrCommentersCatalog commenters={manyCommenters} />);

  const showMoreBtn = screen.getByRole("button", { name: /Mostrar mais \(7\)/ });
  expect(showMoreBtn).toBeTruthy();

  await act(async () => {
    fireEvent.click(showMoreBtn);
  });

  expect(screen.queryByRole("button", { name: /Mostrar mais/ })).toBeNull();
  expect(screen.getByText(/@user_25/)).toBeTruthy();
});
