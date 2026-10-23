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

// [id, name, creator, score, input $, output $, tok/s, badge, context, released, open weights, reasoning, coding, math, ttft]
const MODEL_ROWS = [
  ["aurora", "Aurora 4", "Lumen Labs", 73.2, 2, 8, 142, "new", 1_000_000, "2026-09-30", false, true, 68.4, 91.2, 1.9],
  ["nimbus", "Nimbus Ultra", "Stratos", 71.8, 3.75, 13.75, 88, "up", 2_000_000, "2026-08-12", false, true, 64.1, 93.5, 6.1],
  ["orca", "Orca Think", "Pelagic AI", 70.4, 0.6, 2.6, 205, null, 262_144, "2026-07-22", true, true, 61.7, 88.0, 0.9],
  ["kestrel", "Kestrel Pro", "Altitude", 68.9, 1.5, 6.5, 121, null, 400_000, "2026-05-18", false, true, 59.2, 86.3, 2.4],
  ["tide", "Tide 3 Large", "Maré Labs", 66.3, 0.35, 1.43, 176, null, 131_072, "2026-04-09", true, false, 55.0, 71.8, 0.6],
  ["ember", "Ember Reason", "Forja AI", 64.0, 2.4, 12, 64, "up", 200_000, "2026-03-02", false, true, 52.6, 84.1, 3.8],
  ["quill", "Quill Flash", "Papiro", 60.7, 0.1, 0.42, 312, null, 1_000_000, "2026-01-27", false, false, 44.9, 62.5, 0.4],
  ["basalt", "Basalt 2", "Rochedo", 58.1, null, null, 97, null, 128_000, "2025-11-04", true, false, 41.3, null, null],
] as const;

export const MODELS = {
  alerts: true,
  models: MODEL_ROWS.map(([id, name, creator, score, input, output, speed, badge, context, released, open, reasoning, coding, math, ttft], i) => ({
    id,
    name,
    creator,
    score,
    price: input === null || output === null ? null : (3 * input + output) / 4,
    speed,
    rank: i + 1,
    badge,
    input_price: input,
    output_price: output,
    ttft,
    context,
    released,
    open_weights: open,
    reasoning,
    coding,
    math,
    inputs: i % 3 === 2 ? ["text"] : ["text", "image"],
  })),
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
    agent("aider", "Aider", "pipx", "pipx install aider-chat", false, null),
  ],
};

/** Invented city and forecast: a real one would read as a fact. */
const SKY = ["cloudy", "cloudy", "clear", "clear", "cloudy", "clear", "clear", "cloudy"] as const;
const WEATHER_HOURS = Array.from({ length: 158 }, (_, i) => {
  const hour = (10 + i) % 24;
  const wet = i <= 5 || (i >= 28 && i <= 31);
  const temp = Math.round((20.4 + 4 * Math.sin(((hour - 10) / 24) * Math.PI * 2)) * 10) / 10;
  return {
    at: `2026-10-${17 + Math.floor((10 + i) / 24)}T${String(hour).padStart(2, "0")}:00`,
    temp,
    rain: wet ? 85 - (i % 24) * 6 : 5 + (i % 4) * 5,
    condition: wet ? "rain" : SKY[Math.floor((i % 24) / 3)],
    feels: Math.round((temp + (wet ? -0.8 : 1.2)) * 10) / 10,
    wind: 9 + (i % 6) * 2 + (wet ? 8 : 0),
    wind_dir: 160 + (i % 8) * 10,
    precip: wet ? Math.round((3.2 - (i % 24) * 0.45) * 10) / 10 : 0,
  };
});
const WEATHER_DAYS = [
  [17.1, 24.1, 85, "rain", 3.1], [16.4, 27.0, 20, "clear", 9.1], [15.8, 24.3, 10, "cloudy", 6.2],
  [18.2, 28.4, 0, "clear", 10.3], [19.0, 29.5, 5, "clear", 11.2], [17.5, 25.0, 65, "rain", 4.1],
  [16.0, 23.8, 40, "cloudy", 5.0],
] as const;

