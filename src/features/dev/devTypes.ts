// Shapes the Dev commands return; the Rust side is src-tauri/src/dev.
export type PortEntry = {
  port: number;
  proto: "TCP" | "UDP";
  addr: string;
  pid: number;
  ppid: number;
  name: string;
  cmd: string;
  cwd: string;
  mem: number;
  exposed: boolean;
};

export type DockerContainer = {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
  health: "ok" | "bad" | "starting" | "";
  ports: number[];
  project: string;
  cpu: number;
  mem: number;
};
export type DockerImage = { id: string; name: string; size: number; age: string; used: boolean };
export type DockerNamed = { name: string; detail: string; used: boolean };
export type DockerState = { running: boolean; version: string; containers: DockerContainer[]; images: DockerImage[]; volumes: DockerNamed[]; networks: DockerNamed[] };

export type GitRepo = { path: string; name: string; root: string; branch: string; dirty: number; ahead: number; behind: number; last: string };
export type WorktreeReason = "merged" | "gone" | "dirty" | "open" | "detached";
export type GitWorktree = { repo: string; repo_path: string; path: string; branch: string; safe: boolean; reason: WorktreeReason; count: number };
export type GitView = { roots: string[]; depth: number; repos: GitRepo[]; worktrees: GitWorktree[] };

export type CronTask = { id: string; name: string; expr: string; command: string; enabled: boolean; last: "ok" | "failed" | ""; next: string; raw: string };
export type CronListing = { platform: "cron" | "windows"; available: boolean; can_create: boolean; items: CronTask[] };
