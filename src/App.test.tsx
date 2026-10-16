import { afterEach, beforeEach, expect, jest, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

type Call = { cmd: string; args?: Record<string, unknown> };
const calls: Call[] = [];
let agendaItems: unknown[] = [];
let vaultStatus = { exists: true, unlocked: true };
let miniOn = false;
let statusFailures = 0;
let lockFails = false;
/** `null` keeps the app's default single pending alert; a list replaces it per test. */
let alertPayload: unknown[] | null = null;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    switch (cmd) {
      case "vault_status":
        if (statusFailures > 0) {
          statusFailures--;
          return Promise.reject("cofre ilegível");
        }
        return Promise.resolve(vaultStatus);
      case "vault_lock":
        return lockFails ? Promise.reject("falha ao trancar") : Promise.resolve(null);
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
        return Promise.resolve(alertPayload ?? [{ ...meetingIn(0), id: "task:t1", title: "pagar boleto", meet: "" }]);
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
  statusFailures = 0;
  lockFails = false;
  alertPayload = null;
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

test("maximized gives the open tab the whole width: no divider and no side column", async () => {
  render(<App />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "trocar modo do canto" }));
  await act(async () => {
    fireEvent.click(screen.getAllByRole("menuitemradio")[3]);
  });
  await settle();
  expect(fullscreenOn).toBe(true);
  expect(screen.getByRole("tablist")).toBeDefined();
  expect(screen.queryByRole("separator", { name: "largura da lista de tarefas" })).toBeNull();
  expect(screen.queryByRole("complementary", { name: "notificações" })).toBeNull();
  expect(screen.queryAllByRole("dialog").map((d) => d.getAttribute("aria-label"))).toEqual([]);
});

test("the bell on the maximized window opens the alerts screen", async () => {
  fullscreenOn = true;
  render(<App />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "avisos pendentes: 1" }));
  expect(within(screen.getByRole("dialog", { name: "notificações" })).getByText("pagar boleto")).toBeTruthy();
});

test("closing a card in the alerts screen tells Rust and reads the log again", async () => {
  render(<App />);
  await settle();
  const before = calls.filter((c) => c.cmd === "alert_log").length;
  fireEvent.click(screen.getByRole("button", { name: "avisos pendentes: 1" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "fechar" }));
  });
  await settle();
  expect(calls.find((c) => c.cmd === "alert_close")?.args?.id).toBe("task:t1");
  expect(calls.filter((c) => c.cmd === "alert_log").length, "the resolved list would stay stale").toBeGreaterThan(before);
});

test("with nothing pending the bell still reaches the alerts screen, where today's log lives", async () => {
  alertPayload = [];
  render(<App />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "avisos pendentes: 0" }));
  const panel = screen.getByRole("dialog", { name: "notificações" });
  expect(within(panel).getByText("nenhum aviso pendente")).toBeTruthy();
  expect(within(panel).getByText("nada resolvido ainda hoje")).toBeTruthy();
});

test("the alerts screen does not let another overlay open behind it", async () => {
  render(<App />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "avisos pendentes: 1" }));
  await act(async () => {
    fireEvent.keyDown(document.body, { key: "k", code: "KeyK", ctrlKey: true });
  });
  expect(screen.queryAllByRole("dialog").map((d) => d.getAttribute("aria-label"))).toEqual(["busca global"]);
});

test("a shortcut typed with the alerts screen up reaches the field, not the bell", async () => {
  render(<App />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "avisos pendentes: 1" }));
  // The two acts mirror the real order: the screen unmounts (and hands focus to the bell) before the field is focused.
  await act(async () => {
    fireEvent.keyDown(document.body, { key: "n", code: "KeyN" });
  });
  await act(async () => {
    jest.advanceTimersByTime(10);
  });
  await settle();
  expect(screen.queryAllByRole("dialog").map((d) => d.getAttribute("aria-label"))).toEqual([]);
  expect((document.activeElement as HTMLElement).dataset.shortcut, "the new-task field should have the focus").toBe("new");
});

test("a lock closes the alerts screen and it stays closed on the next unlock", async () => {
  render(<App />);
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "avisos pendentes: 1" }));
  expect(screen.queryAllByRole("dialog").map((d) => d.getAttribute("aria-label"))).toEqual(["notificações"]);
  vaultStatus = { exists: true, unlocked: false };
  await act(async () => listeners["canto://auto-lock"]({ payload: 15 }));
  await settle();
  expect(screen.queryAllByRole("dialog").map((d) => d.getAttribute("aria-label"))).toEqual([]);
  vaultStatus = { exists: true, unlocked: true };
  await act(async () => listeners["canto://auto-lock"]({ payload: 15 }));
  await settle();
  expect(screen.getByRole("tablist"), "the vault is unlocked again").toBeTruthy();
  expect(
    screen.queryAllByRole("dialog").map((d) => d.getAttribute("aria-label")),
    "the screen came back with the unlock",
  ).toEqual([]);
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

