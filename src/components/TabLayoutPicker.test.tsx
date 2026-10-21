import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { TabLayout } from "../lib/tabLayout";
import TabLayoutPicker from "./TabLayoutPicker";

afterEach(cleanup);

function Harness({ start = "horizontal" }: { start?: TabLayout }) {
  const [layout, setLayout] = useState<TabLayout>(start);
  const [pinned, setPinned] = useState(false);
  return <TabLayoutPicker layout={layout} onLayout={setLayout} pinned={pinned} onPinned={setPinned} />;
}

test("choosing vertical selects it and unlocks keeping the bar open", () => {
  render(<Harness />);
  const keep = screen.getByLabelText(/manter a barra lateral aberta/) as HTMLInputElement;
  expect(keep.disabled).toBe(true);
  fireEvent.click(screen.getByRole("radio", { name: /Vertical/ }));
  expect(screen.getByRole("radio", { name: /Vertical/ }).getAttribute("aria-checked")).toBe("true");
  expect(screen.getByRole("radio", { name: /Horizontal/ }).getAttribute("aria-checked")).toBe("false");
  expect(keep.disabled).toBe(false);
  fireEvent.click(keep);
  expect(keep.checked).toBe(true);
});
