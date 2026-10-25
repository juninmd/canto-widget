import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AgendaItem, Task } from "../lib/api";
import type { Agenda } from "../lib/useAgenda";

const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
let tasks: Task[] = [];
let tasksFail = false;
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "tasks_for_day") return tasksFail ? Promise.reject("agenda das tarefas fora do ar") : Promise.resolve(tasks);
    if (cmd === "agenda_today") return Promise.resolve([]);
    return Promise.resolve(null);
  },
}));

const { default: AgendaTab } = await import("./AgendaTab");
const { savePicked } = await import("../lib/agendaPicked");

const TODAY = "2026-09-18";
const meeting: AgendaItem = {
  id: "e1", title: "Planejamento", start: "2026-09-18T17:00:00Z", end: "2026-09-18T18:00:00Z", all_day: false, location: "", meet: "", link: "",
};
const task = (id: string, extra: Partial<Task> = {}): Task => ({ id, title: id, done: false, day: TODAY, created_at: 1, updated_at: 1, ...extra });
const agenda = (over: Partial<Agenda> = {}): Agenda => ({ items: [], loading: false, error: "", reload: () => Promise.resolve(), ...over });
const count = (cmd: string) => calls.filter((c) => c.cmd === cmd).length;
const settle = async () => {
  for (let i = 0; i < 3; i++) await act(async () => {});
};

beforeEach(() => {
  calls.length = 0;
  tasks = [];
  tasksFail = false;
  localStorage.removeItem("canto.agendaView");
});
afterEach(() => {
  cleanup();
  savePicked(null);
});

test("a failed refresh keeps the events on screen under an alert with a retry", async () => {
  let reloads = 0;
  const live = agenda({ items: [meeting], error: "Google fora do ar", fetchedAt: new Date(2026, 8, 18, 14, 5).getTime(), reload: () => ((reloads += 1), Promise.resolve()) });
  render(<AgendaTab agenda={live} today={TODAY} onError={() => {}} />);
  await settle();
  expect(screen.getByRole("alert").textContent).toContain("Não foi possível atualizar. Mostrando os dados de 14:05. Google fora do ar");
  expect(screen.getByRole("button", { name: /Planejamento/ })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  expect(reloads).toBe(1);
});

test("without a Google account the empty state offers Ajustes; with one it just says there are no events", async () => {
  let opened = 0;
  const { unmount } = render(<AgendaTab agenda={agenda({ error: "entre com o Google para ver a agenda" })} today={TODAY} onError={() => {}} onOpenSettings={() => (opened += 1)} />);
  await settle();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.queryByText("nenhum evento hoje.")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Abrir Ajustes" }));
  expect(opened).toBe(1);
  unmount();
  render(<AgendaTab agenda={agenda()} today={TODAY} onError={() => {}} onOpenSettings={() => {}} />);
  await settle();
  expect(screen.getByText("nenhum evento hoje.")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Abrir Ajustes" })).toBeNull();
});

test("the menu and the refresh button say when the agenda was last fetched", async () => {
  render(<AgendaTab agenda={agenda({ items: [meeting], fetchedAt: new Date(2026, 8, 18, 9, 7).getTime() })} today={TODAY} onError={() => {}} />);
  await settle();
  expect(screen.getByRole("button", { name: "atualizar" }).getAttribute("title")).toContain("atualizado às 09:07");
  fireEvent.click(screen.getByRole("button", { name: "ações da agenda" }));
  expect(screen.getByText(/atualizado às 09:07/)).toBeTruthy();
});

test("the refresh button is busy and disabled while loading, with a spinner instead of dots, and also rereads the tasks", async () => {
  const { unmount } = render(<AgendaTab agenda={agenda({ loading: true, items: [meeting] })} today={TODAY} onError={() => {}} />);
  await settle();
  const busy = screen.getByRole("button", { name: "atualizar" }) as HTMLButtonElement;
  expect(busy.getAttribute("aria-busy")).toBe("true");
  expect(busy.disabled).toBe(true);
  expect(busy.textContent).not.toContain("...");
  expect(busy.querySelector("svg")).toBeTruthy();
  unmount();
  calls.length = 0;
  let reloads = 0;
  render(<AgendaTab agenda={agenda({ items: [meeting], reload: () => ((reloads += 1), Promise.resolve()) })} today={TODAY} onError={() => {}} />);
  await settle();
  const before = count("tasks_for_day");
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "atualizar" }));
  });
  expect(reloads).toBe(1);
  expect(count("tasks_for_day")).toBe(before + 1);
});

