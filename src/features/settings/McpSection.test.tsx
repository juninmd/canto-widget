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
