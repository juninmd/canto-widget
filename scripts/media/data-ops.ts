import type { HealthSample, HealthView, StatusResult } from "../../src/lib/api";
import { NOW } from "./stage";

const MIN = 60_000;
const ago = (min: number) => NOW.getTime() - min * MIN;

type Indicator = "none" | "minor" | "major" | "critical" | "maintenance";

const feed = (id: string, label: string, indicator: Indicator, description: string, items: [string, number][] = []): StatusResult => ({
  id,
  label,
  error: null,
  live: { indicator, description },
  items: items.map(([title, min]) => ({ title, link: `https://status.example.com/${id}/incidents/${min}`, published_at: ago(min) })),
});

/** Invented services on purpose: a real brand shown as "down" would read as a fact. */
export const STATUS: StatusResult[] = [
  feed("aurora", "Aurora Cloud", "critical", "Falha parcial", [["Armazenamento: leituras falhando em uma região", 25]]),
  feed("nimbus", "Nimbus CDN", "major", "Interrupção no painel", [["Painel de controle indisponível", 70]]),
  feed("pelagic", "Pelagic DB", "minor", "Latência elevada", [["Latência elevada em consultas de leitura", 190]]),
  feed("stratos", "Stratos Auth", "maintenance", "Manutenção agendada", [["Manutenção programada das 22h às 23h", 1500]]),
  feed("lumen", "Lumen Mail", "none", "Operacional", [["Atraso na entrega resolvido", 8600]]),
  feed("forja", "Forja CI", "none", "Operacional", [["Fila de builds normalizada", 3600]]),
  feed("rochedo", "Rochedo Logs", "none", "Operacional"),
  feed("papiro", "Papiro Docs", "none", "Operacional", [["Edição colaborativa lenta, resolvido", 11000]]),
];

const readings = (base: number, jitter: number, fail: number[] = [], cert?: number): HealthSample[] =>
  Array.from({ length: 48 }, (_, i) => ({
    at: ago((48 - i) * 5),
    ms: fail.includes(i) ? null : Math.round(base + Math.sin(i * 1.3) * jitter + ((i * 37) % 11)),
    err: fail.includes(i) ? "tempo esgotado" : null,
    cert_days: cert ?? null,
  }));

const endpoint = (id: string, name: string, kind: "http" | "tcp" | "dns", target: Record<string, unknown>, limit: number) => ({
  id,
  name,
  kind,
  ...target,
  every_secs: 300,
  limit_ms: limit,
  alert_down: true,
  alert_slow: true,
  alert_cert: kind === "dns",
});

export const HEALTH: HealthView[] = [
  { endpoint: endpoint("h1", "API pública", "http", { url: "https://api.example.com/health" }, 400), health: "up", samples: readings(120, 30) },
  { endpoint: endpoint("h2", "Painel interno", "http", { url: "https://painel.example.com" }, 800), health: "slow", samples: readings(780, 190) },
  { endpoint: endpoint("h3", "Banco primário", "tcp", { host: "db.example.com", port: 5432 }, 100), health: "up", samples: readings(22, 7) },
  { endpoint: endpoint("h4", "Site institucional", "dns", { host: "www.example.com" }, 300), health: "up", samples: readings(48, 12, [], 41) },
  { endpoint: endpoint("h5", "Fila de e-mails", "http", { url: "https://mail.example.com/ping" }, 500), health: "down", samples: readings(210, 40, [44, 45, 46, 47]) },
  { endpoint: endpoint("h6", "Webhook de cobrança", "http", { url: "https://hooks.example.com/pay" }, 600), health: "up", samples: readings(260, 60) },
];

const MODEL_ROWS = [
  ["aurora", "Aurora 4", "Lumen Labs", 73.2, 3.44, 142, "new"],
  ["nimbus", "Nimbus Ultra", "Stratos", 71.8, 6.25, 88, "up"],
  ["orca", "Orca Think", "Pelagic AI", 70.4, 1.1, 205, null],
  ["kestrel", "Kestrel Pro", "Altitude", 68.9, 2.75, 121, null],
  ["tide", "Tide 3 Large", "Maré Labs", 66.3, 0.62, 176, null],
  ["ember", "Ember Reason", "Forja AI", 64.0, 4.8, 64, "up"],
  ["quill", "Quill Flash", "Papiro", 60.7, 0.18, 312, null],
  ["basalt", "Basalt 2", "Rochedo", 58.1, null, 97, null],
] as const;