test("a task fetch failure is an inline alert with a retry, not a toast", async () => {
  tasksFail = true;
  const errors: string[] = [];
  render(<AgendaTab agenda={agenda({ items: [meeting] })} today={TODAY} onError={(m) => errors.push(m)} />);
  await settle();
  expect(screen.getByRole("alert").textContent).toContain("Não foi possível carregar as tarefas do dia. agenda das tarefas fora do ar");
  expect(errors).toEqual([]);
  tasksFail = false;
  tasks = [task("Revisar PR", { hora: "09:15" })];
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  });
  expect(screen.queryByRole("alert")).toBeNull();
});

test("the picked day survives leaving the tab and coming back", async () => {
  const first = render(<AgendaTab agenda={agenda()} today={TODAY} onError={() => {}} />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Dia anterior" }));
  });
  expect(screen.getByText("Ontem")).toBeTruthy();
  first.unmount();
  render(<AgendaTab agenda={agenda()} today={TODAY} onError={() => {}} />);
  await settle();
  expect(screen.getByText("Ontem")).toBeTruthy();
});

test("[ and ] step through the days and h goes back to today, but not while typing", async () => {
  render(<AgendaTab agenda={agenda()} today={TODAY} onError={() => {}} />);
  await settle();
  await act(async () => {
    fireEvent.keyDown(window, { key: "]" });
  });
  expect(screen.getByText("Amanhã")).toBeTruthy();
  for (let i = 0; i < 2; i++) {
    await act(async () => {
      fireEvent.keyDown(window, { key: "[" });
    });
  }
  expect(screen.getByText("Ontem")).toBeTruthy();
  await act(async () => {
    fireEvent.keyDown(screen.getByLabelText("Escolher o dia da agenda"), { key: "h" });
  });
  expect(screen.getByText("Ontem")).toBeTruthy();
  await act(async () => {
    fireEvent.keyDown(window, { key: "h" });
  });
  expect(screen.getByText("Hoje", { selector: "[aria-live]" })).toBeTruthy();
});

test("j opens today's Meet in progress, but not while typing and not on another day", async () => {
  const call: AgendaItem = {
    ...meeting,
    id: "call",
    start: new Date(2026, 8, 18, 10, 0).toISOString(),
    end: new Date(2026, 8, 18, 11, 0).toISOString(),
    meet: "https://meet.google.com/abc-defg-hij",
  };
  render(<AgendaTab agenda={agenda({ items: [call] })} today={TODAY} now={() => new Date(2026, 8, 18, 10, 20)} onError={() => {}} />);
  await settle();
  await act(async () => {
    fireEvent.keyDown(screen.getByLabelText("Escolher o dia da agenda"), { key: "j" });
  });
  expect(count("open_link")).toBe(0);
  await act(async () => {
    fireEvent.keyDown(window, { key: "j" });
  });
  expect(calls.filter((c) => c.cmd === "open_link").map((c) => c.args?.url)).toEqual([call.meet]);
  await act(async () => {
    fireEvent.keyDown(window, { key: "]" });
  });
  await act(async () => {
    fireEvent.keyDown(window, { key: "J" });
  });
  expect(count("open_link")).toBe(1);
});

test("coming back to the window refetches another day's events, not more than once a burst", async () => {
  const real = Date.now;
  let offset = 0;
  Date.now = () => real() + offset;
  try {
    render(<AgendaTab agenda={agenda()} today={TODAY} onError={() => {}} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Dia anterior" }));
    });
    expect(count("agenda_today")).toBe(1);
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(count("agenda_today"), "just fetched: no new trip").toBe(1);
    offset = 60_000;
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(count("agenda_today")).toBe(2);
  } finally {
    Date.now = real;
  }
});

test("booking a task from the tray confirms it with a message", async () => {
  tasks = [task("Escrever changelog", { estimate_min: 30 })];
  const said: string[] = [];
  render(<AgendaTab agenda={agenda()} today={TODAY} now={() => new Date(2026, 8, 18, 8, 50)} onError={() => {}} onBooked={(m) => said.push(m)} />);
  await settle();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /Escrever changelog/ }));
  });
  expect(said).toEqual(["Escrever changelog agendada às 09:00"]);
});

test("the palette's refresh request reloads the agenda and the tasks, but not when aimed at another tab", async () => {
  const { requestRefresh } = await import("../lib/refreshEvent");
  let reloads = 0;
  render(<AgendaTab agenda={agenda({ items: [meeting], reload: () => ((reloads += 1), Promise.resolve()) })} today={TODAY} onError={() => {}} />);
  await settle();
  const before = count("tasks_for_day");
  await act(async () => requestRefresh("notes"));
  expect(reloads).toBe(0);
  await act(async () => requestRefresh("agenda"));
  expect(reloads).toBe(1);
  expect(count("tasks_for_day")).toBe(before + 1);
});
