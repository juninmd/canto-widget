import { expect, test } from "bun:test";
import type { Task } from "./api";
import { chaveLembrete, comoEvento, diaDaSemana, lembretesDevidos, PREFIXO_TAREFA } from "./lembretes";

const t = (extra: Partial<Task>): Task => ({ id: "t1", title: "remédio", done: false, day: "2026-09-14", created_at: 1, updated_at: 1, hora: "08:30", ...extra });
const as = (h: number, m: number, s = 0) => new Date(2026, 8, 14, h, m, s);

test("avisa no minuto marcado e ate 2 min depois, nunca antes", () => {
  expect(lembretesDevidos([t({})], new Set(), as(8, 29, 59))).toHaveLength(0);
  expect(lembretesDevidos([t({})], new Set(), as(8, 30))).toHaveLength(1);
  expect(lembretesDevidos([t({})], new Set(), as(8, 31, 30))).toHaveLength(1);
  expect(lembretesDevidos([t({})], new Set(), as(8, 32))).toHaveLength(0);
});

test("concluida, sem horario ou ja avisada nao toca de novo", () => {
  const avisados = new Set([chaveLembrete(t({ id: "x" }))]);
  const lista = [t({ done: true }), t({ id: "sem", hora: null }), t({ id: "x" })];
  expect(lembretesDevidos(lista, avisados, as(8, 30))).toHaveLength(0);
});

test("remarcar o horario gera aviso novo", () => {
  const avisados = new Set([chaveLembrete(t({}))]);
  expect(lembretesDevidos([t({ hora: "09:00" })], avisados, as(9, 0))).toHaveLength(1);
});

test("vira evento do overlay marcado como tarefa e no horario local", () => {
  const e = comoEvento(t({}));
  expect(e.id).toBe(PREFIXO_TAREFA + "t1");
  expect(new Date(e.inicio).getHours()).toBe(8);
  expect(e.meet).toBe("");
});

test("dia da semana igual ao do Rust (0 = domingo)", () => {
  expect(diaDaSemana("2026-09-13")).toBe(0);
  expect(diaDaSemana("2026-09-14")).toBe(1);
});