/** Invented quotes: the curves only have to look like a trading day. */
const curve = (from: number, steps: number[]) => steps.reduce<number[]>((acc, d) => [...acc, acc[acc.length - 1] * (1 + d / 100)], [from]);
const WAVE = [0.2, -0.1, 0.3, 0.15, -0.2, 0.1, 0.25, -0.05, 0.1, -0.15, 0.2, 0.05];
const OPEN_AT = Date.UTC(2026, 9, 17, 13, 0) / 1000;
const quote = (symbol: string, group: string, previous: number, sign: number, currency = "BRL") => {
  const points = curve(previous, WAVE.map((d) => d * sign));
  const price = points[points.length - 1];
  const times = points.map((_, i) => OPEN_AT + i * 900);
  const low = Math.min(...points);
  const high = Math.max(...points);
  return {
    symbol, group, price, change: ((price - previous) / previous) * 100, points, times, currency,
    prev_close: previous, open: points[0], day_low: low * 0.999, day_high: high * 1.001,
    year_low: previous * 0.82, year_high: previous * 1.12, market_time: times[times.length - 1],
    session: group === "crypto" ? null : [OPEN_AT, OPEN_AT + 7 * 3600],
  };
};
export const MARKET = {
  market_get: {
    quotes: [
      quote("USD/BRL", "fx", 5.4, 1), quote("EUR/BRL", "fx", 5.89, -0.4), quote("GBP/BRL", "fx", 7.02, 0.5),
      quote("JPY/BRL", "fx", 0.0361, -0.6), quote("CHF/BRL", "fx", 6.78, 0.3), quote("CAD/BRL", "fx", 3.89, -0.2),
      quote("AUD/BRL", "fx", 3.55, 0.4), quote("CNY/BRL", "fx", 0.758, 0.2), quote("ARS/BRL", "fx", 0.0046, -1.4),
      quote("EUR/USD", "fx", 1.083, -0.3, "USD"),
      quote("IBOV", "index", 133100, -0.9), quote("S&P 500", "index", 6410, 0.6, "USD"), quote("NASDAQ", "index", 21300, 1.1, "USD"),
      quote("DOW JONES", "index", 44200, 0.3, "USD"), quote("DAX", "index", 23900, -0.5, "EUR"), quote("FTSE 100", "index", 9180, 0.4, "GBP"),
      quote("NIKKEI 225", "index", 47800, 0.8, "JPY"),
      quote("BTC/USD", "crypto", 116900, 2.2, "USD"), quote("ETH/USD", "crypto", 4210, 2.8, "USD"), quote("SOL/USD", "crypto", 198, -1.6, "USD"),
      quote("XRP/USD", "crypto", 2.71, 1.3, "USD"), quote("BNB/USD", "crypto", 1105, 0.7, "USD"), quote("DOGE/USD", "crypto", 0.231, -2.1, "USD"),
      quote("ADA/USD", "crypto", 0.78, -0.8, "USD"),
    ],
    fetched_at: Date.UTC(2026, 9, 17, 13, 30),
    error: null,
  },
};

