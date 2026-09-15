import { expect, test } from "bun:test";
import type { AgendaItem, Task } from "./api";
import { resumoDoDia } from "./resumo";

const t = (title: string, done: boolean, hora: string | null = null): Task => ({ id: title, title, done, day: "2026-09-14", created_at: 1, updated_at: 1, hora });
const reuniao: AgendaItem = { id: "r", titulo: "Daily", inicio: new Date(2026, 8, 14, 9, 30).toISOString(), fim: "", dia_inteiro: false, local: "", meet: "", link: "" };

test("separa concluido, pendente e reunioes com contagem", () => {
  const texto = resumoDoDia("2026-09-14", [t("enviar NF", true), t("ligar banco", false, "15:00")], [reuniao]);
  expect(texto).toContain("Concluído (1)\n- enviar NF");
  expect(texto).toContain("Pendente (1)\n- ligar banco (15:00)");
  expect(texto).toMatch(/Reuniões \(1\)\n- 09:30 Daily/);
});

test("dia vazio diz isso em vez de cabecalhos soltos", () => {
  const texto = resumoDoDia("2026-09-14", [], []);
  expect(texto).toContain("Nada registrado hoje.");
  expect(texto).not.toContain("Pendente");
});

test("secao sem itens some e o texto nao termina com linha em branco", () => {
  const texto = resumoDoDia("2026-09-14", [t("a", true)], []);
  expect(texto).not.toContain("Reuniões");
  expect(texto.endsWith("\n")).toBe(false);
});