test("a lock that fails says so, keeps the tabs and rereads the real vault state", async () => {
  lockFails = true;
  render(<App />);
  await settle();
  const before = calls.filter((c) => c.cmd === "vault_status").length;
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "trancar" }));
  });
  await settle();
  expect(screen.getByText("Não foi possível trancar o cofre. falha ao trancar")).toBeTruthy();
  expect(calls.filter((c) => c.cmd === "vault_status").length, "the screen may disagree with Rust").toBeGreaterThan(before);
  expect(screen.getByRole("tablist")).toBeTruthy();
});

test("while the vault state loads there is a skeleton; if it fails, a banner with retry instead of a blank body", async () => {
  statusFailures = 1;
  render(<App />);
  expect(screen.getByRole("status", { name: "abrindo o cofre…" })).toBeTruthy();
  await settle();
  expect(screen.getByText("Não foi possível carregar. cofre ilegível")).toBeTruthy();
  expect(screen.queryByRole("tablist")).toBeNull();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  });
  await settle();
  expect(screen.queryByText(/Não foi possível carregar/)).toBeNull();
  expect(screen.getByRole("tablist")).toBeTruthy();
});

test("offline shows a chip in the header, and coming back rereads the agenda and tells the tabs to refresh", async () => {
  const set = (value: boolean) => Object.defineProperty(navigator, "onLine", { configurable: true, value });
  set(false);
  const refreshes: unknown[] = [];
  const on = (e: Event) => refreshes.push((e as CustomEvent).detail);
  window.addEventListener("canto:refresh", on);
  try {
    render(<App />);
    await settle();
    expect(screen.getByText("sem conexão")).toBeTruthy();
    const before = calls.filter((c) => c.cmd === "agenda_today").length;
    set(true);
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
    await settle();
    expect(screen.queryByText("sem conexão")).toBeNull();
    expect(calls.filter((c) => c.cmd === "agenda_today").length).toBeGreaterThan(before);
    expect(refreshes).toHaveLength(1);
  } finally {
    window.removeEventListener("canto:refresh", on);
    set(true);
  }
});

test("a pending alert puts a bell in the header that opens the alerts screen", async () => {
  render(<App />);
  await settle();
  expect(screen.queryAllByRole("dialog").map((d) => d.getAttribute("aria-label"))).toEqual([]);
  fireEvent.click(screen.getByRole("button", { name: "avisos pendentes: 1" }));
  const panel = screen.getByRole("dialog", { name: "notificações" });
  expect(within(panel).getByText("pagar boleto")).toBeTruthy();
  fireEvent.click(within(panel).getByRole("button", { name: "voltar" }));
  expect(screen.queryAllByRole("dialog").map((d) => d.getAttribute("aria-label"))).toEqual([]);
});

test("Ctrl+, opens settings, and the palette can open settings and refresh the current tab", async () => {
  const refreshes: unknown[] = [];
  const on = (e: Event) => refreshes.push((e as CustomEvent).detail);
  window.addEventListener("canto:refresh", on);
  try {
    render(<App />);
    await settle();
    await act(async () => {
      fireEvent.keyDown(window, { key: ",", code: "Comma", ctrlKey: true });
    });
    expect(screen.getByRole("tab", { name: "Ajustes" }).getAttribute("aria-selected")).toBe("true");

    await act(async () => {
      fireEvent.keyDown(window, { key: "P", code: "KeyP", ctrlKey: true, shiftKey: true });
    });
    fireEvent.change(screen.getByRole("combobox", { name: "paleta de comandos" }), { target: { value: "atualizar aba" } });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole("combobox", { name: "paleta de comandos" }), { key: "Enter" });
      jest.advanceTimersByTime(10);
    });
    expect(refreshes).toEqual([{ tab: "settings" }]);
  } finally {
    window.removeEventListener("canto:refresh", on);
  }
});

test("the header lock keeps its name when the label gives way on a narrow window", async () => {
  render(<App />);
  await settle();
  const lock = screen.getByRole("button", { name: "trancar" });
  expect(lock.getAttribute("aria-label")).toBe("trancar");
  expect(lock.querySelector("span")?.className).toContain("hidden @[24rem]:inline");
  expect(screen.getByRole("banner").className).toContain("@container");
});
