import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { hideNewTabs, parseHidden, visibleTabs } from "./tabs";
import TabsSection from "../components/TabsSection";
import type { Tab } from "../components/TabBar";

afterEach(cleanup);

test("saved data that isn't a list of known tabs is ignored, and Ajustes can never be hidden", () => {
  expect(parseHidden('["github","gitlab"]')).toEqual(["github", "gitlab"]);
  expect(parseHidden('["settings","sumiu","notes"]')).toEqual(["notes"]);
  expect(parseHidden("{oops")).toEqual([]);
  expect(parseHidden('{"github":true}')).toEqual([]);
  expect(parseHidden(null)).toEqual(["gitlab", "status", "activity"]);
  expect(parseHidden("[]")).toEqual([]);
});

test("hidden tabs leave the bar; the order of the rest is kept", () => {
  const ids = visibleTabs(["notes", "gitlab"]).map((t) => t.id);
  expect(ids).toEqual(["tasks", "clipboard", "meetings", "agenda", "github", "status", "models", "activity", "settings"]);
});

test("a tab hidden by default also starts hidden for someone who saved a choice before it existed; AI models is visible", () => {
  const before = JSON.stringify(["tasks", "notes", "gitlab"]);
  expect(hideNewTabs(["gitlab"], before)).toEqual(["gitlab", "status", "activity"]);
  expect(hideNewTabs([], "{oops")).toEqual([]);
  const known = JSON.stringify(["tasks", "notes", "gitlab", "status", "activity"]);
  expect(hideNewTabs(["gitlab"], known)).toEqual(["gitlab"]);
  expect(hideNewTabs(["status"], before)).toEqual(["status", "activity"]);
  expect(parseHidden(null)).not.toContain("models");
});

function Harness({ start }: { start: Tab[] }) {
  const [hidden, setHidden] = useState<Tab[]>(start);
  return <TabsSection hidden={hidden} onChange={setHidden} />;
}

test("unchecking hides a tab and the last visible one can't be unchecked", () => {
  render(<Harness start={["notes", "clipboard", "meetings", "agenda", "github", "status", "models", "activity"]} />);
  const gitlab = screen.getByLabelText("GitLab") as HTMLInputElement;
  const tasks = screen.getByLabelText("Tarefas") as HTMLInputElement;
  expect(tasks.disabled).toBe(false);
  fireEvent.click(gitlab);
  expect(gitlab.checked).toBe(false);
  expect(tasks.disabled).toBe(true);
  expect(screen.queryByLabelText("Ajustes")).toBeNull();
});
