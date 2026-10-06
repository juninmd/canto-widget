import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
let status = { supported: true, enabled: false };
const day = new Date(2026, 8, 30).getTime() / 1000;
const summary = {
  spans: [
    { app: "Code", start: day + 9 * 3600, end: day + 11 * 3600 },
    { app: "Slack", start: day + 11 * 3600, end: day + 11.5 * 3600 },
  ],
  apps: [
    { app: "Code", secs: 7200 },
    { app: "Slack", secs: 1800 },
  ],
  total_secs: 9000,
  idle: [{ start: day + 11.5 * 3600, end: day + 12 * 3600 }],
  idle_secs: 1800,
  focus: [
    { task: "t1", title: "Revisar PR do cofre", secs: 3600 },
    { task: "gone", title: null, secs: 600 },
  ],
};
const empty = { spans: [], apps: [], total_secs: 0, idle: [], idle_secs: 0, focus: [] };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "activity_status") return Promise.resolve(status);
    if (cmd === "activity_set_enabled") {
      status = { ...status, enabled: args?.enabled as boolean };
      return Promise.resolve(null);
    }
    if (cmd === "activity_summary") return Promise.resolve((args?.fromMs as number) === day * 1000 ? summary : empty);
    return Promise.resolve(null);
  },
}));

const { default: ActivityTab } = await import("./ActivityTab");
const { default: ActivitySection } = await import("./ActivitySection");
const { ToastProvider } = await import("../lib/toast");

async function mount() {
  render(
    <ToastProvider>
      <ActivityTab today="2026-09-30" onError={() => {}} />
    </ToastProvider>,
  );
  for (let i = 0; i < 3; i++) await act(async () => {});
}

beforeEach(() => {
  localStorage.clear();
  calls.length = 0;
  status = { supported: true, enabled: false };
});
afterEach(cleanup);

async function turnOn() {
  status = { supported: true, enabled: true };
  await mount();
}
const click = async (el: HTMLElement) => {
  await act(async () => {
    fireEvent.click(el);
  });
};
const menuItem = async (name: string) => {
  await click(screen.getByRole("button", { name: "Mais ações" }));
  await click(screen.getByRole("menuitem", { name }));
};

test("tracking is off until the user asks, and says what it keeps and what it never does", async () => {
  await mount();
  expect(screen.getByText("Veja para onde o tempo vai")).toBeTruthy();
  expect(screen.getByText(/título de janela, texto ou capturas/)).toBeTruthy();
  expect(screen.getByText(/nome do aplicativo em foco e o tempo por tarefa/)).toBeTruthy();
  expect(calls.some((c) => c.cmd === "activity_summary")).toBe(false);
});

test("turning it on loads the day: the total in the donut, the legend, the idle time and the timeline", async () => {
  await mount();
  await click(screen.getByRole("button", { name: "Ativar coleta" }));
  for (let i = 0; i < 3; i++) await act(async () => {});
  expect(calls.some((c) => c.cmd === "activity_set_enabled" && c.args?.enabled === true)).toBe(true);
  expect(screen.getAllByText("2h30").length).toBeGreaterThan(0);
  expect(screen.getByRole("button", { name: /Código/ })).toBeTruthy();
  expect(screen.getByRole("button", { name: /Comunicação/ })).toBeTruthy();
  expect(screen.getByText("Parado 30 min")).toBeTruthy();
  expect(screen.getByRole("region", { name: "Linha do tempo" })).toBeTruthy();
  expect(screen.getByText("Maior bloco")).toBeTruthy();
  expect(screen.getByText("Hora de pico")).toBeTruthy();
});

test("the week view is a column chart of seven days, one summary call each, plus the hour heat map", async () => {
  await turnOn();
  await click(screen.getByRole("button", { name: "Semana" }));
  expect(calls.filter((c) => c.cmd === "activity_summary")).toHaveLength(7);
  expect(screen.getByRole("img", { name: "Tempo ativo por dia, últimos 7 dias" })).toBeTruthy();
  expect(screen.getByText("Quando você rende mais")).toBeTruthy();
  expect(screen.getByText(/Seu pico: 9h às 11h/)).toBeTruthy();
  expect(screen.getByText("Média por dia")).toBeTruthy();
});

test("a system that cannot tell the focused window says so instead of offering to track", async () => {
  status = { supported: false, enabled: false };
  await mount();
  expect(screen.getByText("Sem suporte neste sistema")).toBeTruthy();
  expect(screen.getByText(/Wayland/)).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Ativar coleta" })).toBeNull();
});

test("settings can turn tracking off and delete the history", async () => {
  status = { supported: true, enabled: true };
  render(
    <ToastProvider>
      <ActivitySection onError={() => {}} />
    </ToastProvider>,
  );
  await act(async () => {});
  const box = screen.getByLabelText("Registrar o aplicativo em uso") as HTMLInputElement;
  expect(box.checked).toBe(true);
  await act(async () => {
    fireEvent.click(box);
  });
  expect(calls.some((c) => c.cmd === "activity_set_enabled" && c.args?.enabled === false)).toBe(true);
  await act(async () => {
    fireEvent.click(screen.getByText("Apagar histórico"));
  });
  expect(calls.some((c) => c.cmd === "activity_clear")).toBe(true);
});

