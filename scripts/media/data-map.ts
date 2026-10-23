import type { Browser } from "@playwright/test";
import { NOW } from "./stage";

/** A made-up town: the tiles are drawn here, so no real street or address ever reaches a print. */
const ORIGIN = { name: "Rua das Acácias, 120", detail: "Aurora", lat: -23.5, lon: -46.6 };
const ZOOM = 14;
const N = 256 * 2 ** ZOOM;

const px = (lat: number, lon: number): [number, number] => {
  const r = (lat * Math.PI) / 180;
  return [((lon + 180) / 360) * N, ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * N];
};
const [OX, OY] = px(ORIGIN.lat, ORIGIN.lon);
/** Back from pixels around the start to coordinates, so routes and incidents sit on the drawn roads. */
const geo = (dx: number, dy: number): [number, number] => {
  const x = OX + dx;
  const y = OY + dy;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / N))) * 180) / Math.PI;
  return [lat, (x / N) * 360 - 180];
};

type Road = { pts: [number, number][]; w: number; level: "free" | "slow" | "jam" | "stop" };
const ROADS: Road[] = [
  { pts: [[-400, 10], [-120, 4], [0, 0], [140, -6], [400, -14]], w: 9, level: "stop" },
  { pts: [[4, -400], [2, -150], [0, 0], [-4, 150], [0, 400]], w: 9, level: "jam" },
  { pts: [[-300, 300], [-120, 120], [0, 0], [130, -110], [300, -280]], w: 7, level: "slow" },
  { pts: [[-400, -180], [-150, -170], [120, -150], [400, -140]], w: 6, level: "free" },
  { pts: [[150, -400], [150, 0], [160, 400]], w: 5, level: "free" },
  { pts: [[-160, -400], [-150, 0], [-170, 400]], w: 5, level: "slow" },
  { pts: [[-400, 170], [0, 160], [400, 150]], w: 6, level: "free" },
];
const COLORS = { free: "#22c55e", slow: "#facc15", jam: "#f97316", stop: "#dc2626" };

/** Draws the town on a 768 px canvas in a blank page and cuts it into the 3×3 tiles Rust would send. */
async function drawTiles(browser: Browser) {
  const page = await browser.newPage();
  const cx = Math.floor(OX / 256);
  const cy = Math.floor(OY / 256);
  const tiles = await page.evaluate(
    ({ roads, colors, offset }) => {
      const make = (flow: boolean) => {
        const c = document.createElement("canvas");
        c.width = c.height = 768;
        const g = c.getContext("2d")!;
        const at = ([x, y]: [number, number]) => [x + offset[0], y + offset[1]] as const;
        if (!flow) {
          g.fillStyle = "#0e1522";
          g.fillRect(0, 0, 768, 768);
          g.fillStyle = "#152033";
          for (let x = 6; x < 768; x += 46) for (let y = 4; y < 768; y += 40) if ((x * 7 + y * 3) % 5) g.fillRect(x, y, 36, 30);
          g.fillStyle = "#12301f";
          g.beginPath();
          g.ellipse(...at([70, 70]), 60, 40, 0, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#0c2a44";
          g.beginPath();
          g.moveTo(...at([-400, 260]));
          g.bezierCurveTo(...at([-200, 220]), ...at([-60, 330]), ...at([120, 400]));
          g.lineTo(...at([-400, 400]));
          g.fill();
        }
        g.lineCap = g.lineJoin = "round";
        for (const r of roads) {
          g.strokeStyle = flow ? colors[r.level as keyof typeof colors] : "#233149";
          g.lineWidth = flow ? r.w * 0.55 : r.w;
          g.beginPath();
          r.pts.forEach((p, i) => (i ? g.lineTo(...at(p)) : g.moveTo(...at(p))));
          g.stroke();
        }
        return c;
      };
      const base = make(false);
      const flow = make(true);
      const cut = (src: HTMLCanvasElement, i: number, j: number) => {
        const t = document.createElement("canvas");
        t.width = t.height = 256;
        t.getContext("2d")!.drawImage(src, i * 256, j * 256, 256, 256, 0, 0, 256, 256);
        return t.toDataURL("image/png");
      };
      const out: { i: number; j: number; base: string; flow: string }[] = [];
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) out.push({ i, j, base: cut(base, i, j), flow: cut(flow, i, j) });
      return out;
    },
    { roads: ROADS, colors: COLORS, offset: [OX - (cx - 1) * 256, OY - (cy - 1) * 256] as [number, number] },
  );
  await page.close();
  return tiles.map((t) => ({ x: cx - 1 + t.i, y: cy - 1 + t.j, base: t.base, flow: t.flow }));
}

const TRIPS = [
  { id: "t1", name: "Trabalho", icon: "work", to: { name: "Av. Central, 900", detail: "Centro", lat: geo(140, -6)[0], lon: geo(140, -6)[1] } },
  { id: "t2", name: "Academia", icon: "gym", to: { name: "Academia Movimento", detail: "Rua das Palmeiras, 40", lat: geo(150, -170)[0], lon: geo(150, -170)[1] } },
  { id: "t3", name: "Casa da mãe", icon: "heart", to: { name: "Rua dos Ipês, 77", detail: "Jardim Aurora", lat: geo(-150, 150)[0], lon: geo(-150, 150)[1] } },
];
const line = (pts: [number, number][]) => pts.map(([x, y]) => geo(x, y));
const at = NOW.getTime();

export async function mapFixed(browser: Browser) {
  const tiles = await drawTiles(browser);
  return {
    traffic_get: {
      status: { has_key: true, origin: ORIGIN, trips: TRIPS },
      suggested: null,
      reading: {
        slowdown: 34,
        incidents: [
          { kind: "accident", text: "Acidente", road: "Av. Central → Rua das Flores", delay_s: 540, km: 0.8, lat: geo(60, -2)[0], lon: geo(60, -2)[1], magnitude: 3 },
          { kind: "jam", text: "Trânsito lento", road: "Av. Brasil, sentido centro", delay_s: 360, km: 1.1, lat: geo(2, -90)[0], lon: geo(2, -90)[1], magnitude: 2 },
          { kind: "works", text: "Obras na pista", road: "Rua das Palmeiras", delay_s: 120, km: 1.6, lat: geo(150, 90)[0], lon: geo(150, 90)[1], magnitude: 1 },
          { kind: "closed", text: "Via interditada", road: "Rua dos Ipês", delay_s: 0, km: 2.3, lat: geo(-155, -90)[0], lon: geo(-155, -90)[1], magnitude: 4 },
        ],
        routes: [
          { trip: "t1", minutes: 24, free_minutes: 15, km: 6.8, points: line([[0, 0], [60, -2], [140, -6]]), error: null },
          { trip: "t2", minutes: 13, free_minutes: 10, km: 4.1, points: line([[0, 0], [130, -110], [150, -170]]), error: null },
          { trip: "t3", minutes: 21, free_minutes: 19, km: 7.9, points: line([[0, 0], [-120, 120], [-150, 150]]), error: null },
        ],
      },
      fetched_at: at,
      history: [...[5, 6, 7, 8, 9].flatMap((h) => [0, 30].map((m) => [new Date(2026, 9, 9, h, m).getTime(), [3, 4, 9, 18, 29, 38, 41, 37, 33, 31][(h - 5) * 2 + m / 30]])), [at, 34]],
      error: null,
    },
    traffic_map: { zoom: ZOOM, tiles, source: "tomtom" },
    traffic_departures: [24, 23, 21, 18, 16, 15, 15, 16, 17].map((minutes, i) => ({ at: at + i * 15 * 60_000, minutes })),
  };
}
