import { afterEach, expect, jest, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider, useToast, type Toast } from "./toast";

let notify: (a: Toast) => void = () => {};
function Capture() {
  notify = useToast();
  return null;
}

const mount = (durationMs = 40) =>
  render(
    <ToastProvider durationMs={durationMs}>
      <Capture />
    </ToastProvider>,
  );

const wait = (ms: number) => act(() => new Promise((r) => setTimeout(r, ms)));

afterEach(cleanup);

test("a plain toast disappears on its own after the deadline", async () => {
  mount();
  act(() => notify({ message: "card excluído" }));
  expect(screen.getByText("card excluído")).toBeTruthy();
  await wait(80);
  expect(screen.queryByText("card excluído")).toBeNull();
});

test("an error stays until the user closes it: vanishing before it's read helps no one", async () => {
  mount();
  act(() => notify({ message: "senha incorreta", type: "erro" }));
  await wait(80);
  expect(screen.getByRole("alert").textContent).toContain("senha incorreta");
  fireEvent.click(screen.getByLabelText("fechar aviso"));
  expect(screen.queryByText("senha incorreta")).toBeNull();
});

test("hovering pauses the deadline to give time to click undo", async () => {
  mount();
  act(() => notify({ message: "tarefa excluída", action: { label: "desfazer", run: () => {} } }));
  fireEvent.mouseEnter(screen.getByText("tarefa excluída").parentElement!);
  await wait(80);
  expect(screen.getByRole("button", { name: "desfazer" })).toBeTruthy();
});

// Fake clock: with 15ms of real-time slack, Windows's timer granularity used to fail this test.
test("a new toast doesn't reset the deadline of ones already on screen", () => {
  jest.useFakeTimers();
  try {
    mount(60);
    act(() => notify({ message: "primeiro" }));
    act(() => jest.advanceTimersByTime(40));
    act(() => notify({ message: "segundo" }));
    act(() => jest.advanceTimersByTime(35));
    expect(screen.queryByText("primeiro")).toBeNull();
    expect(screen.getByText("segundo")).toBeTruthy();
  } finally {
    jest.useRealTimers();
  }
});

test("at most three toasts stacked, the oldest one is dropped", () => {
  mount(10_000);
  act(() => ["a", "b", "c", "d"].forEach((message) => notify({ message })));
  expect(screen.queryByText("a")).toBeNull();
  expect(screen.getByText("d")).toBeTruthy();
});

test("the same error repeated by polling shows up only once", () => {
  mount(10_000);
  act(() => [1, 2, 3].forEach(() => notify({ message: "clipboard indisponivel", type: "erro" })));
  expect(screen.getAllByText("clipboard indisponivel")).toHaveLength(1);
});

test("two deletions in a row keep two independent undos", () => {
  mount(10_000);
  act(() => {
    notify({ message: "item excluído", action: { label: "desfazer", run: () => {} } });
    notify({ message: "item excluído", action: { label: "desfazer", run: () => {} } });
  });
  expect(screen.getAllByRole("button", { name: "desfazer" })).toHaveLength(2);
});
