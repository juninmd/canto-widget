import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const saved: unknown[] = [];
let stored: Record<string, unknown> = { enabled: false, edge: "top", items: ["cpu", "event"] };

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: { config?: Record<string, unknown> }) => {
    if (cmd === "strip_monitors") return Promise.resolve(["DP-1", "HDMI-2"]);
    if (cmd === "strip_config_get") return Promise.resolve(stored);
    if (cmd === "strip_config_set") {
      saved.push(args?.config);
      stored = args!.config!;
      return Promise.resolve(stored);
    }
    return Promise.resolve(null);
  },
}));

const { default: StripSection } = await import("./StripSection");

beforeEach(() => {
  saved.length = 0;
  stored = { enabled: false, edge: "top", items: ["cpu", "event"] };
});
afterEach(cleanup);

test("it is off by default and the options only appear once it is on", async () => {
  render(<StripSection onError={() => {}} />);
  const box = await screen.findByLabelText("mostrar o mini-dashboard na borda da tela");
  expect((box as HTMLInputElement).checked).toBe(false);
  expect(screen.queryByLabelText("Memória")).toBeNull();
  await act(async () => fireEvent.click(box));
  expect(saved).toMatchObject([{ enabled: true, edge: "top", items: ["cpu", "event"] }]);
  expect(await screen.findByLabelText("Memória")).toBeTruthy();
});

test("switching an item on and the edge to the bottom is saved", async () => {
  stored = { enabled: true, edge: "top", items: ["cpu"] };
  render(<StripSection onError={() => {}} />);
  const memory = await screen.findByLabelText("Memória");
  await act(async () => fireEvent.click(memory));
  await act(async () => fireEvent.click(screen.getByRole("tab", { name: "Posição" })));
  await act(async () => fireEvent.click(screen.getByLabelText("base")));
  expect(saved).toMatchObject([
    { enabled: true, edge: "top", items: ["cpu", "memory"] },
    { enabled: true, edge: "bottom", items: ["cpu", "memory"] },
  ]);
});

test("with two monitors the user can pick one, and going back to the widget's own clears it", async () => {
  stored = { enabled: true, edge: "top", items: ["cpu"] };
  render(<StripSection onError={() => {}} />);
  await act(async () => {});
  await act(async () => fireEvent.click(await screen.findByRole("tab", { name: "Posição" })));
  const pick = (await screen.findByLabelText("monitor")) as HTMLSelectElement;
  await act(async () => fireEvent.change(pick, { target: { value: "HDMI-2" } }));
  await act(async () => fireEvent.change(pick, { target: { value: "" } }));
  expect(saved).toMatchObject([
    { enabled: true, edge: "top", items: ["cpu"], monitor: "HDMI-2" },
    { enabled: true, edge: "top", items: ["cpu"], monitor: null },
  ]);
});

test("the arrows reorder, and the look options are saved with a live preview", async () => {
  stored = { enabled: true, edge: "top", items: ["cpu", "event"], density: "comfortable", icons: true, labels: false, opacity: 100, charts: true };
  render(<StripSection onError={() => {}} />);
  await act(async () => {});
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "subir Próximo evento" })));
  expect((saved.at(-1) as { items: string[] }).items).toEqual(["event", "cpu"]);
  expect(document.querySelector("[data-strip-preview]")).toBeTruthy();
  await act(async () => fireEvent.click(screen.getByRole("tab", { name: "Aparência" })));
  await act(async () => fireEvent.click(screen.getByLabelText("compacto")));
  expect(saved.at(-1)).toMatchObject({ density: "compact" });
  await act(async () => fireEvent.click(screen.getByLabelText("vidro")));
  expect(saved.at(-1)).toMatchObject({ surface: "glass" });
  await act(async () => fireEvent.click(screen.getByLabelText("nomes na pílula")));
  expect(saved.at(-1)).toMatchObject({ labels: true });
  await act(async () => fireEvent.change(screen.getByLabelText("opacidade em repouso"), { target: { value: "60" } }));
  expect(saved.at(-1)).toMatchObject({ opacity: 60 });
  await act(async () => fireEvent.change(screen.getByLabelText("zoom"), { target: { value: "120" } }));
  expect(saved.at(-1)).toMatchObject({ scale: 120 });
});

test("position and behavior options are saved, and an older file gets the defaults", async () => {
  stored = { enabled: true, edge: "top", items: ["cpu"] };
  render(<StripSection onError={() => {}} />);
  await act(async () => {});
  await act(async () => fireEvent.click(screen.getByRole("tab", { name: "Posição" })));
  await act(async () => fireEvent.click(screen.getByLabelText("direita")));
  expect(saved.at(-1)).toMatchObject({ align: "end", gap: 0, scale: 100 });
  await act(async () => fireEvent.change(screen.getByLabelText("distância da borda"), { target: { value: "16" } }));
  expect(saved.at(-1)).toMatchObject({ gap: 16 });
  await act(async () => fireEvent.click(screen.getByRole("tab", { name: "Comportamento" })));
  await act(async () => fireEvent.click(screen.getByLabelText("abrir os detalhes ao passar o mouse")));
  expect(saved.at(-1)).toMatchObject({ hover: false });
  await act(async () => fireEvent.click(screen.getByLabelText("5 s")));
  expect(saved.at(-1)).toMatchObject({ refresh: 5 });
});

test("a preset swaps the items and the look but keeps where the pill sits", async () => {
  stored = { enabled: true, edge: "bottom", items: ["cpu"], align: "end" };
  render(<StripSection onError={() => {}} />);
  await act(async () => {});
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Minimalista" })));
  expect(saved.at(-1)).toMatchObject({ edge: "bottom", align: "end", items: ["clock", "event"], surface: "glass" });
});
