import { afterEach, beforeEach, expect, jest, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
let agendaItems: unknown[] = [];
let vaultStatus = { exists: true, unlocked: true };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    switch (cmd) {
      case "vault_status":
        return Promise.resolve(vaultStatus);
      case "vault_create":
      case "vault_unlock":
        vaultStatus = { exists: true, unlocked: true };
        return Promise.resolve(null);
      case "agenda_today":
        return Promise.resolve(agendaItems);
      case "alert_payload":
        return Promise.resolve({ ...meetingIn(0), id: "task:t1", title: "pagar boleto", meet: "" });
      case "notes_search":
        return Promise.resolve(
          args?.query === "reuniao"
            ? { total: 1, items: [{ id: "n1", title: "ata reuniao", body: "", tags: [], created_at: 1, updated_at: 1 }] }
            : { total: 0, items: [] },
        );
      case "tasks_for_day":
      case "transcripts_list":
        return Promise.resolve([]);
      case "clip_list":
        return Promise.resolve({ items: [], max_pinned: 100 });
      case "drive_status":
        return Promise.resolve({ configured: false, connected: false, email: "" });
      default:
        return Promise.resolve(null);
    }
  },
}));
let fullscreenOn = false;
mock.module("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    hide: () => Promise.resolve(),
    isFullscreen: () => Promise.resolve(fullscreenOn),
    setFullscreen: (v: boolean) => {
      fullscreenOn = v;
      return Promise.resolve();
    },
    onResized: () => Promise.resolve(() => {}),
  }),
}));
const listeners: Record<string, () => void> = {};
mock.module("@tauri-apps/api/event", () => ({
  listen: (event: string, cb: () => void) => {
    listeners[event] = cb;
    return Promise.resolve(() => {});
  },
}));

const { default: App } = await import("./App");

const meetingIn = (minutes: number) => ({
  id: "reuniao-1",
  title: "Daily",
  start: new Date(Date.now() + minutes * 60_000).toISOString(),
  end: new Date(Date.now() + (minutes + 30) * 60_000).toISOString(),
  all_day: false,
  location: "",
  meet: "https://meet.google.com/aaa-bbbb-ccc",
  link: "",
});

/** Lets React settle command promises before continuing. */
async function settle() {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

beforeEach(() => {
  calls.length = 0;
  agendaItems = [];
  vaultStatus = { exists: true, unlocked: true };
  localStorage.clear();
  // Before render: the alert clock is created when App mounts.
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  cleanup();
});

test("warns of the meeting with the user on the tasks tab", async () => {
  agendaItems = [meetingIn(0.5)];
  render(<App />);
  await settle();

  // No tab was switched: the widget opens on "tasks".
  expect(calls.some((c) => c.cmd === "tasks_for_day")).toBe(true);
  expect(calls.some((c) => c.cmd === "agenda_today")).toBe(true);
  expect(calls.some((c) => c.cmd === "alert_open")).toBe(false);

  await act(async () => {
    jest.advanceTimersByTime(30_000);
    await Promise.resolve();
  });

  const alertCall = calls.find((c) => c.cmd === "alert_open");
  expect(alertCall, "the pop-up only fires with the agenda tab mounted").toBeDefined();
  expect((alertCall?.args?.event as { id: string }).id).toBe("reuniao-1");
});

test("does not warn twice about the same meeting", async () => {
  agendaItems = [meetingIn(0.5)];
  render(<App />);
  await settle();

  await act(async () => {
    jest.advanceTimersByTime(120_000);
    await Promise.resolve();
  });

  expect(calls.filter((c) => c.cmd === "alert_open")).toHaveLength(1);
});

test("a distant meeting does not trigger a pop-up", async () => {
  agendaItems = [meetingIn(45)];
  render(<App />);
  await settle();

  await act(async () => {
    jest.advanceTimersByTime(120_000);
    await Promise.resolve();
  });

  expect(calls.some((c) => c.cmd === "alert_open")).toBe(false);
});

test("task reminders ring from Rust: the UI only pushes the lead time", async () => {
  render(<App />);
  await settle();
  expect(calls.find((c) => c.cmd === "reminder_lead_set")?.args).toEqual({ minutes: 0 });
  expect(calls.some((c) => c.cmd === "tasks_reminders")).toBe(false);
});

test("Alt+2 goes to notes and ? opens the shortcuts help, which closes with Esc", async () => {
  render(<App />);
  await settle();

  await act(async () => {
    fireEvent.keyDown(window, { key: "2", code: "Digit2", altKey: true });
  });
  expect(screen.getByRole("tab", { name: "Notas" }).getAttribute("aria-selected")).toBe("true");

  await act(async () => {
    fireEvent.keyDown(document.body, { key: "?" });
  });
  const dialog = screen.getByRole("dialog", { name: "Atalhos de teclado" });
  expect(screen.getByLabelText("Alt + L")).toBeTruthy();
  expect(dialog.textContent).toContain("trancar o cofre");
  await act(async () => {
    fireEvent.keyDown(screen.getByRole("button", { name: "fechar" }), { key: "Escape" });
  });
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("N outside a text field moves focus to the new task field", async () => {
  render(<App />);
  await settle();
  await act(async () => {
    fireEvent.keyDown(document.body, { key: "n" });
  });
  expect((document.activeElement as HTMLInputElement).placeholder).toMatch(/^nova tarefa/);
});

test("Tab inside the shortcuts help does not escape the modal", async () => {
  render(<App />);
  await settle();
  await act(async () => {
    fireEvent.keyDown(document.body, { key: "?" });
  });
  const closeButton = screen.getByRole("button", { name: "fechar" });
  await act(async () => {
    fireEvent.keyDown(closeButton, { key: "Tab" });
  });
  expect(document.activeElement).toBe(closeButton);
});

test("completing from the task alert updates the open list", async () => {
  render(<App />);
  await settle();
  const reads = () => calls.filter((c) => c.cmd === "tasks_for_day").length;
  const before = reads();
  await act(async () => listeners["canto://alert"]());
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "concluir tarefa" }));
  await settle();
  expect(calls.some((c) => c.cmd === "task_complete")).toBe(true);
  expect(reads(), "the tab would keep showing the task as open").toBeGreaterThan(before);
});

