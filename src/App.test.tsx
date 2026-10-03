import { afterEach, beforeEach, expect, jest, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
let agendaItems: unknown[] = [];
let vaultStatus = { exists: true, unlocked: true };
let miniOn = false;

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
      case "window_config":
        return Promise.resolve({ position: null, size: null, always_on_top: true, mini: miniOn });
      case "window_mini_set":
        miniOn = args?.enabled === true;
        return Promise.resolve(null);
      case "alert_payload":
        return Promise.resolve([{ ...meetingIn(0), id: "task:t1", title: "pagar boleto", meet: "" }]);
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
let hidden = false;
mock.module("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    hide: () => {
      hidden = true;
      return Promise.resolve();
    },
    isFullscreen: () => Promise.resolve(fullscreenOn),
    setFullscreen: (v: boolean) => {
      fullscreenOn = v;
      return Promise.resolve();
    },
    onResized: () => Promise.resolve(() => {}),
  }),
}));
const listeners: Record<string, (e?: unknown) => void> = {};
mock.module("@tauri-apps/api/event", () => ({
  // Mocks are process-wide: AlertWindow imports `emit` from the same module.
  emit: () => Promise.resolve(),
  listen: (event: string, cb: (e?: unknown) => void) => {
    listeners[event] = cb;
    return Promise.resolve(() => {});
  },
}));

const { default: App } = await import("./App");
// Notes loads its editor lazily; warming the module keeps that load off the fake clock below.
await import("./components/NoteEditor");

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
  miniOn = false;
  fullscreenOn = false;
  hidden = false;
  localStorage.clear();
  // Before render: the alert clock is created when App mounts.
  jest.useFakeTimers();
});

afterEach(() => {
  cleanup();
  // The note editor tears down on a timer; left pending under fake timers it stalls later files' waitFor.
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
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
  expect(calls.find((c) => c.cmd === "language_set")?.args, "Rust notifications follow the UI language").toEqual({ lang: "pt-BR" });
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

test("completing from the pop-up window updates the open list", async () => {
  render(<App />);
  await settle();
  const reads = () => calls.filter((c) => c.cmd === "tasks_for_day").length;
  const before = reads();
  await act(async () => listeners["canto://tasks-changed"]());
  await settle();
  expect(reads(), "the tab would keep showing the task as open").toBeGreaterThan(before);
});

test("the widget never renders the alert: the pop-up has its own window", async () => {
  render(<App />);
  await settle();
  // The widget only listens to feed the mini dock; a ringing alert never opens a dialog over it.
  await act(async () => listeners["canto://alert"]());
  await settle();
  expect(screen.queryByRole("alertdialog")).toBeNull();
});

test("the pop-up asks the widget to open a tab", async () => {
  render(<App />);
  await settle();
  await act(async () => listeners["canto://open-tab"]({ payload: "settings" }));
  expect(document.getElementById("aba-settings")?.getAttribute("aria-selected")).toBe("true");
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

test("an unsaved note draft survives switching to another tab and back", async () => {
  render(<App />);
  await settle();
  const toNotes = async () => {
    await act(async () => {
      fireEvent.keyDown(window, { key: "2", code: "Digit2", altKey: true });
      jest.advanceTimersByTime(200);
    });
    await settle();
  };
  await toNotes();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "novo card" }));
  });
  await settle();
  fireEvent.change(screen.getByPlaceholderText("título"), { target: { value: "rascunho fictício" } });
  await act(async () => {
    fireEvent.keyDown(window, { key: "1", code: "Digit1", altKey: true });
  });
  await settle();
  expect(screen.getByRole("tab", { name: "Tarefas" }).getAttribute("aria-selected")).toBe("true");
  await toNotes();
  expect((screen.getByPlaceholderText("título") as HTMLInputElement).value).toBe("rascunho fictício");
});

test("the mode icon lists the four modes and marks the current one", async () => {
  render(<App />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "trocar modo do canto" }));
  const items = screen.getAllByRole("menuitemradio");
  expect(items.map((i) => i.querySelector("span.block")?.textContent)).toEqual(["Mini", "Escondido", "Normal", "Maximizado"]);
  expect(items.filter((i) => i.getAttribute("aria-checked") === "true")).toHaveLength(1);
  expect(items[2].getAttribute("aria-checked")).toBe("true");
});

test("picking Mini shrinks the window to the dock and Rust leaves fullscreen on its own", async () => {
  render(<App />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "trocar modo do canto" }));
  await act(async () => {
    fireEvent.click(screen.getAllByRole("menuitemradio")[0]);
  });
  await settle();
  expect(calls.some((c) => c.cmd === "window_mini_set" && c.args?.enabled === true)).toBe(true);
  expect(screen.getByRole("group", { name: "avisos pendentes" })).toBeDefined();
  expect(screen.queryByRole("tablist")).toBeNull();
  expect(localStorage.getItem("canto.mini"), "a restart would flash the whole UI in a 24 px window").toBe("1");
});

test("clicking an alert in the dock opens the normal window with that alert on top", async () => {
  miniOn = true;
  render(<App />);
  await settle();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "abrir pagar boleto" }));
  });
  await settle();
  expect(calls.some((c) => c.cmd === "window_mini_set" && c.args?.enabled === false)).toBe(true);
  const focus = screen.getByRole("region", { name: "aviso em foco" });
  expect(focus.textContent).toContain("pagar boleto");
  expect(screen.getByRole("tablist")).toBeDefined();
});

test("the dock keeps asking Rust for the window size it needs", async () => {
  miniOn = true;
  render(<App />);
  await settle();
  const resize = calls.filter((c) => c.cmd === "window_mini_resize");
  expect(resize.length).toBeGreaterThan(0);
  expect(resize[0].args).toEqual({ width: 24, height: 100 });
});

test("a tab requested by the pop-up brings the dock back to the normal window", async () => {
  miniOn = true;
  render(<App />);
  await settle();
  await act(async () => listeners["canto://open-tab"]({ payload: "settings" }));
  await settle();
  expect(calls.some((c) => c.cmd === "window_mini_set" && c.args?.enabled === false)).toBe(true);
});

test("maximized shows the agenda beside the task list", async () => {
  agendaItems = [meetingIn(60)];
  render(<App />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "trocar modo do canto" }));
  await act(async () => {
    fireEvent.click(screen.getAllByRole("menuitemradio")[3]);
  });
  await settle();
  expect(fullscreenOn).toBe(true);
  expect(screen.getByText("agenda de hoje")).toBeDefined();
  expect(screen.getAllByText("Daily").length).toBeGreaterThan(0);
});

test("hidden from the mode icon hides the window like the minus button", async () => {
  render(<App />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "trocar modo do canto" }));
  await act(async () => {
    fireEvent.click(screen.getAllByRole("menuitemradio")[1]);
  });
  expect(hidden).toBe(true);
});
