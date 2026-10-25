import { describe, expect, test } from "bun:test";
import { PASTE_TASK_LIMIT, splitPastedTasks } from "./pasteTasks";

describe("splitPastedTasks", () => {
  test("a single line, blank or not, is left to the field", () => {
    expect(splitPastedTasks("comprar leite")).toBeNull();
    expect(splitPastedTasks("comprar leite\n\n  \n")).toBeNull();
    expect(splitPastedTasks("")).toBeNull();
  });

  test("each non-blank line becomes one task, in order", () => {
    expect(splitPastedTasks("comprar leite\r\n\r\nligar 14:00\rrevisar PR")?.lines).toEqual([
      "comprar leite",
      "ligar 14:00",
      "revisar PR",
    ]);
  });

  test("list and checklist markers are dropped, the text after them stays", () => {
    const pasted = "- comprar leite\n* [ ] ligar\n- [x] feito\n1. primeiro\n2) segundo\n• ponto\n☐ caixa\n-5 graus";
    expect(splitPastedTasks(pasted)?.lines).toEqual([
      "comprar leite",
      "ligar",
      "feito",
      "primeiro",
      "segundo",
      "ponto",
      "caixa",
      "-5 graus",
    ]);
  });

  test("tokens the quick-add understands survive, inner spaces collapse", () => {
    expect(splitPastedTasks("  Daily   às 9h30 !alta\nDeploy\t18:00")?.lines).toEqual(["Daily às 9h30 !alta", "Deploy 18:00"]);
  });

  test("a huge paste is capped and says how many lines were left out", () => {
    const many = Array.from({ length: PASTE_TASK_LIMIT + 10 }, (_, i) => `tarefa ${i}`).join("\n");
    const split = splitPastedTasks(many);
    expect(split?.lines).toHaveLength(PASTE_TASK_LIMIT);
    expect(split?.dropped).toBe(10);
    expect(splitPastedTasks("a\nb")?.dropped).toBe(0);
  });
});
