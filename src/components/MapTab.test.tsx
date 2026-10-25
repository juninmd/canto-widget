import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { TrafficStatus, TrafficView } from "../lib/api";

type Call = { cmd: string; args: Record<string, unknown> };
const calls: Call[] = [];
let view: TrafficView;
let removeGate: (() => void) | null = null;

const ORIGIN = { name: "Rua Fictícia, 100", detail: "Aurora", lat: -23.5, lon: -46.6 };
const TRIP = { id: "t1", name: "Trabalho", icon: "work" as const, to: { name: "Av. Aurora, 900", detail: "", lat: -23.45, lon: -46.55 } };
const NO_PLACE: TrafficView = {
  status: { has_key: false, origin: null, trips: [] },
  suggested: { name: "Aurora", detail: "SP, Brasil", lat: -23.5, lon: -46.6 },
  reading: null,
  fetched_at: 0,
  history: [],
  error: null,
};
const LIVE: TrafficView = {
  status: { has_key: true, origin: ORIGIN, trips: [TRIP] },
  suggested: null,
  reading: {
    slowdown: 38,
    incidents: [
      { kind: "accident", text: "Acidente", road: "Av. Aurora", delay_s: 540, km: 1.2, lat: -23.49, lon: -46.6, magnitude: 3 },
      { kind: "works", text: "", road: "Rua Fictícia", delay_s: 0, km: 2.4, lat: -23.48, lon: -46.6, magnitude: 1 },
    ],
    routes: [{ trip: "t1", minutes: 24, free_minutes: 15, km: 12.4, points: [[-23.5, -46.6], [-23.45, -46.55]], error: null }],
  },
  fetched_at: Date.now(),
  history: [[Date.now() - 600_000, 30], [Date.now(), 38]],
  error: null,
};
const now = Date.now();
const DEPARTURES = [0, 1, 2, 3].map((i) => ({ at: now + i * 900_000, minutes: [24, 22, 15, 16][i] }));

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: Record<string, unknown> = {}) => {
    calls.push({ cmd, args });
    if (cmd === "traffic_get") return Promise.resolve(view);
    if (cmd === "traffic_map") return Promise.resolve({ zoom: 14, tiles: [], source: "tomtom" });
    if (cmd === "traffic_departures") return Promise.resolve(DEPARTURES);
    if (cmd === "traffic_remove_trip") return new Promise((r) => (removeGate = () => r({ ...view.status, trips: [] })));
    if (cmd === "traffic_set_origin" || cmd === "traffic_set_key") return Promise.resolve(view.status satisfies TrafficStatus);
    return Promise.resolve(null);
  },
}));

const { default: MapTab } = await import("./MapTab");

async function show() {
  render(<MapTab />);
  await act(async () => {});
  await act(async () => {});
}

beforeEach(() => {
  calls.length = 0;
});
afterEach(cleanup);

test("without a starting point the tab asks for one and offers the Clima city", async () => {
  view = NO_PLACE;
  await show();
  expect(screen.getByText("De onde você sai?")).toBeTruthy();
  fireEvent.click(screen.getByText("usar Aurora, da aba Clima"));
  await act(async () => {});
  const saved = calls.find((c) => c.cmd === "traffic_set_origin");
  expect(saved?.args.spot).toEqual(NO_PLACE.suggested);
});

test("searching spends a request only on submit, not while typing", async () => {
  view = NO_PLACE;
  await show();
  fireEvent.change(screen.getByLabelText("Ponto de partida"), { target: { value: "Av. Aurora" } });
  await act(async () => {});
  expect(calls.some((c) => c.cmd === "traffic_search")).toBe(false);
  fireEvent.click(screen.getByText("buscar"));
  await act(async () => {});
  expect(calls.find((c) => c.cmd === "traffic_search")?.args).toEqual({ query: "Av. Aurora" });
});

test("without a key the map shows OpenStreetMap and asks for the TomTom key", async () => {
  view = { ...NO_PLACE, status: { has_key: false, origin: ORIGIN, trips: [] } };
  await show();
  expect(screen.getByText("Mapa sem trânsito")).toBeTruthy();
  expect(screen.getByText("sem dados de trânsito")).toBeTruthy();
  expect(screen.queryByText("Trânsito agora") === null).toBe(true);
  fireEvent.change(screen.getByLabelText("Chave da TomTom"), { target: { value: "abc123" } });
  fireEvent.click(screen.getByText("salvar chave"));
  await act(async () => {});
  expect(calls.find((c) => c.cmd === "traffic_set_key")?.args).toEqual({ key: "abc123" });
});

test("with a key it shows the slowdown, the trip with its delay, the best time to leave and the incidents", async () => {
  view = LIVE;
  await show();
  expect(screen.getByText("38%")).toBeTruthy();
  expect(screen.getByText("Lento")).toBeTruthy();
  expect(screen.getByText("24 min")).toBeTruthy();
  expect(screen.getAllByText("+9 min")).toHaveLength(2);
  expect(calls.find((c) => c.cmd === "traffic_departures")?.args).toEqual({ trip: "t1" });
  expect(screen.getByText(/Se puder, saia às .* e leve 15 min/)).toBeTruthy();
  expect(screen.getByText("Perto de você · 2 ocorrências")).toBeTruthy();
  expect(screen.getAllByText("Obra").length).toBeGreaterThan(0);
  fireEvent.click(screen.getByText("Obras"));
  expect(screen.queryByText("Av. Aurora") === null).toBe(true);
});

test("the layers switch the traffic, incidents and route on and off", async () => {
  view = LIVE;
  const { container } = render(<MapTab />);
  await act(async () => {});
  await act(async () => {});
  expect(container.querySelectorAll("[data-map-pin]").length).toBe(2);
  fireEvent.click(screen.getByText("Incidentes"));
  expect(container.querySelectorAll("[data-map-pin]").length).toBe(0);
  expect(container.querySelector(".map-route")).toBeTruthy();
  fireEvent.click(screen.getByText("Rota"));
  expect(container.querySelector(".map-route") === null).toBe(true);
});

test("a double click on a trip's remove button asks Rust once", async () => {
  view = LIVE;
  await show();
  const x = screen.getByLabelText("remover Trabalho") as HTMLButtonElement;
  fireEvent.click(x);
  fireEvent.click(x);
  expect(calls.filter((c) => c.cmd === "traffic_remove_trip").length).toBe(1);
  expect(x.disabled).toBe(true);
  await act(async () => removeGate!());
});
