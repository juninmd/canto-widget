import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { SystemSnapshot } from "../../lib/api";

const GB = 1024 ** 3;
const calls: { cmd: string; args: Record<string, unknown> }[] = [];
let snap: SystemSnapshot;
let alertsOn: string[] = [];

const BASE: SystemSnapshot = {
  at: 0,
  uptime_secs: 3 * 86400 + 4 * 3600,
  cpu: { usage: 54, brand: "Processador Exemplo 8 núcleos", cores: 16, freq_mhz: 4200, temp_c: 67 },
  gpus: [{ name: "Placa de Vídeo Exemplo", usage: 34, mem_used: 3 * GB, mem_total: 8 * GB }],
  memory: { used: 57.6 * GB, total: 64 * GB, swap_used: 0, swap_total: 0 },
  disks: [
    { name: "Sistema", mount: "C:\\", fs: "NTFS", total: 512 * GB, available: 66 * GB, system: true, removable: false, ssd: true },
    { name: "Dados", mount: "D:\\", fs: "NTFS", total: 2048 * GB, available: 900 * GB, system: false, removable: false, ssd: false },
  ],
  disk_io: { down_bps: 555 * 1024, up_bps: 3.22 * 1024 * 1024, down_total: 6 * 1024 * GB, up_total: 12 * 1024 * GB },
  network: { down_bps: 7.96 * 1024, up_bps: 4.62 * 1024, down_total: 40 * GB, up_total: 3 * GB },
  interface: "Wi-Fi",
  battery: { percent: 90, state: "paused", rate_w: 41, temp_c: 37, health: 84.1, cycles: 248, voltage_v: 11.08, full_wh: 58, design_wh: 69, minutes: null },
  apps: [
    { name: "Navegador", count: 61, cpu: 12.4, memory: 13.8 * GB },
    { name: "Editor de código", count: 30, cpu: 30.2, memory: 5 * GB },
  ],
  history: { cpu: [40, 50, 54], memory: [88, 89, 90], cpu_temp: [65, 66, 67], net_down: [1, 2, 3], net_up: [1, 1, 1], disk_read: [1], disk_write: [1] },
};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "system_get") return Promise.resolve(snap);
    if (cmd === "system_alerts_get") return Promise.resolve(alertsOn);
    if (cmd === "system_alerts_set") return Promise.resolve(args.kinds);
    return Promise.resolve(null);
  },
}));

const { default: SystemTab } = await import("./SystemTab");

async function open() {
  render(<SystemTab />);
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
  snap = BASE;
  alertsOn = [];
  localStorage.removeItem("canto.systemSub");
});
afterEach(cleanup);

test("the overview shows every part of the machine with its share", async () => {
  await open();
  expect(screen.getByText("Processador Exemplo 8 núcleos")).toBeTruthy();
  expect(screen.getByText("57,6 GB de 64,0 GB")).toBeTruthy();
  expect(screen.getByText("Pressão elevada")).toBeTruthy();
  expect(screen.getByText("66,0 GB livres de 512 GB")).toBeTruthy();
  expect(screen.getByText("Wi-Fi")).toBeTruthy();
  expect(screen.getByText("ligado há 3 d 4 h")).toBeTruthy();
  expect(screen.getByText("1 ponto de atenção")).toBeTruthy();
  expect(screen.getByText("Memória em 90%")).toBeTruthy();
});

test("a health chip opens the part that needs a look", async () => {
  await open();
  await act(async () => {
    fireEvent.click(screen.getByText("Memória em 90%"));
  });
  expect(document.querySelector("[data-system-tab]")?.getAttribute("data-system-tab")).toBe("memory");
});

test("the actions menu pauses the readings and resumes them", async () => {
  await open();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("Ações do sistema"));
  });
  await act(async () => {
    fireEvent.click(screen.getByText("Pausar leitura"));
  });
  expect(screen.getByText("Pausado")).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("Ações do sistema"));
  });
  await act(async () => {
    fireEvent.click(screen.getByText("Retomar leitura"));
  });
  expect(screen.getByText("Ao vivo")).toBeTruthy();
});

