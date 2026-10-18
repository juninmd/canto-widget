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

const agent = (
  id: string,
  name: string,
  installTool: string,
  installCommand: string,
  installed: boolean,
  release: { tag: string; published_at: string; notes: string } | null,
) => ({
  id,
  name,
  repo: `acme/${id}`,
  site: `https://github.com/acme/${id}`,
  install_tool: installTool,
  install_command: installCommand,
  installed,
  path: installed ? `D:\\tools\\npm\\${id}.cmd` : null,
  release: release && { ...release, name: release.tag, url: `https://github.com/acme/${id}/releases/tag/${release.tag}` },
  error: null,
});

const agentRelease = (tag: string, days: number, notes: string) => ({
  tag,
  published_at: new Date(NOW.getTime() - days * 86_400_000).toISOString(),
  notes,
});

/** Real CLI names with invented versions and notes: the real tags change every week and would drift. */
export const AGENTS = {
  harness_list: [
    agent("claude", "Claude Code", "npm", "npm install -g @anthropic-ai/claude-code", true,
      agentRelease("v2.4.0", 2, "## O que mudou\n\n- corrige o modo plano em terminais estreitos\n- novo comando /agents\n")),
    agent("codex", "Codex CLI", "npm", "npm install -g @openai/codex", false, null),
    agent("gemini", "Gemini CLI", "npm", "npm install -g @google/gemini-cli", true,
      agentRelease("v0.9.1", 9, "## O que mudou\n\n- sessões retomáveis por projeto\n")),
    agent("opencode", "OpenCode", "npm", "npm install -g opencode-ai", false, null),
    agent("copilot", "GitHub Copilot CLI", "npm", "npm install -g @github/copilot", true,
      agentRelease("v1.2.7", 16, "## O que mudou\n\n- pedidos em lote no mesmo repositório\n")),
  ],
};

/** Invented city and forecast: a real one would read as a fact. */
export const WEATHER = {
  weather_get: {
    place: { city: "Aurora", country: "Brasil", lat: -23.5, lon: -46.6 },
    forecast: {
      now: { temp: 22.4, feels: 24.1, condition: "cloudy" },
      hours: [
        { at: "2026-10-17T10:00", temp: 22.4, rain: 10, condition: "cloudy" },
        { at: "2026-10-17T11:00", temp: 23.9, rain: 20, condition: "cloudy" },
        { at: "2026-10-17T12:00", temp: 25.2, rain: 45, condition: "clear" },
        { at: "2026-10-17T13:00", temp: 26.1, rain: 60, condition: "rain" },
        { at: "2026-10-17T14:00", temp: 24.8, rain: 80, condition: "rain" },
        { at: "2026-10-17T15:00", temp: 23.2, rain: 75, condition: "rain" },
      ],
      days: [
        { date: "2026-10-17", min: 17.1, max: 26.1, rain: 80, condition: "rain" },
        { date: "2026-10-18", min: 16.4, max: 27.0, rain: 20, condition: "clear" },
        { date: "2026-10-19", min: 15.8, max: 24.3, rain: 10, condition: "cloudy" },
        { date: "2026-10-20", min: 18.2, max: 28.4, rain: 0, condition: "clear" },
      ],
      rain_from: "2026-10-17T13:00",
    },
    fetched_at: NOW.getTime(),
    error: null,
  },
};

/** Invented feeds and readings: real headlines would read as facts. */
export const READS = {
  reads_thumb: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABwCAIAAAAWk+xVAAACLUlEQVR42u3cPU7EMBAG0GWUgmJFRUGBOAE34SychrNwI06AKFZUFDQUgPjxOPb4feWuiDd+TJw4ls+ubm4PUjehCwALYAEsgAWwABbAgAWwAJb9s+mCtrl+vP/qq6e7h/6/58zLhmzXfaUBd6Xtzwx4B9qezG6y9tRteBzAI+p2MAY8hEeeMeBRJJKODHig8TLj+IBH0U1qBfDBXLR0Kt+MtgCrYOXbsXybtwhYBQtg1+dh2wWsgvfO6XjBqSzwuy7jmsAfXRkfKi26+5Tz/cPzl2dsc1fw98WqlOcG/okf41mBfy7HeDLg0/Hit2Z/+JPDqItb89qN2Z90lfLowP8XYjwucCubVOP+V+mGLUaZOUh1PBBw0v1R3m1XzyJu21bUe3mglPcE7tP7Ga30KeLmrUTVF38zGmccP6YedPs3mmecdOQo/8Z+CuO8/5tYYT3G4MapV/5Y5IZ2WOPscT1rC4dhn1WarxdYcY+OwZ9EM9aELLTLzhTzDHnrforvkzXRLNIia7ti2TnCRWY0t5U7a4VlmqEUapdy6J3axqFfahtvuqP2kBx0a59d0K19jkG39pkG3drnu6GtfdsVdGv3QNCtbRx0axtvaGsPyUG3dikH3drGQbe28Ya29pAcdGuX8ka3ifHx8nVQ4GF/mdhOWAAD1gWABbAAFsACWAALYMACWAALYAEsgAUwYAEsgAWwABbAAlgAAxbAAlgAC2ABLIABC2ABLIClQ94APRTF4TG/wIIAAAAASUVORK5CYII=",
  reads_get: {
    feeds: [
      { url: "https://blog.exemplo.test/feed", label: "Blog Exemplo", error: null },
      { url: "https://texto.exemplo.test/atom", label: "Texto Exemplo", error: null },
      { url: "https://sumiu.exemplo.test/feed", label: "", error: "o feed respondeu 404" },
    ],
    items: [
      {
        id: "r1", title: "Como o cache do Cargo decide o que recompilar", url: "https://blog.exemplo.test/cargo",
        host: "blog.exemplo.test", source: "Blog Exemplo", published_at: NOW.getTime() - 2 * 3_600_000,
        summary: "O que entra no fingerprint e por que trocar uma flag recompila o mundo.", unread: true, has_image: true,
      },
      {
        id: "r2", title: "Notas sobre escrita técnica curta", url: "https://texto.exemplo.test/curta",
        host: "texto.exemplo.test", source: "Texto Exemplo", published_at: NOW.getTime() - 6 * 3_600_000,
        summary: "Frases menores, um exemplo por ideia e o leitor no centro.", unread: true, has_image: false,
      },
      {
        id: "r3", title: "O que o Linux faz quando o disco enche", url: "https://blog.exemplo.test/disco",
        host: "blog.exemplo.test", source: "Blog Exemplo", published_at: NOW.getTime() - 26 * 3_600_000,
        summary: "Do ENOSPC no journal ao processo que não consegue nem escrever no log.", unread: false, has_image: false,
      },
    ],
    fetched_at: NOW.getTime(),
  },
};

/** Invented games on purpose: a real title with a price and a discount would read as a fact. */
export const STEAM = {
  steam_status: { configured: true, steamid: "76561190000000000", has_key: true, name: "Ana Exemplo", region: "br", watching: false },
  steam_deals: {
    has_more: true,
    currency: "BRL",
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
    currency: "BRL",
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
    currency: "BRL",
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