test("hiding a category in the legend takes its time out of the total, and hiding all of them says so", async () => {
  await turnOn();
  const code = screen.getByRole("button", { name: /Código/ });
  await click(code);
  expect(screen.getByRole("button", { name: /Código/ }).getAttribute("aria-pressed")).toBe("false");
  expect(screen.getAllByText("30 min").length).toBeGreaterThan(0);
  expect(screen.queryByText("2h30")).toBeNull();
  await click(screen.getByRole("button", { name: /Comunicação/ }));
  expect(screen.getByText(/Nenhuma categoria marcada/)).toBeTruthy();
});

test("the previous day is one tap away, and an empty day says so", async () => {
  await turnOn();
  expect((screen.getByRole("button", { name: "Próximo dia" }) as HTMLButtonElement).disabled).toBe(true);
  await click(screen.getByRole("button", { name: "Dia anterior" }));
  expect(screen.getByText("Ontem")).toBeTruthy();
  expect(screen.getByText("Ainda sem registros")).toBeTruthy();
});

test("the goal compares code time with the chosen goal, and the choice is remembered", async () => {
  await turnOn();
  expect(screen.getByText(/2h de 4h/)).toBeTruthy();
  expect(screen.getByText("faltam 2h")).toBeTruthy();
  await click(screen.getByRole("button", { name: "Ajustar" }));
  await click(screen.getByRole("button", { name: "2h" }));
  expect(screen.getByText("Meta cumprida")).toBeTruthy();
  expect(localStorage.getItem("canto.activity.goalMin")).toBe("120");
  await click(screen.getByRole("button", { name: "sem meta" }));
  expect(screen.getByText(/Sem meta definida/)).toBeTruthy();
});

test("the menu opens the goal editor and closes on Escape", async () => {
  await turnOn();
  await click(screen.getByRole("button", { name: "Mais ações" }));
  expect(screen.getByRole("menu")).toBeTruthy();
  await act(async () => {
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
  });
  expect(screen.queryByRole("menu")).toBeNull();
  await menuItem("Ajustar meta de foco");
  expect(screen.getByRole("group", { name: "Meta diária" })).toBeTruthy();
});

test("moving an app to another category is remembered and moves its time in the legend", async () => {
  await turnOn();
  await click(screen.getByRole("button", { name: /^Code/ }));
  expect(screen.getByRole("group", { name: "Code conta como" })).toBeTruthy();
  await click(screen.getByRole("button", { name: /Documentos/ }));
  expect(JSON.parse(localStorage.getItem("canto.activity.categories")!)).toEqual({ Code: "docs" });
  await click(screen.getByRole("button", { name: /^Code/ }));
  expect(screen.queryByRole("group", { name: "Code conta como" })).toBeNull();
  expect(screen.getByRole("button", { name: /Documentos/ })).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Código/ })).toBeNull();
});

test("the lists switch to the tasks the focus timer ran on, and a removed task keeps its time", async () => {
  await turnOn();
  await click(screen.getByRole("button", { name: "Tarefas" }));
  expect(screen.getByText("Revisar PR do cofre")).toBeTruthy();
  expect(screen.getByText("Tarefa removida")).toBeTruthy();
  expect(screen.getByText("Tempo do cronômetro de foco.")).toBeTruthy();
});

test("the day can be copied as text from the menu, tasks included, and the menu confirms it", async () => {
  await turnOn();
  let copied = "";
  Object.defineProperty(navigator, "clipboard", { value: { writeText: (x: string) => ((copied = x), Promise.resolve()) }, configurable: true });
  await menuItem("Copiar resumo do dia");
  expect(copied).toContain("Hoje: 2h30 ativo");
  expect(copied).toContain("- Código: 2h");
  expect(copied).toContain("Tarefas: Revisar PR do cofre 1h, Tarefa removida 10 min");
  expect(await screen.findByText("Resumo copiado")).toBeTruthy();
  expect(screen.queryByRole("menu")).toBeNull();
});

test("the week menu has no day-only actions", async () => {
  await turnOn();
  await click(screen.getByRole("button", { name: "Semana" }));
  await click(screen.getByRole("button", { name: "Mais ações" }));
  expect(screen.getByRole("menuitem", { name: "Atualizar agora" })).toBeTruthy();
  expect(screen.queryByRole("menuitem", { name: "Copiar resumo do dia" })).toBeNull();
  expect(screen.queryByRole("menuitem", { name: "Ajustar meta de foco" })).toBeNull();
});

test("refresh asks Rust for the week again", async () => {
  await turnOn();
  const before = calls.filter((c) => c.cmd === "activity_summary").length;
  await menuItem("Atualizar agora");
  expect(calls.filter((c) => c.cmd === "activity_summary").length).toBe(before + 7);
});
