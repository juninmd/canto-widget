import { expect, test } from "bun:test";
import { average, bytes, filterDisks, issues, level, matchApps, minutesLabel, peak, pressure, rate, sortApps, systemDisk, uptimeLabel, worst } from "./system";
import type { SystemApp, SystemDisk, SystemSnapshot } from "./systemTypes";

const GB = 1024 ** 3;

test("sizes keep three significant digits in the user's locale", () => {
  expect(bytes(512)).toBe("512 B");
  expect(bytes(555 * 1024)).toBe("555 KB");
  expect(bytes(3.22 * 1024 * 1024)).toBe("3,22 MB");
  expect(bytes(57.6 * GB)).toBe("57,6 GB");
  expect(rate(-5)).toBe("0 B/s");
});

test("levels and memory pressure use the alerts' marks", () => {
  expect(level(89, 90, 95)).toBe("ok");
  expect(level(90, 90, 95)).toBe("warn");
  expect(level(97, 90, 95)).toBe("danger");
  expect([pressure(50), pressure(75), pressure(92), pressure(96)]).toEqual(["normal", "elevated", "elevated", "high"]);
});

test("the last minute's average and peak", () => {
  expect(average([])).toBe(0);
  expect(average([10, 20, 60])).toBe(30);
  expect(peak([10, 54, 20])).toBe(54);
});

test("the system volume, else the first", () => {
  const d = (name: string, system: boolean) => ({ name, system }) as SystemDisk;
  expect(systemDisk([d("D", false), d("C", true)])?.name).toBe("C");
  expect(systemDisk([d("D", false)])?.name).toBe("D");
  expect(systemDisk([])).toBeNull();
});

test("apps sort by what the list is about", () => {
  const apps: SystemApp[] = [
    { name: "Editor", count: 3, cpu: 30, memory: GB },
    { name: "Navegador", count: 40, cpu: 12, memory: 5 * GB },
  ];
  expect(sortApps(apps, "cpu").map((a) => a.name)).toEqual(["Editor", "Navegador"]);
  expect(sortApps(apps, "memory", 1).map((a) => a.name)).toEqual(["Navegador"]);
});

test("durations", () => {
  expect(minutesLabel(42)).toBe("42 min");
  expect(minutesLabel(65)).toBe("1 h 05 min");
  expect(uptimeLabel(3 * 86400 + 4 * 3600 + 99)).toBe("3 d 4 h");
  expect(uptimeLabel(5 * 3600 + 12 * 60)).toBe("5 h 12 min");
});

test("issues list what needs a look, red before yellow", () => {
  const snap = {
    cpu: { usage: 96, brand: "", cores: 8, freq_mhz: 0, temp_c: 70 },
    gpus: [],
    memory: { used: 91, total: 100, swap_used: 0, swap_total: 0 },
    disks: [{ name: "", mount: "C:", fs: "", total: 100, available: 50, system: true, removable: false, ssd: true }],
    battery: null,
  } as unknown as SystemSnapshot;
  const list = issues(snap);
  expect(list.map((i) => `${i.part}:${i.level}`)).toEqual(["cpu:danger", "memory:warn"]);
  expect(worst(list)).toBe("danger");
  expect(worst([])).toBe("ok");
});

test("apps match ignoring case and accents; disks filter by kind", () => {
  const apps = [
    { name: "Editor de Código", count: 1, cpu: 1, memory: 1 },
    { name: "Navegador", count: 1, cpu: 1, memory: 1 },
  ];
  expect(matchApps(apps, "codigo").map((a) => a.name)).toEqual(["Editor de Código"]);
  expect(matchApps(apps, "  ")).toHaveLength(2);
  const disk = (removable: boolean, ssd: boolean | null) => ({ name: "", mount: "", fs: "", total: 1, available: 1, system: false, removable, ssd });
  expect(filterDisks([disk(false, true), disk(true, null), disk(false, false)], "removable")).toHaveLength(1);
});