export const MODELS = {
  alerts: true,
  models: MODEL_ROWS.map(([id, name, creator, score, price, speed, badge], i) => ({ id, name, creator, score, price, speed, rank: i + 1, badge })),
  total: 187,
  fetched_at: NOW.getTime() - 2 * 3_600_000,
  next_fetch_at: NOW.getTime() + 3_600_000,
  throttled: false,
  error: null,
};

/** The capsule URL a fictitious game would have; the media scene answers it with a placeholder. */
export function steamArtUrl(appid: number): string {
  return `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_231x87.jpg`;
}

const steamGame = (
  appid: number,
  name: string,
  price: string,
  original = "",
  discount = 0,
  review: number | null = null,
  review_key = "",
  review_count = 0,
  saved_cents = 0,
) => ({
  appid,
  name,
  price,
  original,
  discount,
  review,
  review_key,
  review_count,
  saved_cents,
  art: steamArtUrl(appid),
});

/** Invented games on purpose: a real title with a price and a discount would read as a fact. */
export const STEAM = {
  steam_status: { configured: true, steamid: "76561190000000000", has_key: true, name: "Ana Exemplo" },
  steam_deals: {
    has_more: true,
    items: [
      steamGame(900001, "Aurora Drift", "R$ 14,99", "R$ 59,99", 75, 91, "very_positive", 12345, 4500),
      steamGame(900002, "Maré Profunda", "R$ 9,99", "R$ 39,99", 75, 89, "very_positive", 8420, 3000),
      steamGame(900003, "Nimbus Racer", "R$ 29,90", "R$ 119,90", 75, 93, "very_positive", 30100, 9000),
      steamGame(900004, "Forja Tática", "R$ 19,99", "R$ 49,99", 60, 78, "mostly_positive", 2150, 3000),
      steamGame(900005, "Papiro Quest", "R$ 7,49", "R$ 29,99", 75, 96, "overwhelmingly_positive", 640, 2250),
      steamGame(900006, "Rochedo Survival", "R$ 34,99", "R$ 69,99", 50, 62, "mixed", 980, 3500),
    ],
  },
  steam_trending: {
    has_more: false,
    items: [
      steamGame(900010, "Vento Valley", "Grátis", "", 0, 96, "overwhelmingly_positive", 412300),
      steamGame(900011, "Lumen Cove", "R$ 89,90", "", 0, 94, "very_positive", 98120),
      steamGame(900012, "Basalto", "R$ 49,90", "", 0, 92, "very_positive", 45210),
      steamGame(900013, "Kestrel Arena", "R$ 24,99", "", 0, 91, "very_positive", 18400),
      steamGame(900014, "Tide Runner", "R$ 39,90", "", 0, 89, "very_positive", 7310),
      steamGame(900015, "Ember Path", "R$ 12,49", "R$ 49,99", 75, 88, "very_positive", 1204, 3750),
    ],
  },
  steam_catalog: {
    has_more: true,
    items: [
      steamGame(900020, "Quill Chronicles", "R$ 59,90", "", 0, 98, "overwhelmingly_positive", 210450),
      steamGame(900021, "Orca Bay", "R$ 34,99", "", 0, 97, "overwhelmingly_positive", 133900),
      steamGame(900022, "Pedra Alta", "R$ 19,99", "", 0, 96, "overwhelmingly_positive", 88210),
      steamGame(900023, "Terra de Vento", "R$ 44,90", "", 0, 95, "overwhelmingly_positive", 41030),
      steamGame(900024, "Coral", "Grátis", "", 0, 94, "very_positive", 20450),
      steamGame(900025, "Vale Noturno", "R$ 27,49", "", 0, 71, "mostly_positive", 1310),
    ],
  },
  steam_recent: {
    has_key: true,
    items: [
      { appid: 900030, name: "Aurora Drift", recent_min: 135, total_min: 4210, art: steamArtUrl(900030) },
      { appid: 900031, name: "Maré Profunda", recent_min: 78, total_min: 615, art: steamArtUrl(900031) },
      { appid: 900032, name: "Papiro Quest", recent_min: 42, total_min: 1305, art: steamArtUrl(900032) },
      { appid: 900033, name: "Forja Tática", recent_min: 21, total_min: 2870, art: steamArtUrl(900033) },
      { appid: 900034, name: "Lumen Cove", recent_min: 12, total_min: 96, art: steamArtUrl(900034) },
    ],
  },
};
