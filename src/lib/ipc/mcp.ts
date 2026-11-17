import { invoke } from "@tauri-apps/api/core";

export type McpPerms = {
  notifications: boolean; tasks: boolean; notes: boolean; agenda: boolean; prs: boolean; system: boolean; weather: boolean;
  agents: boolean; models: boolean; status: boolean; market: boolean; mentions: boolean; repos: boolean; steam: boolean;
  health: boolean; clipboard: boolean; gmail: boolean; contacts: boolean;
  tasks_write: boolean; notes_write: boolean;
};
export type McpView = { enabled: boolean; running: boolean; port: number; endpoint: string; perms: McpPerms; error: string | null };

export const mcpApi = {
  mcpGet: () => invoke<McpView>("mcp_get"),
  mcpSetEnabled: (enabled: boolean) => invoke<McpView>("mcp_set_enabled", { enabled }),
  mcpSetPerms: (perms: McpPerms) => invoke<McpView>("mcp_set_perms", { perms }),
  mcpSetPort: (port: number) => invoke<McpView>("mcp_set_port", { port }),
  mcpToken: () => invoke<string>("mcp_token_get"),
  mcpTokenRegenerate: () => invoke<string>("mcp_token_regenerate"),
};
