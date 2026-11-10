import { describe, expect, test } from "bun:test";
import { fetchInBatches, filterCommenters, groupCommenters, isBot, prsWithComments, type EnrichedComment } from "./prCommenters";
import type { ForgeItem } from "./forgeTypes";

const fakePr: ForgeItem = {
  repo: "octo/canto",
  number: 7,
  reference: "octo/canto#7",
  title: "Nova feature",
  url: "https://github.com/octo/canto/pull/7",
  created_at: "2026-09-15T00:00:00Z",
  updated_at: "2026-09-15T10:00:00Z",
  comments: 2,
  is_pr: true,
  draft: false,
  author: "octo",
};

describe("prCommenters", () => {
  test("isBot identifies bot accounts", () => {
    expect(isBot("github-actions[bot]")).toBe(true);
    expect(isBot("google-labs-jules")).toBe(true);
    expect(isBot("random-bot")).toBe(true);
    expect(isBot("someone", "Bot")).toBe(true);
    expect(isBot("joaorafaelsoarest")).toBe(false);
    expect(isBot("octocat")).toBe(false);
  });

  test("prsWithComments filters out PRs without comments", () => {
    const list: ForgeItem[] = [
      fakePr,
      { ...fakePr, number: 8, comments: 0 },
      { ...fakePr, number: 9, is_pr: false, comments: 3 },
    ];
    const got = prsWithComments(list);
    expect(got).toHaveLength(1);
    expect(got[0].number).toBe(7);
  });

  test("groupCommenters groups comments by author and separates PRs", () => {
    const comments: EnrichedComment[] = [
      {
        id: 1,
        author: "joaorafaelsoarest",
        author_type: "User",
        avatar_url: "https://avatar.url/joao",
        body: "Que app legal! Vou testar",
        created_at: "2026-09-15T10:26:50Z",
        url: "https://github.com/octo/canto/pull/7#issuecomment-1",
        repo: "octo/canto",
        prNumber: 7,
        prTitle: "Nova feature",
        prUrl: "https://github.com/octo/canto/pull/7",
      },
      {
        id: 2,
        author: "github-actions[bot]",
        author_type: "Bot",
        avatar_url: "",
        body: "CI passed",
        created_at: "2026-09-15T10:00:00Z",
        url: "https://github.com/octo/canto/pull/7#issuecomment-2",
        repo: "octo/canto",
        prNumber: 7,
        prTitle: "Nova feature",
        prUrl: "https://github.com/octo/canto/pull/7",
      },
      {
        id: 3,
        author: "joaorafaelsoarest",
        author_type: "User",
        avatar_url: "https://avatar.url/joao",
        body: "Funcionou muito bem!",
        created_at: "2026-09-16T11:00:00Z",
        url: "https://github.com/octo/canto/pull/12#issuecomment-3",
        repo: "octo/canto",
        prNumber: 12,
        prTitle: "Outra melhoria",
        prUrl: "https://github.com/octo/canto/pull/12",
      },
    ];

    const groups = groupCommenters(comments);
    expect(groups).toHaveLength(2);

    // Human comes first
    expect(groups[0].login).toBe("joaorafaelsoarest");
    expect(groups[0].isBot).toBe(false);
    expect(groups[0].totalComments).toBe(2);
    expect(groups[0].prsCount).toBe(2);
    expect(groups[0].prs[0].number).toBe(7);
    expect(groups[0].prs[1].number).toBe(12);

    // Bot comes second
    expect(groups[1].login).toBe("github-actions[bot]");
    expect(groups[1].isBot).toBe(true);
    expect(groups[1].totalComments).toBe(1);
    expect(groups[1].prsCount).toBe(1);
  });

  test("filterCommenters filters by text and hides bots", () => {
    const comments: EnrichedComment[] = [
      {
        id: 1,
        author: "joao",
        author_type: "User",
        avatar_url: "",
        body: "Que app legal!",
        created_at: "2026-09-15T10:00:00Z",
        url: "https://github.com/octo/canto/pull/7#issuecomment-1",
        repo: "octo/canto",
        prNumber: 7,
        prTitle: "Nova feature",
        prUrl: "https://github.com/octo/canto/pull/7",
      },
      {
        id: 2,
        author: "dependabot[bot]",
        author_type: "Bot",
        avatar_url: "",
        body: "Bumps lodash",
        created_at: "2026-09-15T10:00:00Z",
        url: "https://github.com/octo/canto/pull/7#issuecomment-2",
        repo: "octo/canto",
        prNumber: 7,
        prTitle: "Nova feature",
        prUrl: "https://github.com/octo/canto/pull/7",
      },
    ];

    const groups = groupCommenters(comments);

    // Hide bots
    const withoutBots = filterCommenters(groups, "", true);
    expect(withoutBots).toHaveLength(1);
    expect(withoutBots[0].login).toBe("joao");

    // Search by query
    const searched = filterCommenters(groups, "legal", false);
    expect(searched).toHaveLength(1);
    expect(searched[0].login).toBe("joao");
  });

  test("fetchInBatches chunks calls and collects results", async () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    const got = await fetchInBatches(items, 3, async (n) => {
      return n * 10;
    });
    expect(got).toEqual([10, 20, 30, 40, 50, 60, 70]);
  });
});
