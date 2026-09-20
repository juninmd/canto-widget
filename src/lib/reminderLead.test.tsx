import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { parseLead, type LeadMinutes } from "./reminderLead";
import RemindersSection from "../components/RemindersSection";

afterEach(cleanup);

test("only a known lead value is kept, anything else means on time", () => {
  expect(parseLead("10")).toBe(10);
  expect(parseLead("7")).toBe(0);
  expect(parseLead(null)).toBe(0);
  expect(parseLead("oops")).toBe(0);
});

function Harness({ start }: { start: LeadMinutes }) {
  const [lead, setLead] = useState<LeadMinutes>(start);
  return <RemindersSection lead={lead} onChange={setLead} />;
}

test("picking an option updates the value", () => {
  render(<Harness start={0} />);
  const select = screen.getByRole("combobox") as HTMLSelectElement;
  fireEvent.change(select, { target: { value: "15" } });
  expect(select.value).toBe("15");
});
