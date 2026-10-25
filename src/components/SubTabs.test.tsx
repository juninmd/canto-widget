import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SubTabs from "./SubTabs";

afterEach(cleanup);

const TABS = [
  { key: "a", label: "Alfa" },
  { key: "b", label: "Beta" },
  { key: "c", label: "Gama" },
];

function Harness({ start = "a" }: { start?: string }) {
  const [value, setValue] = useState(start);
  return <SubTabs label="seções" tabs={TABS} value={value} onChange={setValue} />;
}

const tab = (label: string) => screen.getByText(label).closest("button") as HTMLButtonElement;

test("only the selected tab is a Tab stop", () => {
  render(<Harness start="b" />);
  expect(tab("Alfa").tabIndex).toBe(-1);
  expect(tab("Beta").tabIndex).toBe(0);
  expect(tab("Gama").tabIndex).toBe(-1);
});

test("arrows, Home and End move focus and selection, wrapping at the ends", () => {
  render(<Harness />);
  tab("Alfa").focus();
  fireEvent.keyDown(tab("Alfa"), { key: "ArrowLeft" });
  expect(tab("Gama").getAttribute("aria-selected")).toBe("true");
  expect(document.activeElement === tab("Gama")).toBe(true);
  fireEvent.keyDown(tab("Gama"), { key: "ArrowRight" });
  expect(tab("Alfa").getAttribute("aria-selected")).toBe("true");
  fireEvent.keyDown(tab("Alfa"), { key: "End" });
  expect(document.activeElement === tab("Gama")).toBe(true);
  fireEvent.keyDown(tab("Gama"), { key: "Home" });
  expect(tab("Alfa").tabIndex).toBe(0);
  expect(document.activeElement === tab("Alfa")).toBe(true);
});

test("an unknown value still leaves the first tab reachable", () => {
  render(<Harness start="z" />);
  expect(tab("Alfa").tabIndex).toBe(0);
});
