import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Task, TaskContext } from "../lib/api";
import TaskContextControl from "./TaskContextControl";
import { TaskMeta } from "./TaskDetails";
import { contextLabel } from "../lib/taskContext";

afterEach(cleanup);

const task = (context?: TaskContext): Task => ({
  id: "t1",
  title: "mandar o relatório",
  done: false,
  day: "2026-09-09",
  created_at: 1,
  updated_at: 1,
  context,
});

function mount(context?: TaskContext) {
  const saved: (TaskContext | null)[] = [];
  render(<TaskContextControl task={task(context)} onChange={(c) => saved.push(c)} />);
  return saved;
}

const kind = () => screen.getByLabelText("onde lembrar mandar o relatório") as HTMLSelectElement;
const name = () => screen.getByLabelText("nome do app ou da rede de mandar o relatório") as HTMLInputElement;

test("no place asks for nothing: no name field and nothing saved", () => {
  const saved = mount();
  expect(kind().value).toBe("");
  expect(screen.queryByLabelText("nome do app ou da rede de mandar o relatório")).toBeNull();
  expect(saved).toEqual([]);
});

test("picking an app and typing its name saves it trimmed on blur", () => {
  const saved = mount();
  fireEvent.change(kind(), { target: { value: "app" } });
  expect(saved, "no name yet: nothing to save").toEqual([]);
  fireEvent.change(name(), { target: { value: "  Slack  " } });
  fireEvent.blur(name());
  expect(saved).toEqual([{ kind: "app", name: "Slack" }]);
});

test("Enter saves a Wi-Fi network", () => {
  const saved = mount();
  fireEvent.change(kind(), { target: { value: "wifi" } });
  fireEvent.change(name(), { target: { value: "Escritorio" } });
  fireEvent.keyDown(name(), { key: "Enter" });
  expect(saved).toEqual([{ kind: "wifi", name: "Escritorio" }]);
});

test("an unchanged name is not saved again", () => {
  const saved = mount({ kind: "app", name: "Slack" });
  expect(name().value).toBe("Slack");
  fireEvent.blur(name());
  expect(saved).toEqual([]);
});

test("changing the kind keeps the name and saves the new pair", () => {
  const saved = mount({ kind: "app", name: "Casa" });
  fireEvent.change(kind(), { target: { value: "wifi" } });
  expect(saved).toEqual([{ kind: "wifi", name: "Casa" }]);
});

test("clearing the name or picking no place removes the context", () => {
  const cleared = mount({ kind: "app", name: "Slack" });
  fireEvent.change(name(), { target: { value: "   " } });
  fireEvent.blur(name());
  expect(cleared).toEqual([null]);
  cleanup();
  const none = mount({ kind: "wifi", name: "Casa" });
  fireEvent.change(kind(), { target: { value: "" } });
  expect(none).toEqual([null]);
});

test("the row shows where a task is waiting, in words", () => {
  expect(contextLabel({ kind: "app", name: "Slack" })).toBe("ao abrir Slack");
  expect(contextLabel({ kind: "wifi", name: "Casa" })).toBe("no Wi-Fi Casa");
  render(<TaskMeta task={task({ kind: "app", name: "Slack" })} />);
  expect(screen.getByText("ao abrir Slack")).toBeTruthy();
});