test("Ctrl+K opens the global search; picking a note result jumps to Notes with the query seeded", async () => {
  render(<App />);
  await settle();

  await act(async () => {
    fireEvent.keyDown(document.body, { key: "k", code: "KeyK", ctrlKey: true });
  });
  const dialog = screen.getByRole("dialog", { name: "busca global" });

  await act(async () => {
    fireEvent.change(screen.getByPlaceholderText("buscar em tarefas de hoje, notas e clipboard"), {
      target: { value: "reuniao" },
    });
    jest.advanceTimersByTime(150);
    await Promise.resolve();
  });
  await settle();

  fireEvent.click(screen.getByRole("button", { name: "notas →" }));
  await settle();

  expect(dialog.isConnected, "the overlay should have closed").toBe(false);
  expect(screen.getByRole("tab", { name: "Notas" }).getAttribute("aria-selected")).toBe("true");
  expect((screen.getByLabelText("buscar notas") as HTMLInputElement).value).toBe("reuniao");
});

test("creating the vault shows onboarding once; a later unlock never shows it again", async () => {
  vaultStatus = { exists: false, unlocked: false };
  render(<App />);
  await settle();

  fireEvent.change(screen.getByLabelText("senha mestra"), { target: { value: "abcd" } });
  fireEvent.change(screen.getByLabelText("repita a senha"), { target: { value: "abcd" } });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Criar cofre" }));
  });
  await settle();

  expect(calls.some((c) => c.cmd === "vault_create")).toBe(true);
  const dialog = screen.getByRole("dialog", { name: "Bem-vindo ao canto" });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "entendi" }));
  });
  expect(dialog.isConnected).toBe(false);

  // Locking and unlocking again afterwards must not bring onboarding back.
  cleanup();
  vaultStatus = { exists: true, unlocked: true };
  render(<App />);
  await settle();
  expect(screen.queryByRole("dialog", { name: "Bem-vindo ao canto" })).toBeNull();
});

test("F11 enters and exits fullscreen, and the top button reflects the state", async () => {
  fullscreenOn = false;
  render(<App />);
  await settle();
  await act(async () => {
    fireEvent.keyDown(document.body, { key: "F11", code: "F11" });
  });
  await settle();
  expect(fullscreenOn).toBe(true);
  const button = screen.getByRole("button", { name: "sair da tela cheia" });
  expect(button.getAttribute("aria-pressed")).toBe("true");
  await act(async () => {
    fireEvent.click(button);
  });
  await settle();
  expect(fullscreenOn).toBe(false);
  expect(screen.getByRole("button", { name: "tela cheia" })).toBeTruthy();
});