const NO_EXTRAS = { nickname: "", department: "", birthday: null, addresses: [], urls: [], relations: [], note: "" };
const at = (iso: string) => Date.parse(`${iso}-03:00`);
/** Invented people and companies; the links only have to look like Google's. */
export const GOOGLE = {
  gmail_summary: {
    unread: 27,
    important: [
      { id: "m1", from: "Marina Lopes", subject: "Contrato revisado: falta só a sua assinatura", snippet: "Ajustei a cláusula 4 como combinamos, consegue assinar até sexta?", date: at("2026-10-09T09:42"), link: "https://mail.google.com/mail/u/0/#inbox/t1", unread: true, starred: true },
      { id: "m2", from: "Banco Aurora", subject: "Fatura de outubro fechada: R$ 1.284,90", snippet: "Vencimento em 28/10. Pague pelo app ou pelo código de barras.", date: at("2026-10-09T08:15"), link: "https://mail.google.com/mail/u/0/#inbox/t2", unread: true, starred: false },
      { id: "m3", from: "Equipe Vértice", subject: "Deploy de produção às 18h", snippet: "Janela de 30 min. Quem tiver PR pendente, mergeia até 17h.", date: at("2026-10-08T16:05"), link: "https://mail.google.com/mail/u/0/#inbox/t3", unread: true, starred: false },
      { id: "m4", from: "Clínica Vale Azul", subject: "Consulta confirmada: terça, 14h", snippet: "Responda SIM para manter o horário ou remarque pelo link.", date: at("2026-10-08T11:20"), link: "https://mail.google.com/mail/u/0/#inbox/t4", unread: true, starred: false },
    ],
  },
  gmail_alerts_get: true,
  gtasks_list: [
    { id: "g1", title: "Renovar seguro do carro", due: "2026-10-07" },
    { id: "g2", title: "Comprar presente da Lia", due: "2026-10-11" },
    { id: "g3", title: "Agendar revisão do notebook", due: "" },
  ],
  contacts_list: {
    total: 9,
    items: [
      { id: "c1", name: "Ana Beatriz Souza", emails: ["ana.souza@example.com"], phones: ["+55 11 91234-0001"], org: "Estúdio Aurora", title: "Designer", starred: true, link: "https://contacts.google.com/person/c1", ...NO_EXTRAS },
      { id: "c2", name: "Álvaro Teixeira", emails: ["alvaro@example.com"], phones: [], org: "Banco Aurora", title: "Gerente de contas", starred: false, link: "https://contacts.google.com/person/c2", ...NO_EXTRAS },
      { id: "c3", name: "Bruno Carvalho", emails: ["bruno@example.com", "bruno.c@example.org"], phones: ["+55 21 98888-0002"], org: "Vértice", title: "Tech lead", starred: true, link: "https://contacts.google.com/person/c3", ...NO_EXTRAS, nickname: "Bruninho", birthday: { day: 9, month: 10, year: 1991 } },
      { id: "c4", name: "Carla Mendes", emails: [], phones: ["+55 31 97777-0003"], org: "", title: "", starred: false, link: "https://contacts.google.com/person/c4", ...NO_EXTRAS },
      { id: "c5", name: "Marina Lopes", emails: ["marina@example.com"], phones: ["+55 11 95555-0004"], org: "Vértice", title: "Diretora", starred: true, link: "https://contacts.google.com/person/c5", ...NO_EXTRAS, birthday: { day: 14, month: 10, year: null } },
      { id: "c6", name: "Rafael Prado", emails: ["rafael@example.com"], phones: [], org: "Vértice", title: "", starred: false, link: "https://contacts.google.com/person/c6", ...NO_EXTRAS },
      { id: "c7", name: "Sofia Nogueira", emails: ["sofia@example.com"], phones: ["+55 41 96666-0005"], org: "Clínica Vale Azul", title: "Dentista", starred: false, link: "https://contacts.google.com/person/c7", ...NO_EXTRAS, birthday: { day: 10, month: 10, year: null } },
      { id: "c8", name: "Tiago Ribeiro", emails: ["tiago@example.com"], phones: [], org: "", title: "", starred: false, link: "https://contacts.google.com/person/c8", ...NO_EXTRAS, birthday: { day: 27, month: 10, year: null } },
      { id: "c9", name: "Zélia Andrade", emails: [], phones: ["+55 11 94444-0006"], org: "Condomínio Nimbus", title: "Síndica", starred: false, link: "https://contacts.google.com/person/c9", ...NO_EXTRAS },
    ],
  },
  gdrive_quota: { used: 4_509_715_660, limit: 16_106_127_360 },
  gdrive_list: [
    { id: "d1", name: "Roadmap Q4 2026", kind: "doc", link: "https://docs.google.com/document/d/d1/edit", modified: "2026-10-09T09:20:00-03:00", starred: true, editor: "", folder: "https://drive.google.com/drive/folders/f1", size: 0 },
    { id: "d2", name: "Orçamento casa 2026", kind: "sheet", link: "https://docs.google.com/spreadsheets/d/d2/edit", modified: "2026-10-08T20:10:00-03:00", starred: true, editor: "", folder: "https://drive.google.com/drive/folders/f1", size: 0 },
    { id: "d3", name: "Apresentação Kickoff Vértice", kind: "slide", link: "https://docs.google.com/presentation/d/d3/edit", modified: "2026-10-08T11:30:00-03:00", starred: false, editor: "Rafael Prado", folder: "https://drive.google.com/drive/folders/f1", size: 0 },
    { id: "d4", name: "Contrato de prestação v3.pdf", kind: "pdf", link: "https://drive.google.com/file/d/d4/view", modified: "2026-10-09T08:40:00-03:00", starred: false, editor: "Marina Lopes", folder: "https://drive.google.com/drive/folders/f1", size: 1_843_200 },
    { id: "d5", name: "Notas da retro de setembro", kind: "doc", link: "https://docs.google.com/document/d/d5/edit", modified: "2026-10-06T17:00:00-03:00", starred: false, editor: "", folder: "https://drive.google.com/drive/folders/f1", size: 0 },
    { id: "d6", name: "Controle de horas", kind: "sheet", link: "https://docs.google.com/spreadsheets/d/d6/edit", modified: "2026-10-05T08:45:00-03:00", starred: true, editor: "", folder: "https://drive.google.com/drive/folders/f1", size: 0 },
  ],
};

