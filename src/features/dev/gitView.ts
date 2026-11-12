import type { GitRepo, GitWorktree } from "./devTypes";

export type RepoFilter = "all" | "dirty" | "ahead" | "behind";

export function filterRepos(list: GitRepo[], query: string, filter: RepoFilter): GitRepo[] {
  const q = query.trim().toLowerCase();
  return list.filter((r) => {
    const by = filter === "all" || (filter === "dirty" ? r.dirty > 0 : filter === "ahead" ? r.ahead > 0 : r.behind > 0);
    return by && (!q || `${r.name} ${r.branch}`.toLowerCase().includes(q));
  });
}

/** Repositories by the folder they were found in, in the order the folders were added. */
export function byRoot(list: GitRepo[], roots: string[]): [string, GitRepo[]][] {
  return roots.map((r): [string, GitRepo[]] => [r, list.filter((x) => x.root === r)]).filter(([, l]) => l.length > 0);
}

export const safeWorktrees = (list: GitWorktree[]) => list.filter((w) => w.safe);

const quote = (s: string) => `"${s.replace(/"/g, '\\"')}"`;

/** The commands the button runs, to read first or paste in a terminal; the same on every OS. */
export function cleanScript(list: GitWorktree[], deleteBranch: boolean): string {
  const lines = list.flatMap((w) => [`git -C ${quote(w.repo_path)} worktree remove ${quote(w.path)}`, ...(deleteBranch ? [`git -C ${quote(w.repo_path)} branch -d ${quote(w.branch)}`] : [])]);
  const repos = [...new Set(list.map((w) => w.repo_path))];
  return [...lines, ...repos.map((r) => `git -C ${quote(r)} worktree prune`)].join("\n");
}

export const lastSegment = (path: string) => path.replace(/[\\/]+$/, "").split(/[\\/]/).pop() ?? path;
