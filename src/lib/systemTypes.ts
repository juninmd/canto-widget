/** Mirrors `sysmon.rs`: one reading of the machine for the Sistema tab. Rates are bytes per second. */
export type SystemCpu = { usage: number; brand: string; cores: number; freq_mhz: number; temp_c: number | null };
export type SystemGpu = { name: string; usage: number | null; mem_used: number | null; mem_total: number | null };
export type SystemMemory = { used: number; total: number; swap_used: number; swap_total: number };
export type SystemDisk = {
  name: string;
  mount: string;
  fs: string;
  total: number;
  available: number;
  system: boolean;
  removable: boolean;
  ssd: boolean | null;
};
/** For disks `down` is read and `up` is written. */
export type SystemFlow = { down_bps: number; up_bps: number; down_total: number; up_total: number };
export type BatteryState = "charging" | "discharging" | "full" | "empty" | "paused" | "unknown";
export type SystemBattery = {
  percent: number;
  state: BatteryState;
  rate_w: number;
  temp_c: number | null;
  health: number;
  cycles: number | null;
  voltage_v: number;
  full_wh: number;
  design_wh: number;
  minutes: number | null;
};
/** One app with its processes added up; `cpu` is a share of the whole machine. */
export type SystemApp = { name: string; count: number; cpu: number; memory: number };
export type SystemHistory = {
  cpu: number[];
  memory: number[];
  cpu_temp: number[];
  net_down: number[];
  net_up: number[];
  disk_read: number[];
  disk_write: number[];
};
export type SystemSnapshot = {
  at: number;
  uptime_secs: number;
  cpu: SystemCpu;
  gpus: SystemGpu[];
  memory: SystemMemory;
  disks: SystemDisk[];
  disk_io: SystemFlow;
  network: SystemFlow;
  interface: string;
  battery: SystemBattery | null;
  apps: SystemApp[];
  history: SystemHistory;
};

/** Same order as `KINDS` in `sysmon_hints.rs`. */
export const SYSTEM_ALERT_KINDS = ["memory", "disk", "cpu", "cpu_temp", "battery_low", "battery_health"] as const;
export type SystemAlertKind = (typeof SYSTEM_ALERT_KINDS)[number];
