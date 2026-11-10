import { expect, test } from "bun:test";
import { dueDay, googleGate, initials, isLate, shortWhen } from "./google";

test("the gate tells a missing login from a login without the new scopes", () => {
  expect(googleGate("entre com o Google para ver a agenda")).toBe("connect");
  expect(googleGate("reconecte o Google em Ajustes para liberar Gmail, Tarefas e Drive")).toBe("reconnect");
  expect(googleGate("reconnect Google in Settings to allow Gmail, Tasks and Drive")).toBe("reconnect");
  expect(googleGate("google: gmail respondeu 500")).toBeNull();
  expect(googleGate("")).toBeNull();
});

test("today shows the time and another day the short date", () => {
  const now = new Date(2026, 9, 21, 15, 0);
  expect(shortWhen(new Date(2026, 9, 21, 10, 42), now)).toBe("10:42");
  expect(shortWhen(new Date(2026, 9, 20, 23, 0), now)).toBe("20/10");
  expect(shortWhen(new Date("nope"), now)).toBe("");
});

test("a due day is read as a plain day and is late only before today", () => {
  expect(dueDay("2026-10-20")).toBe("20/10");
  expect(dueDay("")).toBe("");
  expect(isLate("2026-10-20", "2026-10-21")).toBe(true);
  expect(isLate("2026-10-21", "2026-10-21")).toBe(false);
  expect(isLate("", "2026-10-21")).toBe(false);
});

test("initials come from the first two words of a name or address", () => {
  expect(initials("Marina Lopes")).toBe("ML");
  expect(initials("Banco Aurora S.A.")).toBe("BA");
  expect(initials("ana@exemplo.com")).toBe("AE");
});
