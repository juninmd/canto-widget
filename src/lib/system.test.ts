import { expect, test } from "bun:test";
import { average, bytes, level, minutesLabel, peak, pressure, rate, sortApps, systemDisk, uptimeLabel } from "./system";
import type { SystemApp, SystemDisk } from "./systemTypes";

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
