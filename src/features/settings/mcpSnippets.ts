/** How each coding agent is told about the Canto MCP server (HTTP transport, bearer token). */
export type Snippet = { id: string; name: string; file?: string; text: string };

const json = (value: unknown) => JSON.stringify(value, null, 2);

export function snippets(url: string, token: string): Snippet[] {
  const auth = `Bearer ${token}`;
  return [
    { id: "claude", name: "Claude Code", text: `claude mcp add --transport http canto ${url} --header "Authorization: ${auth}"` },
    {
      id: "codex",
      name: "Codex",
      file: "~/.codex/config.toml",
      text: `[mcp_servers.canto]\nurl = "${url}"\nhttp_headers = { Authorization = "${auth}" }`,
    },
    {
      id: "opencode",
      name: "OpenCode",
      file: "opencode.json",
      text: json({ $schema: "https://opencode.ai/config.json", mcp: { canto: { type: "remote", url, enabled: true, headers: { Authorization: auth } } } }),
    },
    { id: "gemini", name: "Gemini CLI", text: `gemini mcp add --transport http canto ${url} -H "Authorization: ${auth}"` },
    {
      id: "cursor",
      name: "Cursor",
      file: "~/.cursor/mcp.json",
      text: json({ mcpServers: { canto: { url, headers: { Authorization: auth } } } }),
    },
    {
      id: "vscode",
      name: "VS Code / Copilot",
      file: ".vscode/mcp.json",
      text: json({ servers: { canto: { type: "http", url, headers: { Authorization: auth } } } }),
    },
    {
      id: "windsurf",
      name: "Windsurf",
      file: "~/.codeium/windsurf/mcp_config.json",
      text: json({ mcpServers: { canto: { serverUrl: url, headers: { Authorization: auth } } } }),
    },
    {
      id: "generic",
      name: "mcp-remote (Claude Desktop, Zed...)",
      file: "claude_desktop_config.json",
      text: json({ mcpServers: { canto: { command: "npx", args: ["-y", "mcp-remote", url, "--header", "Authorization:${CANTO_TOKEN}"], env: { CANTO_TOKEN: auth } } } }),
    },
  ];
}
