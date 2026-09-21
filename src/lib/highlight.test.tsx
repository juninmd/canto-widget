import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { highlight } from "./highlight";

afterEach(cleanup);

test("wraps every case-insensitive match in <mark>", () => {
  render(<p>{highlight("Leite e leite de novo", "leite")}</p>);
  const marks = document.querySelectorAll("mark");
  expect(marks.length).toBe(2);
  expect(marks[0]?.textContent).toBe("Leite");
  expect(marks[1]?.textContent).toBe("leite");
});

test("an empty or #tag query is left unhighlighted", () => {
  render(<p>{highlight("comprar leite", "")}</p>);
  expect(document.querySelectorAll("mark").length).toBe(0);
  cleanup();
  render(<p>{highlight("#trabalho no card", "#trabalho")}</p>);
  expect(document.querySelectorAll("mark").length).toBe(0);
});

test("regex special characters in the query are treated as literal text", () => {
  render(<p>{highlight("preço (com desconto)", "(com")}</p>);
  expect(document.querySelectorAll("mark").length).toBe(1);
  expect(screen.getByText("(com").tagName).toBe("MARK");
});
