import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let saved = { ci: true, stalled: true, stalled_hours: 48, mentions: true, reviews: true, merge_state: true, comments: true, assigned: true, replies: false, team_mentions: false };
let connected = true;
const calls: { cmd: string; args: { config?: typeof saved } }[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: { config?: typeof saved }) => {
    calls.push({ cmd, args });
    if (cmd === "github_status") return Promise.resolve({ connected, login: "", source: "", device_flow: true });
    if (cmd === "my_pr_alerts_set") saved = args.config as typeof saved;
    return Promise.resolve(saved);
  },
}));

const { default: MyPrAlertsSection } = await import("./MyPrAlertsSection");

beforeEach(() => {
  saved = { ci: true, stalled: true, stalled_hours: 48, mentions: true, reviews: true, merge_state: true, comments: true, assigned: true, replies: false, team_mentions: false };
  calls.length = 0;
  connected = true;
});
afterEach(cleanup);

async function show() {
  render(<MyPrAlertsSection onError={() => {}} />);
  await act(async () => {});
}

const sent = () => calls.filter((c) => c.cmd === "my_pr_alerts_set").map((c) => c.args.config);

test("shows what Rust saved and turning the CI alert off sends the whole config", async () => {
  await show();
  const ci = screen.getByLabelText("avisar quando o CI de um PR meu falhar") as HTMLInputElement;
  expect(ci.checked).toBe(true);
  await act(async () => {
    fireEvent.click(ci);
  });
  expect(sent()).toEqual([{ ci: false, stalled: true, stalled_hours: 48, mentions: true, reviews: true, merge_state: true, comments: true, assigned: true, replies: false, team_mentions: false }]);
  expect(ci.checked).toBe(false);
});

test("the waiting limit offers 24, 48 and 72 hours and is disabled with the alert off", async () => {
  await show();
  const hours = screen.getByRole("combobox") as HTMLSelectElement;
  expect([...hours.options].map((o) => o.value)).toEqual(["24", "48", "72"]);
  await act(async () => {
    fireEvent.change(hours, { target: { value: "72" } });
  });
  expect(sent()).toEqual([{ ci: true, stalled: true, stalled_hours: 72, mentions: true, reviews: true, merge_state: true, comments: true, assigned: true, replies: false, team_mentions: false }]);
  await act(async () => {
    fireEvent.click(screen.getByLabelText(/avisar quando um PR meu ficar sem revisão/, { selector: "input[type=checkbox]" }));
  });
  expect(hours.disabled).toBe(true);
});

test("a limit saved by hand outside the list still shows up as chosen", async () => {
  saved = { ci: true, stalled: true, stalled_hours: 36, mentions: true, reviews: true, merge_state: true, comments: true, assigned: true, replies: false, team_mentions: false };
  await show();
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("36");
});

test("the mention alert is its own switch and leaves the other settings as they were", async () => {
  await show();
  const box = screen.getByLabelText("avisar quando alguém me marcar") as HTMLInputElement;
  expect(box.checked).toBe(true);
  await act(async () => {
    fireEvent.click(box);
  });
  expect(sent()).toEqual([{ ci: true, stalled: true, stalled_hours: 48, mentions: false, reviews: true, merge_state: true, comments: true, assigned: true, replies: false, team_mentions: false }]);
});

test("without a GitHub connection the section says where to connect it", async () => {
  connected = false;
  await show();
  expect(screen.getByText("Conecte o GitHub na aba GitHub para receber estes avisos.")).toBeTruthy();
});

test("each own-work alert is its own switch: on by default, except replies and team mentions", async () => {
  await show();
  const on = (name: string) => (screen.getByLabelText(name) as HTMLInputElement).checked;
  expect(on("avisar quando um PR/MR meu for aprovado ou receber pedido de mudanças")).toBe(true);
  expect(on("avisar quando um PR/MR meu ficar pronto para merge ou tiver conflito")).toBe(true);
  expect(on("avisar quando um PR/MR meu receber comentário novo")).toBe(true);
  expect(on("avisar quando algo for atribuído a mim")).toBe(true);
  expect(on("avisar quando responderem em uma conversa em que comentei (GitHub)")).toBe(false);
  expect(on("incluir menções aos meus times (GitHub)")).toBe(false);
});

test("turning on replies and team mentions sends them with everything else untouched", async () => {
  await show();
  await act(async () => {
    fireEvent.click(screen.getByLabelText("avisar quando responderem em uma conversa em que comentei (GitHub)"));
  });
  await act(async () => {
    fireEvent.click(screen.getByLabelText("incluir menções aos meus times (GitHub)"));
  });
  expect(sent()).toEqual([
    { ci: true, stalled: true, stalled_hours: 48, mentions: true, reviews: true, merge_state: true, comments: true, assigned: true, replies: true, team_mentions: false },
    { ci: true, stalled: true, stalled_hours: 48, mentions: true, reviews: true, merge_state: true, comments: true, assigned: true, replies: true, team_mentions: true },
  ]);
  expect(screen.getByText(/Precisa do escopo read:org/)).toBeTruthy();
});