export const WEATHER = {
  weather_get: {
    place: { city: "Aurora", admin1: "Vale Azul", country: "Brasil", lat: -23.5, lon: -46.6 },
    forecast: {
      now: {
        temp: 20.4,
        feels: 19.6,
        condition: "rain",
        humidity: 91,
        wind: 18.2,
        wind_dir: 200,
        is_day: true,
        gusts: 34.1,
        pressure: 1008.3,
        visibility: 4.2,
        dew_point: 18.6,
      },
      hours: WEATHER_HOURS,
      days: WEATHER_DAYS.map(([min, max, rain, condition, uv], i) => ({
        date: `2026-10-${17 + i}`,
        min,
        max,
        rain,
        condition,
        uv,
        sunrise: `2026-10-${17 + i}T05:${40 - i}`,
        sunset: `2026-10-${17 + i}T18:${12 + i}`,
      })),
      rain_from: "2026-10-17T10:00",
      next_rain: [1.6, 1.9, 1.4, 1.1, 0.7, 0.3, 0, 0],
      air: 38,
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
  steam_library: {
    has_key: true,
    total: 412,
    minutes: 128_400,
    items: [
      { appid: 900030, name: "Aurora Drift", total_min: 42_100, art: steamArtUrl(900030) },
      { appid: 900012, name: "Basalto", total_min: 28_640, art: steamArtUrl(900012) },
      { appid: 900033, name: "Forja Tática", total_min: 19_320, art: steamArtUrl(900033) },
      { appid: 900020, name: "Quill Chronicles", total_min: 15_860, art: steamArtUrl(900020) },
      { appid: 900011, name: "Lumen Cove", total_min: 12_405, art: steamArtUrl(900011) },
      { appid: 900003, name: "Nimbus Racer", total_min: 9_780, art: steamArtUrl(900003) },
      { appid: 900005, name: "Papiro Quest", total_min: 7_250, art: steamArtUrl(900005) },
      { appid: 900002, name: "Maré Profunda", total_min: 5_120, art: steamArtUrl(900002) },
    ],
  },
};
