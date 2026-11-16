import { expect, test } from "bun:test";
import { snippets } from "./mcpSnippets";

const URL = "http://127.0.0.1:47615/mcp";
const TOKEN = "canto_abc";

test("every agent gets the endpoint and the bearer token", () => {
  const list = snippets(URL, TOKEN);
  expect(list.map((s) => s.id)).toEqual(["claude", "codex", "opencode", "gemini", "cursor", "vscode", "windsurf", "generic"]);
  for (const s of list) {
    expect(s.text, s.id).toContain(URL);
    expect(s.text, s.id).toContain(TOKEN);
  }
});

test("JSON snippets parse and TOML/CLI ones use each tool's own keys", () => {
  const by = Object.fromEntries(snippets(URL, TOKEN).map((s) => [s.id, s.text]));
  expect(JSON.parse(by.cursor).mcpServers.canto.headers.Authorization).toBe(`Bearer ${TOKEN}`);
  expect(JSON.parse(by.vscode).servers.canto.type).toBe("http");
  expect(JSON.parse(by.windsurf).mcpServers.canto.serverUrl).toBe(URL);
  expect(JSON.parse(by.opencode).mcp.canto.type).toBe("remote");
  expect(by.codex).toContain("[mcp_servers.canto]");
  expect(by.claude.startsWith("claude mcp add --transport http canto")).toBe(true);
});
