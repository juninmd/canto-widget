import { invoke } from "@tauri-apps/api/core";
import type { CronListing, DockerState, GitView, PortEntry } from "../../features/dev/devTypes";


export const devApi = {
  /** Dev: ports in use with their process, read through the OS's own tools; ending one only works on a process that holds a port. */
  devPortsList: () => invoke<PortEntry[]>("dev_ports_list"),
  devPortKill: (pid: number, tree: boolean) => invoke<number>("dev_port_kill", { pid, tree }),
  /** `running: false` when the Docker engine doesn't answer, which hides the sub-tab. */
  devDockerGet: () => invoke<DockerState>("dev_docker_get"),
  /** kind: start | stop | restart | rm | rmi | volume-rm. */
  devDockerAction: (kind: string, target: string) => invoke<void>("dev_docker_action", { kind, target }),
  devDockerLogs: (name: string) => invoke<string[]>("dev_docker_logs", { name }),
  devDockerPrune: (kind: "images" | "volumes") => invoke<string>("dev_docker_prune", { kind }),
  /** Only the folders the user added are ever read; `add` and `remove` change that list and answer with the new view. */
  devGitGet: () => invoke<GitView>("dev_git_get"),
  devGitRoot: (change: { add?: string; remove?: string; depth?: number }) => invoke<GitView>("dev_git_root", { add: change.add ?? null, remove: change.remove ?? null, depth: change.depth ?? null }),
  devPickFolder: () => invoke<string | null>("dev_pick_folder"),
  devGitFetch: () => invoke<GitView>("dev_git_fetch"),
  devGitTerminal: (repo: string) => invoke<void>("dev_git_terminal", { repo }),
  devGitPull: (repo: string) => invoke<string>("dev_git_pull", { repo }),
  /** Rust checks again that the worktree is safe; resolves to whether its local branch was deleted too. */
  devGitWorktreeRemove: (repo: string, path: string, deleteBranch: boolean) => invoke<boolean>("dev_git_worktree_remove", { repo, path, deleteBranch }),
  devCronList: () => invoke<CronListing>("dev_cron_list"),
  /** action: add | toggle | remove | run; `raw` is the crontab line as listed, refused if it moved since. */
  devCronChange: (a: { action: string; id: string; raw: string; name?: string; expr?: string; command?: string }) =>
    invoke<void>("dev_cron_change", { action: a.action, id: a.id, raw: a.raw, name: a.name ?? null, expr: a.expr ?? null, command: a.command ?? null }),
};
