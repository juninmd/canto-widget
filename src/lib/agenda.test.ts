import { describe, expect, test } from "bun:test";
import { janelaDoDia, minutosAte, paraAlertar, situacao } from "./agenda";
import type { AgendaItem } from "./api";

const base: AgendaItem = {
  id: "e1",
  titulo: "Daily",
  inicio: "",
  fim: "",
  dia_inteiro: false,
  local: "",
  meet: "",
  link: "",
};

const emMinutos = (m: number, agora: Date, id = "e1"): AgendaItem => ({
  ...base,
  id,
  inicio: new Date(agora.getTime() + m * 60_000).toISOString(),
});

describe("agenda", () => {
  const agora = new Date("2026-09-09T09:00:00");

  test("janela do dia cobre do zero-hora ao fim do dia local", () => {
    const { timeMin, timeMax } = janelaDoDia(agora);
    expect(new Date(timeMin).getHours()).toBe(0);
    expect(new Date(timeMax).getHours()).toBe(23);
    expect(new Date(timeMin).getDate()).toBe(9);
  });

  test("alerta dispara para evento que comeca em ate 1 minuto", () => {
    const itens = [emMinutos(0.5, agora)];
    expect(paraAlertar(itens, new Set(), agora).map((i) => i.id)).toEqual(["e1"]);
  });

  test("nao alerta evento distante", () => {
    expect(paraAlertar([emMinutos(30, agora)], new Set(), agora)).toHaveLength(0);
  });

  test("nao repete alerta ja disparado", () => {
    const itens = [emMinutos(0.2, agora)];
    expect(paraAlertar(itens, new Set(["e1"]), agora)).toHaveLength(0);
  });

  test("para de alertar evento que comecou ha mais de 2 minutos", () => {
    expect(paraAlertar([emMinutos(-5, agora)], new Set(), agora)).toHaveLength(0);
    expect(paraAlertar([emMinutos(-1, agora)], new Set(), agora)).toHaveLength(1);
  });

  test("evento de dia inteiro nunca vira pop-up", () => {
    const feriado: AgendaItem = { ...base, id: "f", dia_inteiro: true, inicio: "2026-09-09" };
    expect(paraAlertar([feriado], new Set(), agora)).toHaveLength(0);
    expect(minutosAte(feriado, agora)).toBe(Number.POSITIVE_INFINITY);
  });

  test("data invalida nao derruba o calculo", () => {
    expect(minutosAte({ ...base, inicio: "nao-e-data" }, agora)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("situacao", () => {
  const agora = new Date("2026-09-14T10:00:00Z");
  const evento = (inicio: string, fim: string) => ({ ...base, inicio, fim });

  test("reuniao em andamento diz agora em texto, nao so na cor", () => {
    expect(situacao(evento("2026-09-14T09:50:00Z", "2026-09-14T10:30:00Z"), agora)).toEqual({ rotulo: "agora", agora: true });
  });

  test("reuniao que ja terminou nao aparece como agora", () => {
    expect(situacao(evento("2026-09-14T09:00:00Z", "2026-09-14T09:30:00Z"), agora).rotulo).toBe("encerrado");
  });

  test("proxima reuniao mostra quanto falta em minutos e horas", () => {
    expect(situacao(evento("2026-09-14T10:07:30Z", "2026-09-14T11:00:00Z"), agora).rotulo).toBe("em 8 min");
    expect(situacao(evento("2026-09-14T11:35:00Z", "2026-09-14T12:00:00Z"), agora).rotulo).toBe("em 1h35");
  });

  test("evento de dia inteiro nao ganha contagem", () => {
    expect(situacao({ ...base, dia_inteiro: true, inicio: "2026-09-14" }, agora).rotulo).toBe("");
  });
});
