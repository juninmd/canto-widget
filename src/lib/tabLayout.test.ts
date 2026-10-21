import { afterEach, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { TABS } from "../components/TabBar";
import { parseLayout, TAB_GROUP, useTabLayout } from "./tabLayout";

afterEach(() => localStorage.clear());

test("anything but a saved vertical is the horizontal bar", () => {
  expect(parseLayout("vertical")).toBe("vertical");
  expect(parseLayout("horizontal")).toBe("horizontal");
  expect(parseLayout("lateral")).toBe("horizontal");
  expect(parseLayout(null)).toBe("horizontal");
});

test("the layout and the pinned bar survive a reload", () => {
  const first = renderHook(() => useTabLayout());
  expect(first.result.current.layout).toBe("horizontal");
  expect(first.result.current.pinned).toBe(false);
  act(() => {
    first.result.current.setLayout("vertical");
    first.result.current.setPinned(true);
  });
  first.unmount();
  const again = renderHook(() => useTabLayout());
  expect(again.result.current.layout).toBe("vertical");
  expect(again.result.current.pinned).toBe(true);
});

test("every tab but Ajustes belongs to a group, and each group is one run of the bar", () => {
  const groups = TABS.filter((tab) => tab.id !== "settings").map((tab) => TAB_GROUP[tab.id]);
  expect(groups.every(Boolean)).toBe(true);
  const runs = groups.filter((g, i) => g !== groups[i - 1]);
  expect(runs).toEqual(["day", "code", "explore"]);
  expect(TAB_GROUP.settings).toBeUndefined();
});

test("the first four tabs keep their Alt+1 to Alt+4 shortcuts", () => {
  expect(TABS.slice(0, 4).map((tab) => tab.id)).toEqual(["tasks", "notes", "clipboard", "agenda"]);
});
