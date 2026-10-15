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