test("the apps filter narrows the list and says when nothing matches", async () => {
  localStorage.setItem("canto.systemSub", "cpu");
  await open();
  const input = screen.getByLabelText("Filtrar apps");
  await act(async () => {
    fireEvent.change(input, { target: { value: "codigo" } });
  });
  expect(document.querySelectorAll("[data-system-apps] li").length).toBe(1);
  await act(async () => {
    fireEvent.change(input, { target: { value: "zzz" } });
  });
  expect(screen.getByText("Nenhum app com \u201czzz\u201d.")).toBeTruthy();
});

test("volume chips filter the other disks by kind", async () => {
  snap = { ...BASE, disks: [...BASE.disks, { name: "Pen", mount: "E:\\", fs: "FAT32", total: 32 * GB, available: 10 * GB, system: false, removable: true, ssd: null }] };
  localStorage.setItem("canto.systemSub", "disk");
  await open();
  await act(async () => {
    fireEvent.click(screen.getByText("Removíveis"));
  });
  expect(screen.getByText("E:\\")).toBeTruthy();
  expect(screen.queryByText("D:\\") === null).toBe(true);
});

test("a card opens its sub-tab, and the choice is remembered", async () => {
  await open();
  await act(async () => {
    fireEvent.click(screen.getByText("disco do sistema").closest("button")!);
  });
  expect(localStorage.getItem("canto.systemSub")).toBe("disk");
  expect(screen.getByText("555 KB/s")).toBeTruthy();
  expect(screen.getByText("D:\\")).toBeTruthy();
});

test("the memory sub-tab lists apps by memory and flips to CPU", async () => {
  localStorage.setItem("canto.systemSub", "memory");
  await open();
  const names = () => [...document.querySelectorAll("[data-system-apps] li")].map((li) => li.textContent);
  expect(names()[0]).toContain("Navegador(61)");
  expect(names()[0]).toContain("13,8 GB");
  await act(async () => {
    fireEvent.click(screen.getByLabelText("ordenar por CPU"));
  });
  expect(names()[0]).toContain("Editor de código");
});

test("no GPU, no GPU sub-tab; no battery says so", async () => {
  snap = { ...BASE, gpus: [], battery: null };
  localStorage.setItem("canto.systemSub", "power");
  await open();
  expect(screen.queryByRole("tab", { name: "GPU" }) === null).toBe(true);
  expect(screen.getByText("Nenhuma bateria encontrada: este computador funciona na tomada.")).toBeTruthy();
});

test("the power sub-tab shows the battery details and its worn capacity", async () => {
  localStorage.setItem("canto.systemSub", "power");
  await open();
  expect(screen.getByText("Conectado · sem carregar")).toBeTruthy();
  expect(screen.getByText("84,1%")).toBeTruthy();
  expect(screen.getByText("248")).toBeTruthy();
  expect(screen.getByText("69,0 Wh")).toBeTruthy();
});

test("a CPU without a readable sensor says so instead of a fake number", async () => {
  snap = { ...BASE, cpu: { ...BASE.cpu, temp_c: null } };
  localStorage.setItem("canto.systemSub", "cpu");
  await open();
  expect(screen.getByText("O sensor de temperatura não está acessível neste computador.")).toBeTruthy();
  expect(screen.getByText("4,2")).toBeTruthy();
});

test("system alerts switch on one kind at a time, in the switches' order", async () => {
  alertsOn = ["battery_low"];
  await open();
  await act(async () => {
    fireEvent.click(screen.getByText("Avisos do sistema"));
  });
  await act(async () => {
    fireEvent.click(screen.getByText("Memória acima de 90%"));
  });
  expect(calls.find((c) => c.cmd === "system_alerts_set")?.args).toEqual({ kinds: ["memory", "battery_low"] });
});
