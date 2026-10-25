import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    if (cmd === "drive_status") return Promise.resolve({ configured: true, embedded: true, connected: false, email: "" });
    if (cmd === "sync_get") return Promise.resolve(null);
    return Promise.resolve(null);
  },
}));
mock.module("@tauri-apps/api/event", () => ({
  emit: () => Promise.resolve(),
  listen: () => Promise.resolve(() => {}),
}));

const { default: SettingsTab } = await import("./SettingsTab");
const { ToastProvider } = await import("../lib/toast");

let shortcuts = 0;

async function mount(focus: "google" | null = null) {
  render(
    <ToastProvider>
      <SettingsTab
        onError={() => {}}
        hiddenTabs={[]}
        onHiddenTabs={() => {}}
        layout="horizontal"
        onLayout={() => {}}
        pinned={false}
        onPinned={() => {}}
        reminderLead={5}
        onReminderLead={() => {}}
        onShowShortcuts={() => shortcuts++}
        focus={focus}
      />
    </ToastProvider>,
  );
  await act(async () => {});
}

const toggle = (name: string) => screen.getByRole("button", { name }) as HTMLButtonElement;

beforeEach(() => {
  shortcuts = 0;
  localStorage.removeItem("canto.settingsGroups");
});
afterEach(cleanup);

test("settings come in five groups, only the first one open", async () => {
  await mount();
  const names = ["Aparência", "Notificações", "Privacidade e segurança", "Dados e contas", "Aplicativo"];
  expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(names);
  expect(toggle("Aparência").getAttribute("aria-expanded")).toBe("true");
  for (const name of names.slice(1)) expect(toggle(name).getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("group", { name: "Backup" })).toBeNull();
  expect(screen.getByRole("group", { name: "Tema" })).toBeTruthy();
});

test("opening a group is remembered for the next visit", async () => {
  await mount();
  fireEvent.click(toggle("Aplicativo"));
  expect(toggle("Aplicativo").getAttribute("aria-expanded")).toBe("true");
  expect(JSON.parse(localStorage.getItem("canto.settingsGroups")!)).toEqual(["appearance", "app"]);
  cleanup();
  await mount();
  expect(toggle("Aplicativo").getAttribute("aria-expanded")).toBe("true");
});

test("the app group holds autostart under its own heading and a shortcuts button that opens the help", async () => {
  await mount();
  fireEvent.click(toggle("Aplicativo"));
  expect(screen.getByRole("group", { name: "Início automático" })).toBeTruthy();
  const row = screen.getByRole("group", { name: "Atalhos" });
  fireEvent.click(within(row).getByRole("button", { name: "ver todos os atalhos" }));
  expect(shortcuts).toBe(1);
});

test("search finds a setting by its keywords and opens the group that holds it", async () => {
  await mount();
  const box = screen.getByRole("searchbox", { name: "buscar ajuste" });
  fireEvent.change(box, { target: { value: "senha" } });
  expect(toggle("Privacidade e segurança").getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("group", { name: "Segurança" })).toBeTruthy();
  expect(screen.queryByRole("group", { name: "Tema" })).toBeNull();
  expect(screen.queryByRole("heading", { level: 2, name: "Aparência" })).toBeNull();
});

test("the clipboard's pinned limit lives in the data group and is found by 'fixados' or 'pinned'", async () => {
  await mount();
  for (const word of ["fixados", "pinned"]) {
    fireEvent.change(screen.getByRole("searchbox", { name: "buscar ajuste" }), { target: { value: word } });
    expect(toggle("Dados e contas").getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("group", { name: "Histórico do clipboard" })).toBeTruthy();
    expect(screen.queryByRole("group", { name: "Tema" })).toBeNull();
  }
});

test("a search with no match says so in a live region, and clearing it brings the groups back", async () => {
  await mount();
  const box = screen.getByRole("searchbox", { name: "buscar ajuste" });
  fireEvent.change(box, { target: { value: "zzzz" } });
  const live = box.parentElement!.querySelector("[role=status]")!;
  expect(live.textContent).toBe("nenhum ajuste encontrado para “zzzz”");
  fireEvent.change(box, { target: { value: "" } });
  expect(live.textContent).toBe("");
  expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(5);
});

test("password, backup and sync sit under a 'Zona sensível' heading, one level below the group", async () => {
  await mount();
  fireEvent.click(toggle("Dados e contas"));
  const zone = screen.getByRole("group", { name: "Zona sensível" });
  expect(within(zone).getByRole("heading", { level: 4, name: "Backup" })).toBeTruthy();
  expect(within(zone).getByRole("heading", { level: 4, name: "Pasta sincronizada" })).toBeTruthy();
  expect(screen.getByRole("heading", { level: 3, name: "Zona sensível" })).toBeTruthy();
});

test("the search field stays stuck to the top of the scroller while the groups scroll", async () => {
  await mount();
  const bar = document.querySelector("[data-settings-search]")!;
  expect(bar.className).toContain("sticky");
  expect(bar.className).toContain("top-0");
  expect(bar.contains(screen.getByLabelText("buscar ajuste"))).toBe(true);
  expect(bar.parentElement!.className).toContain("overflow-y-auto");
});

test("a 'configure' jump opens the section's group and scrolls to it, without saving the open groups", async () => {
  const scrolled: string[] = [];
  const original = HTMLElement.prototype.scrollIntoView;
  HTMLElement.prototype.scrollIntoView = function (this: HTMLElement) {
    scrolled.push(this.getAttribute("data-settings-section") ?? "");
  };
  try {
    await mount("google");
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
    expect(toggle("Dados e contas").getAttribute("aria-expanded")).toBe("true");
    expect(toggle("Aparência").getAttribute("aria-expanded")).toBe("true");
    expect(scrolled).toEqual(["google"]);
    expect(localStorage.getItem("canto.settingsGroups") === null).toBe(true);
  } finally {
    HTMLElement.prototype.scrollIntoView = original;
  }
});
