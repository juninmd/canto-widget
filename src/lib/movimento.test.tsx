import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { SAIDA_MS, duracaoSaida, useNovos, useSaida } from "./movimento";
import { ToastProvider, useToast, type Aviso } from "./toast";

const original = window.matchMedia;
function comMovimento() {
  window.matchMedia = ((q: string) => ({ matches: q.includes("no-preference"), media: q })) as typeof window.matchMedia;
}
const esperar = (ms: number) => act(() => new Promise((r) => setTimeout(r, ms)));

afterEach(() => {
  window.matchMedia = original;
  cleanup();
});

test("quem pede menos movimento ve a remocao na hora (WCAG 2.3.3)", () => {
  expect(duracaoSaida()).toBe(0);
  comMovimento();
  expect(duracaoSaida()).toBe(SAIDA_MS);
});

test("clique duplo durante a saida nao exclui duas vezes", async () => {
  comMovimento();
  let remocoes = 0;
  const { result } = renderHook(() => useSaida());
  const remover = async () => void remocoes++;
  let a!: Promise<void>, b!: Promise<void>;
  act(() => {
    a = result.current.sair("x", remover);
    b = result.current.sair("x", remover);
  });
  expect(result.current.saindo.has("x")).toBe(true);
  await act(() => Promise.all([a, b]));
  expect(remocoes).toBe(1);
  expect(result.current.saindo.has("x")).toBe(false);
});

test("remocao que falha libera o item para nova tentativa", async () => {
  const { result } = renderHook(() => useSaida());
  await act(() => result.current.sair("x", () => Promise.reject(new Error("offline"))).catch(() => {}));
  let chamou = false;
  await act(() => result.current.sair("x", async () => void (chamou = true)));
  expect(chamou).toBe(true);
});

test("so anima o que surgiu depois da primeira carga, nao a lista inteira", () => {
  const { result, rerender } = renderHook(({ ids, ctx }) => useNovos(ids, ctx), {
    initialProps: { ids: [] as string[], ctx: null as string | null },
  });
  rerender({ ids: ["a", "b"], ctx: "2026-09-14" });
  expect(result.current("a")).toBe(false);
  rerender({ ids: ["c", "a", "b"], ctx: "2026-09-14" });
  expect(result.current("c")).toBe(true);
  expect(result.current("a")).toBe(false);
});

test("virada de dia ou nova busca nao faz a lista inteira entrar de novo", () => {
  const { result, rerender } = renderHook(({ ids, ctx }) => useNovos(ids, ctx), {
    initialProps: { ids: ["a"], ctx: "2026-09-14" as string | null },
  });
  rerender({ ids: ["x", "y"], ctx: "2026-09-15" });
  expect(result.current("x")).toBe(false);
  expect(result.current("y")).toBe(false);
});

test("item que sai e volta (desfazer) entra animado de novo", () => {
  const { result, rerender } = renderHook(({ ids }) => useNovos(ids, ""), { initialProps: { ids: ["a", "b"] } });
  rerender({ ids: ["b"] });
  rerender({ ids: ["a", "b"] });
  expect(result.current("a")).toBe(true);
});

let avisar: (a: Aviso) => void = () => {};
function Captura() {
  avisar = useToast();
  return null;
}

test("toast fechado anima a saida antes de sumir quando o sistema permite movimento", async () => {
  comMovimento();
  render(
    <ToastProvider>
      <Captura />
    </ToastProvider>,
  );
  act(() => avisar({ texto: "senha incorreta", tipo: "erro" }));
  fireEvent.click(screen.getByLabelText("fechar aviso"));
  expect(screen.getByText("senha incorreta").parentElement!.className).toContain("animate-baixar");
  await esperar(SAIDA_MS + 50);
  expect(screen.queryByText("senha incorreta")).toBeNull();
});
