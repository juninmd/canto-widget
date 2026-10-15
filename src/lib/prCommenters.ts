import type { PrComment } from "./api";
import type { ForgeItem } from "./forgeTypes";

export type EnrichedComment = PrComment & {
  repo: string;
  prNumber: number;
  prTitle: string;
  prUrl: string;
};

export type CommentedPr = {
  repo: string;
  number: number;
  title: string;
  url: string;
  comments: EnrichedComment[];
};

export type CommenterGroup = {
  login: string;
  avatarUrl?: string;
  isBot: boolean;
  totalComments: number;
  prsCount: number;
  prs: CommentedPr[];
};

const KNOWN_BOTS = new Set([
  "github-actions",
  "github-actions[bot]",
  "gh-assistance",
  "gh-assistance[bot]",
  "google-labs-jules",
  "google-labs-jules[bot]",
  "dependabot",
  "dependabot[bot]",
  "netlify",
  "netlify[bot]",
  "sonarqubecloud",
  "sonarqubecloud[bot]",
  "vercel",
  "vercel[bot]",
  "codecov",
  "codecov[bot]",
  "copilot",
  "copilot-pull-request-reviewer",
  "snyk-bot",
]);

export function isBot(author: string, authorType?: string): boolean {
  if (authorType?.toLowerCase() === "bot") return true;
  const lower = author.toLowerCase().trim();
  if (lower.endsWith("[bot]")) return true;
  if (KNOWN_BOTS.has(lower)) return true;
  return lower.includes("-bot") || lower.includes("_bot") || lower.includes("bot-");
}

export function groupCommenters(comments: EnrichedComment[]): CommenterGroup[] {
  const map = new Map<string, { comments: EnrichedComment[]; avatarUrl?: string; isBot: boolean }>();

  for (const c of comments) {
    const author = c.author || "unknown";
    const existing = map.get(author);
    const bot = isBot(author, c.author_type);
    if (!existing) {
      map.set(author, { comments: [c], avatarUrl: c.avatar_url || undefined, isBot: bot });
    } else {
      existing.comments.push(c);
      if (!existing.avatarUrl && c.avatar_url) existing.avatarUrl = c.avatar_url;
    }
  }

  const result: CommenterGroup[] = [];
  for (const [login, data] of map.entries()) {
    const prMap = new Map<string, CommentedPr>();
    for (const c of data.comments) {
      const key = `${c.repo}#${c.prNumber}`;
      const pr = prMap.get(key);
      if (!pr) {
        prMap.set(key, {
          repo: c.repo,
          number: c.prNumber,
          title: c.prTitle,
          url: c.prUrl,
          comments: [c],
        });
      } else {
        pr.comments.push(c);
      }
    }

    const prs = Array.from(prMap.values());
    result.push({
      login,
      avatarUrl: data.avatarUrl,
      isBot: data.isBot,
      totalComments: data.comments.length,
      prsCount: prs.length,
      prs,
    });
  }

  // Humans first, then sorted by most comments desc
  return result.sort((a, b) => {
    if (a.isBot !== b.isBot) return a.isBot ? 1 : -1;
    return b.totalComments - a.totalComments || a.login.localeCompare(b.login);
  });
}

export function filterCommenters(
  groups: CommenterGroup[],
  query: string,
  hideBots: boolean,
): CommenterGroup[] {
  const q = query.trim().toLowerCase();
  return groups.filter((g) => {
    if (hideBots && g.isBot) return false;
    if (!q) return true;
    if (g.login.toLowerCase().includes(q)) return true;
    return g.prs.some(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.repo.toLowerCase().includes(q) ||
        p.comments.some((c) => c.body.toLowerCase().includes(q)),
    );
  });
}

export function prsWithComments(prs: ForgeItem[]): ForgeItem[] {
  return prs.filter((p) => p.is_pr && p.comments > 0);
}

export async function fetchInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const chunkResults = await Promise.all(chunk.map(fn));
    results.push(...chunkResults);
  }
  return results;
}

