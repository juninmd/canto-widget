import { expect, test } from "bun:test";
import { interpretar } from "./atalhos";

const tecla = (key: string, extra: Partial<{ code: string; altKey: boolean; ctrlKey: boolean; metaKey: boolean }> = {}) => ({
  key,
  code: extra.code ?? "",
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  ...extra,
});

test("Alt+numero troca de aba pelo codigo fisico, valendo ate dentro de um campo", () => {
  expect(interpretar(tecla("1", { code: "Digit1", altKey: true }), true)).toEqual({ tipo: "aba", aba: "tarefas" });
  expect(interpretar(tecla("¹", { code: "Digit6", altKey: true }), false)).toEqual({ tipo: "aba", aba: "ajustes" });
  expect(interpretar(tecla("7", { code: "Digit7", altKey: true }), false)).toBeNull();
});

test("tecla solta nao rouba a digitacao", () => {
  expect(interpretar(tecla("n"), true)).toBeNull();
  expect(interpretar(tecla("/"), true)).toBeNull();
  expect(interpretar(tecla("?"), true)).toBeNull();
  expect(interpretar(tecla("n"), false)).toEqual({ tipo: "foco", alvo: "novo" });
  expect(interpretar(tecla("/"), false)).toEqual({ tipo: "foco", alvo: "busca" });
  expect(interpretar(tecla("?"), false)).toEqual({ tipo: "ajuda" });
});

test("Ctrl+N e Ctrl+Alt+L ficam com o sistema", () => {
  expect(interpretar(tecla("n", { ctrlKey: true }), false)).toBeNull();
  expect(interpretar(tecla("l", { code: "KeyL", altKey: true, ctrlKey: true }), false)).toBeNull();
  expect(interpretar(tecla("l", { code: "KeyL", altKey: true }), false)).toEqual({ tipo: "trancar" });
});
