import type { agents as source } from "../pt-BR/agents";

export const agents: Record<keyof typeof source, string> = {
  "agents.tab": "Agents",
  "agents.loading": "checking the agents",
  "agents.header": "{installed} of {total} installed",
  "agents.refresh": "refresh",
  "agents.refreshTitle": "releases are fetched at most once every 30 min",
  "agents.installed": "installed",
  "agents.notInstalled": "not installed",
  "agents.path": "found at {path}",
  "agents.install": "install with {tool}",
  "agents.copy": "copy",
  "agents.copied": "command copied",
  "agents.copyFailed": "could not copy the command",
  "agents.release": "latest version {tag}",
  "agents.released": "published {ago}",
  "agents.releaseNone": "no release published on GitHub",
  "agents.open": "open on GitHub",
  "agents.empty": "no agent in the list",
  "agents.hint": "the command is only copied: Canto installs nothing",
  "agents.source": "GitHub releases",
};
