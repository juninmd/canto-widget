import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: { cmd: string; args: unknown }[] = [];
const perms = {
  notifications: true, tasks: true, notes: false, agenda: true, prs: true, system: true, weather: true, agents: true, models: true, status: true,
  market: true, mentions: true, repos: true, steam: true, health: true, clipboard: false, gmail: false, contacts: false, tasks_write: false, notes_write: false,
};
let enabled = false;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: { enabled?: boolean; perms?: typeof perms }) => {
    calls.push({ cmd, args });
    const view = () => ({ enabled, running: enabled, port: 47615, endpoint: "http://127.0.0.1:47615/mcp", perms, error: null });
    if (cmd === "mcp_set_enabled") enabled = args.enabled ?? false;
    if (cmd === "mcp_token_get") return Promise.resolve("canto_tok");
    if (cmd === "mcp_calls") return Promise.resolve([{ at: 1, agent: "Codex", tool: "create_task", outcome: "blocked", write: true }]);
    return Promise.resolve(view());
  },
}));

const { default: McpSection } = await import("./McpSection");

afterEach(() => {
  cleanup();
  calls.length = 0;
  enabled = false;
});

test("off by default: nothing but the switch shows, and turning it on reveals the token and the agents", async () => {
  render(<McpSection onError={() => {}} />);
  await act(async () => {});
  expect(screen.queryByText("Token de acesso") === null).toBe(true);
  await act(async () => {
    fireEvent.click(screen.getByLabelText("ligar o servidor MCP"));
  });
  expect(calls.find((c) => c.cmd === "mcp_set_enabled")?.args).toEqual({ enabled: true });
  expect(screen.getByText("Token de acesso")).toBeTruthy();
  expect(screen.getByText("Claude Code")).toBeTruthy();
  expect((screen.getByLabelText("criar e concluir tarefas") as HTMLInputElement).checked).toBe(false);
  expect((screen.getByLabelText("ler tarefas") as HTMLInputElement).checked).toBe(true);
});

test("a permission switch saves the whole set", async () => {
  enabled = true;
  render(<McpSection onError={() => {}} />);
  await act(async () => {});
  await act(async () => {
    fireEvent.click(screen.getByLabelText("criar notas e acrescentar texto"));
  });
  const sent = calls.find((c) => c.cmd === "mcp_set_perms")?.args as { perms: typeof perms };
  expect(sent.perms.notes_write).toBe(true);
  expect(sent.perms.tasks).toBe(true);
});

test("the token stays hidden until asked and the snippets never print it in clear", async () => {
  enabled = true;
  const { container } = render(<McpSection onError={() => {}} />);
  await act(async () => {});
  expect(container.textContent?.includes("canto_tok") === false).toBe(true);
  await act(async () => {
    fireEvent.click(screen.getByText("mostrar"));
  });
  expect(container.textContent?.includes("canto_tok")).toBe(true);
});

test("an agent with its own token is added read-only by default and the shared token can be made read-only", async () => {
  enabled = true;
  render(<McpSection onError={() => {}} />);
  await act(async () => {});
  fireEvent.change(screen.getByLabelText("nome do agente"), { target: { value: "Codex" } });
  await act(async () => {
    fireEvent.click(screen.getByText("adicionar"));
  });
  expect(calls.find((c) => c.cmd === "mcp_agent_add")?.args).toEqual({ name: "Codex", readOnly: true });
  await act(async () => {
    fireEvent.click(screen.getByLabelText("o token compartilhado só lê (nunca escreve)"));
  });
  expect(calls.find((c) => c.cmd === "mcp_agent_set_read_only")?.args).toEqual({ id: "default", readOnly: true });
});

test("the call log shows the agent, the tool and the outcome by text", async () => {
  enabled = true;
  render(<McpSection onError={() => {}} />);
  await act(async () => {});
  await act(async () => {
    fireEvent.click(screen.getByText("chamadas recentes dos agentes"));
  });
  const row = (await screen.findByText("create_task", { exact: false })).closest("li")!;
  expect(row.textContent).toContain("Codex");
  expect(row.textContent).toContain("escrita");
  expect(row.textContent).toContain("bloqueada");
});

test("connect an agent: one tab per agent, the config hides the token and the copy button copies it whole", async () => {
  enabled = true;
  let copied = "";
  Object.defineProperty(navigator, "clipboard", { value: { writeText: async (v: string) => void (copied = v) }, configurable: true });
  const { container } = render(<McpSection onError={() => {}} />);
  await act(async () => {});
  await act(async () => {
    fireEvent.click(screen.getByRole("tab", { name: "Codex" }));
  });
  expect(container.textContent).toContain("~/.codex/config.toml");
  expect(container.textContent?.includes("canto_tok")).toBe(false);
  await act(async () => {
    fireEvent.click(screen.getByLabelText("copiar configuração Codex"));
  });
  expect(copied).toContain("[mcp_servers.canto]");
  expect(copied).toContain("Bearer canto_tok");
});
