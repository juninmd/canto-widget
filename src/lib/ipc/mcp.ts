import { invoke } from "@tauri-apps/api/core";

export type McpPerms = {
  notifications: boolean; tasks: boolean; notes: boolean; agenda: boolean; prs: boolean; system: boolean; weather: boolean;
  agents: boolean; models: boolean; status: boolean; market: boolean; mentions: boolean; repos: boolean; steam: boolean;
  health: boolean; clipboard: boolean; gmail: boolean; contacts: boolean;
  tasks_write: boolean; notes_write: boolean; notify_write: boolean;
};
export type McpAgent = { id: string; name: string; read_only: boolean };
export type McpCall = { at: number; agent: string; tool: string; outcome: "ok" | "blocked" | "error"; write: boolean };
export type McpView = {
  enabled: boolean; running: boolean; port: number; endpoint: string; perms: McpPerms; error: string | null;
  default_read_only?: boolean; agents?: McpAgent[];
};

export const mcpApi = {
  mcpGet: () => invoke<McpView>("mcp_get"),
  mcpSetEnabled: (enabled: boolean) => invoke<McpView>("mcp_set_enabled", { enabled }),
  mcpSetPerms: (perms: McpPerms) => invoke<McpView>("mcp_set_perms", { perms }),
  mcpSetPort: (port: number) => invoke<McpView>("mcp_set_port", { port }),
  mcpToken: () => invoke<string>("mcp_token_get"),
  mcpTokenRegenerate: () => invoke<string>("mcp_token_regenerate"),
  mcpAgentAdd: (name: string, readOnly: boolean) => invoke<McpView>("mcp_agent_add", { name, readOnly }),
  mcpAgentSetReadOnly: (id: string, readOnly: boolean) => invoke<McpView>("mcp_agent_set_read_only", { id, readOnly }),
  mcpAgentRemove: (id: string) => invoke<McpView>("mcp_agent_remove", { id }),
  mcpAgentToken: (id: string) => invoke<string>("mcp_agent_token", { id }),
  mcpCalls: () => invoke<McpCall[]>("mcp_calls"),
  mcpCallsClear: () => invoke<void>("mcp_calls_clear"),
};
