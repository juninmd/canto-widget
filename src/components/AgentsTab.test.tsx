import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { HarnessView } from "../lib/api";

let views: HarnessView[];
let clipboard = "";
let clipboardFails = false;
const calls: { cmd: string; args: Record<string, unknown> }[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "harness_list") return Promise.resolve(views);
    return Promise.resolve(null);
  },
}));

const { default: AgentsTab } = await import("./AgentsTab");

const row = (id: string, name: string, extra: Partial<HarnessView> = {}): HarnessView => ({
  id,
  name,
  repo: `acme/${id}`,
  site: `https://github.com/acme/${id}`,
  install_tool: "npm",
  install_command: `npm install -g ${id}`,
  installed: false,
  path: null,
  release: null,
  error: null,
  ...extra,
});

const release = (tag: string, published = "2026-10-16T20:53:06Z") => ({
  tag,
  name: tag,
  published_at: published,
  url: `https://github.com/acme/codex/releases/tag/${tag}`,
  notes: "## O que mudou\n\n- **corrige** o modo plano\n- solta a flag nova",
});

const FIXTURES = () => [
  row("codex", "Codex CLI", { installed: true, path: "C:\\Users\\ana\\bin\\codex.cmd", release: release("v0.163.0") }),
  row("aider", "Aider", { install_tool: "pipx", install_command: "pipx install aider-chat" }),
];

const errors: string[] = [];

async function show() {
  render(<AgentsTab onError={(m) => errors.push(m)} />);
  await act(async () => {});
}

const agents = () => [...document.querySelectorAll("[data-agent]")].map((li) => li.getAttribute("data-agent"));

beforeEach(() => {
  calls.length = 0;
  errors.length = 0;
  clipboard = "";
  clipboardFails = false;
  views = FIXTURES();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (text: string) => {
        if (clipboardFails) throw new Error("permissão negada");
        clipboard = text;
      },
    },
  });
});
afterEach(cleanup);

test("lists the agents with the installed count, the release and the notes", async () => {
  await show();
  expect(screen.getByText("1 de 2 instalados")).toBeTruthy();
  expect(agents()).toEqual(["codex", "aider"]);
  expect(screen.getByText("instalado")).toBeTruthy();
  expect(screen.getByText("não instalado")).toBeTruthy();
  expect(screen.getByText("encontrado em C:\\Users\\ana\\bin\\codex.cmd")).toBeTruthy();
  expect(screen.getByTitle("última versão v0.163.0").textContent).toBe("v0.163.0");
  expect(screen.getByText(/publicada há \d+ d/)).toBeTruthy();
  expect(screen.getByText(/O que mudou/)).toBeTruthy();
  expect(screen.getByText(/• corrige o modo plano/)).toBeTruthy();
});

test("the install command only shows for a missing CLI, and the copy button flashes", async () => {
  await show();
  expect(screen.queryByText("npm install -g codex")).toBeNull();
  expect(screen.getByText("pipx install aider-chat")).toBeTruthy();
  expect(document.querySelectorAll("code")).toHaveLength(1);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "copiar" })));
  expect(clipboard).toBe("pipx install aider-chat");
  expect(screen.getByText("comando copiado")).toBeTruthy();
});

test("a denied clipboard is reported instead of pretending it copied", async () => {
  clipboardFails = true;
  await show();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "copiar" })));
  expect(errors).toEqual(["não foi possível copiar o comando"]);
  expect(screen.queryByText("comando copiado")).toBeNull();
});

test("atualizar asks Rust to bypass the cache", async () => {
  await show();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "atualizar" })));
  expect(calls.filter((c) => c.cmd === "harness_list").map((c) => c.args)).toEqual([{ force: false }, { force: true }]);
});

test("one harness failing still shows the others, and a missing release says so", async () => {
  views = [row("claude", "Claude Code", { release: release("v2.1.302") }), row("crush", "Crush", { error: "sem resposta do GitHub" })];
  await show();
  expect(screen.getByText("0 de 2 instalados")).toBeTruthy();
  expect(screen.getByTitle("última versão v2.1.302").textContent).toBe("v2.1.302");
  expect(screen.getByRole("alert").textContent).toBe("sem resposta do GitHub");
  expect(screen.getByText("sem release publicada no GitHub")).toBeTruthy();
});

test("the GitHub button opens the release, and the repository when there is none", async () => {
  await show();
  const links = () => screen.getAllByRole("button", { name: "abrir no GitHub" });
  await act(async () => fireEvent.click(links()[0]));
  await act(async () => fireEvent.click(links()[1]));
  expect(calls.filter((c) => c.cmd === "open_link").map((c) => c.args)).toEqual([
    { url: "https://github.com/acme/codex/releases/tag/v0.163.0" },
    { url: "https://github.com/acme/aider" },
  ]);
});

test("nothing is executed from the tab: the footer says the command is only copied", async () => {
  await show();
  expect(screen.getByText(/nada é instalado pelo Canto/)).toBeTruthy();
  expect(calls.map((c) => c.cmd).some((c) => /run|exec|install/.test(c))).toBe(false);
});

test("each agent gets its provider mark, an unknown one falls back to its initial, and the bar follows the count", async () => {
  views = [row("claude", "Claude Code", { installed: true }), row("gemini", "Gemini CLI"), row("novo", "Novo CLI")];
  await show();
  const marks = (id: string) => document.querySelector(`[data-agent=${id}] [data-provider]`);
  expect(marks("claude")?.getAttribute("data-provider")).toBe("claude");
  expect(marks("claude")?.querySelector("svg")).toBeTruthy();
  expect(marks("gemini")?.querySelector("linearGradient")).toBeTruthy();
  expect(marks("novo")?.getAttribute("data-provider")).toBe("unknown");
  expect(marks("novo")?.textContent).toBe("N");
  const bar = screen.getByRole("progressbar");
  expect(bar.getAttribute("aria-valuenow")).toBe("1");
  expect(bar.getAttribute("aria-valuemax")).toBe("3");
});
