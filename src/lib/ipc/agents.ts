import { invoke } from "@tauri-apps/api/core";

/** The latest release GitHub published for one agent harness; the notes come as markdown. */
export type HarnessRelease = { tag: string; name: string; published_at: string; url: string; notes: string };
/** One coding-agent CLI the "Agentes" tab knows: where it is installed here and when it last shipped. */
export type HarnessView = {
  id: string;
  name: string;
  repo: string;
  site: string;
  install_tool: string;
  install_command: string;
  installed: boolean;
  /** Full path of the executable, or null when the CLI is not on PATH. */
  path: string | null;
  release: HarnessRelease | null;
  error: string | null;
};

export const agentsApi = {
  /** Coding-agent CLIs: detection is local, the release feed comes from GitHub (30 min floor in Rust). */
  harnessList: (force = false) => invoke<HarnessView[]>("harness_list", { force }),
};
