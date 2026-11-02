import type { SystemSnapshot } from "../../src/lib/api";

const GB = 1024 ** 3;
const MB = 1024 ** 2;

/** A smooth fictitious minute: a base, a slow wave and a little jitter, 30 points like the real poll. */
function wave(base: number, swing: number, seed: number, n = 30): number[] {
  return Array.from({ length: n }, (_, i) => Math.max(0, base + swing * Math.sin(i / 4 + seed) + swing * 0.35 * Math.sin(i * 1.7 + seed * 3)));
}

export const SYSTEM_SNAPSHOT: SystemSnapshot = {
  at: Date.parse("2026-10-09T10:20:00-03:00"),
  uptime_secs: 3 * 86400 + 4 * 3600 + 12 * 60,
  cpu: { usage: 54, brand: "Processador Exemplo X16", cores: 32, freq_mhz: 4200, temp_c: 67 },
  gpus: [{ name: "Placa de Vídeo Exemplo 12 GB", usage: 34, mem_used: 4.6 * GB, mem_total: 12 * GB }],
  memory: { used: 57.7 * GB, total: 64 * GB, swap_used: 2.1 * GB, swap_total: 16 * GB },
  disks: [
    { name: "Sistema", mount: "C:\\", fs: "NTFS", total: 512 * GB, available: 66 * GB, system: true, removable: false, ssd: true },
    { name: "Jogos", mount: "D:\\", fs: "NTFS", total: 2048 * GB, available: 912 * GB, system: false, removable: false, ssd: true },
    { name: "Backup", mount: "E:\\", fs: "exFAT", total: 1024 * GB, available: 88 * GB, system: false, removable: true, ssd: false },
  ],
  disk_io: { down_bps: 555 * 1024, up_bps: 3.22 * MB, down_total: 188 * 1024 * GB, up_total: 173 * 1024 * GB },
  network: { down_bps: 7.96 * 1024 * 1024, up_bps: 1.62 * 1024 * 1024, down_total: 41.3 * GB, up_total: 6.8 * GB },
  interface: "Wi-Fi",
  battery: { percent: 90, state: "paused", rate_w: 41, temp_c: 37, health: 84.1, cycles: 248, voltage_v: 11.08, full_wh: 58, design_wh: 69, minutes: null },
  apps: [
    { name: "Navegador", count: 61, cpu: 18.3, memory: 13.8 * GB },
    { name: "Assistente de IA", count: 73, cpu: 9.1, memory: 9.25 * GB },
    { name: "Editor de código", count: 30, cpu: 21.6, memory: 5.03 * GB },
    { name: "Navegador do trabalho", count: 30, cpu: 3.2, memory: 3.02 * GB },
    { name: "Área de trabalho remota", count: 1, cpu: 1.4, memory: 2.31 * GB },
    { name: "Mensagens", count: 15, cpu: 0.6, memory: 2.05 * GB },
    { name: "node", count: 17, cpu: 6.4, memory: 1.33 * GB },
    { name: "Canto", count: 4, cpu: 0.4, memory: 180 * MB },
    { name: "Gerenciador de janelas", count: 1, cpu: 4.2, memory: 310 * MB },
  ],
  history: {
    cpu: wave(46, 7, 1),
    memory: wave(89, 0.8, 2),
    cpu_temp: wave(65, 2, 3),
    net_down: wave(5.5 * MB, 3 * MB, 4),
    net_up: wave(1.2 * MB, 0.7 * MB, 5),
    disk_read: wave(600 * 1024, 400 * 1024, 6),
    disk_write: wave(2.8 * MB, 1.6 * MB, 7),
  },
};

export const SYSTEM = {
  system_get: SYSTEM_SNAPSHOT,
  system_alerts_get: ["memory", "disk", "battery_low"],
};
