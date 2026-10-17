import { expect, test, type Page } from "@playwright/test";
import { goTab, mockTauri } from "./mock";

const now = Date.now();
const d = new Date();
const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const t = (id: string, title: string, extra = {}) => ({ id, title, done: false, day, created_at: now - 3_600_000, updated_at: now, ...extra });
const tasks = [
  t("t1", "Revisar o PR do filtro de relatórios", { hora: "10:30", priority: "high", pr_url: "https://github.com/acme/atlas/pull/131", estimate_min: 45, tracked_secs: 1200 }),
  t("t2", "Responder o time sobre a estimativa da migração", { priority: "medium", subtasks: [{ id: "s1", title: "Levantar os custos", done: true }, { id: "s2", title: "Escrever o resumo", done: false }] }),
  t("t3", "Enviar relatório semanal", { hora: "16:30", repetir: { tipo: "semanal", dia: 5 } }),
  t("t4", "Atualizar a documentação de onboarding", { done: true }),
  t("t5", "Marcar consulta de rotina", { priority: "low" }),
];
const notes = [
  { id: "n1", title: "Planejamento da sprint · 19/09", body: "## Convidados\n\n- Ana\n- Bruno\n\n## Pauta\n\nBloqueios e metas do trimestre.", tags: ["reunião"], created_at: 1, updated_at: now - 1000, fixada: true },
  { id: "n2", title: "Ideias para o painel de métricas", body: "- tempo de resposta por equipe\n- PRs parados por repositório\n- horas em reunião por dia", tags: ["produto"], created_at: 1, updated_at: now - 86_400_000 },
  { id: "n3", title: "Comandos úteis", body: "```sql\nSELECT id, status FROM tarefas WHERE dia = CURRENT_DATE;\n```", tags: [], created_at: 1, updated_at: now - 3 * 86_400_000 },
];
const clips = [
  { id: "c1", preview: "https://acme.example/painel/relatorio-q3", chars: 40, kept: 40, truncated: false, copied_at: now - 5 * 60_000, pinned: true },
  { id: "c2", preview: "#38bdf8", chars: 7, kept: 7, truncated: false, copied_at: now - 20 * 60_000, pinned: false },
  { id: "c3", preview: '{"status":"ok","itens":3}', chars: 25, kept: 25, truncated: false, copied_at: now - 40 * 60_000, pinned: false },
  { id: "c4", preview: "ana@empresa.example", chars: 19, kept: 19, truncated: false, copied_at: now - 3_600_000, pinned: false },
];
const at = (h: number, m = 0) => { const x = new Date(); x.setHours(h, m, 0, 0); return x.toISOString(); };
const base = { all_day: false, location: "", meet: "", link: "" };
const forge = (n: number, title: string, extra = {}) => ({ repo: "acme/atlas", number: n, reference: `acme/atlas#${n}`, title, url: `https://github.com/acme/atlas/pull/${n}`, created_at: new Date(now - 30 * 3_600_000).toISOString(), updated_at: new Date(now - 3_600_000).toISOString(), comments: 3, is_pr: true, draft: false, author: "ana-exemplo", ...extra });
const agenda = [
  { ...base, id: "e1", title: "Daily do time", start: at(9, 30), end: at(9, 45), meet: "https://meet.example.com/a-b-c", guests: 6 },
  { ...base, id: "e2", title: "Revisão de PRs", start: at(11), end: at(11, 45), location: "Sala Azul" },
  { ...base, id: "e3", title: "1:1 com Ana", start: at(15, 30), end: at(16), meet: "https://meet.example.com/d-e-f" },
];


const lists = {
  assigned: { total: 1, items: [forge(120, "Migra o job de relatórios para a fila nova", { is_pr: false })], fetched_at: now },
  my_prs: { total: 2, items: [forge(128, "Corrige o parser de CSV com aspas", { author: "voce" }), forge(131, "Cache de relatórios por período", { draft: true, author: "voce" })], fetched_at: now },
  review_requested: { total: 2, items: [forge(133, "Adiciona exportação em PDF", { created_at: new Date(now - 60 * 3_600_000).toISOString() }), forge(134, "Ajusta o tema escuro do painel")], fetched_at: now },
  my_issues: { total: 0, items: [], fetched_at: now },
};
const statuses = [
  { id: "github", label: "GitHub", items: [], error: null },
  { id: "aws", label: "AWS", items: [{ title: "Elevated API error rates", link: "https://status.example.com/1", published_at: now - 3_600_000 }], error: null },
];
const models = { alerts: false, total: 3, fetched_at: now, next_fetch_at: now + 3 * 3_600_000, throttled: false, error: null, models: [
  { id: "m1", name: "Aurora 4", creator: "Lumen Labs", rank: 1, score: 73.2, price: 4.5, speed: 120, new_until: now + 86_400_000 },
  { id: "m2", name: "Boreal 2 Pro", creator: "Acme AI", rank: 2, score: 70.1, price: 2.1, speed: 95, new_until: 0 },
  { id: "m3", name: "Cedro Mini", creator: "Verde Co", rank: 3, score: 64.8, price: 0.4, speed: 210, new_until: 0 },
] };
/** One installed and one missing, so the sweep checks the path line, the copy button and the GitHub link. */
const agents = [
  {
    id: "claude", name: "Claude Code", repo: "anthropics/claude-code", site: "https://github.com/anthropics/claude-code",
    install_tool: "npm", install_command: "npm install -g @anthropic-ai/claude-code",
    installed: true, path: "D:\\tools\\npm\\claude.cmd",
    release: { tag: "v2.1.302", name: "2.1.302", published_at: new Date(now - 7_200_000).toISOString(), url: "https://github.com/anthropics/claude-code/releases/tag/v2.1.302", notes: "## O que mudou\n\n- corrige o modo plano\n\n## ⬇️ Downloads\n" },
    error: null,
  },
  {
    id: "aider", name: "Aider", repo: "Aider-AI/aider", site: "https://github.com/Aider-AI/aider",
    install_tool: "pipx", install_command: "pipx install aider-chat",
    installed: false, path: null, release: null, error: null,
  },
];


const TABS = ["Tarefas", "Notas", "Clipboard", "Agenda", "GitHub", "Status API", "Modelos IA", "Steam", "Agentes", "Clima", "Mercado", "Leituras", "Ajustes"];
/** Hidden by default: the sweep shows them and tells the app they were already known, so they don't auto-hide. */
const HIDDEN_BY_DEFAULT = ["Status API", "Steam", "Agentes", "Clima", "Mercado", "Leituras"];
const ALL_TABS = [
  "tasks", "notes", "clipboard", "agenda", "github", "gitlab", "steam", "status", "models", "agents",
  "weather", "market", "reads", "activity",
];
const MIN = 24;

/** Buttons, tabs and selects under 24 CSS px (WCAG 2.5.8), skipping what is not on screen. */
async function smallTargets(page: Page): Promise<string[]> {
  return page.evaluate((min) => {
    const bad: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("button, select, [role=tab], a[href], summary")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || getComputedStyle(el).visibility === "hidden") continue;
      if (r.width < min - 0.5 || r.height < min - 0.5) {
        bad.push(`${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 28)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    return bad;
  }, MIN);
}

for (const density of ["compacta", "padrao"]) {
  for (const tab of TABS) {
    test(`${tab}: every button is at least 24 px in the ${density} density`, async ({ page }) => {
      await page.addInitScript((d) => localStorage.setItem("canto.densidade", d), density);
      await mockTauri(page, {
        notes: notes as never, statuses: statuses as never, models: models as never,
        hiddenTabs: HIDDEN_BY_DEFAULT.includes(tab) ? [] : undefined,
        knownTabs: HIDDEN_BY_DEFAULT.includes(tab) ? ALL_TABS : undefined,
        fixed: {
          tasks_for_day: tasks, clip_list: { items: clips, max_pinned: 100 }, agenda_today: agenda,
          github_status: { connected: true, login: "voce", source: "token", device_flow: false }, github_lists: lists,
          my_pr_alerts_get: { ci: true, stalled: true, stalled_hours: 48, mentions: true }, review_alerts_get: true,
          activity_status: { supported: true, enabled: false },
          steam_status: { configured: true, steamid: "76561190000000000", has_key: true, name: "Ana Exemplo" },
          steam_image: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
          steam_deals: {
            has_more: true,
            items: [
              {
                appid: 900001,
                name: "Aurora Drift",
                price: "R$ 14,99",
                original: "R$ 59,99",
                discount: 75,
                review: 91,
                review_key: "very_positive",
                review_count: 12345,
                saved_cents: 4500,
                art: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/900001/capsule_231x87.jpg",
              },
            ],
          },
          harness_list: agents,
          weather_get: {
            place: { city: "Aurora", country: "Brasil", lat: -23.5, lon: -46.6 },
            forecast: {
              now: { temp: 22.4, feels: 24.1, condition: "cloudy" },
              hours: [
                { at: "2026-10-17T10:00", temp: 22.4, rain: 10, condition: "cloudy" },
                { at: "2026-10-17T11:00", temp: 25.2, rain: 70, condition: "rain" },
              ],
              days: [{ date: "2026-10-17", min: 16.4, max: 27, rain: 80, condition: "rain" }],
              rain_from: "2026-10-17T11:00",
            },
            fetched_at: now,
            error: null,
          },
          reads_get: {
            feeds: [{ url: "https://blog.exemplo.test/feed", label: "Blog Exemplo", error: null }],
            items: [
              { id: "a1", title: "Como o cache do Cargo decide o que recompilar", url: "https://blog.exemplo.test/a1", host: "blog.exemplo.test", source: "Blog Exemplo", published_at: now - 7_200_000, summary: "Um resumo curto do texto.", unread: true, has_image: false },
            ],
            fetched_at: now,
          },
        },
      });
      await page.goto("/");
      await goTab(page, tab);
      await page.waitForTimeout(500);
      expect(await smallTargets(page)).toEqual([]);
    });
  }
}

const activitySummary = {
  spans: [{ app: "Code", start: Date.now() / 1000 - 7200, end: Date.now() / 1000 - 3600 }, { app: "Slack", start: Date.now() / 1000 - 3600, end: Date.now() / 1000 - 3000 }],
  apps: [{ app: "Code", secs: 3600 }, { app: "Slack", secs: 600 }],
  total_secs: 4200,
  idle: [],
  idle_secs: 0,
  focus: [{ task: "t1", title: "Revisar o PR do filtro de relatórios", secs: 1200 }],
};

for (const density of ["compacta", "padrao"]) {
  for (const enabled of [true, false]) {
    test(`Atividade ${enabled ? "com dados" : "desligada"}: every button is at least 24 px in the ${density} density`, async ({ page }) => {
      await page.addInitScript((d) => localStorage.setItem("canto.densidade", d), density);
      await mockTauri(page, { hiddenTabs: [], fixed: { activity_status: { supported: true, enabled }, activity_summary: activitySummary } });
      await page.goto("/");
      await goTab(page, "Atividade");
      await page.waitForTimeout(500);
      expect(await smallTargets(page)).toEqual([]);
      if (enabled) {
        await page.getByRole("button", { name: "Semana" }).click();
        await page.waitForTimeout(200);
        expect(await smallTargets(page)).toEqual([]);
        await page.getByRole("button", { name: "Mais ações" }).click();
        expect(await smallTargets(page)).toEqual([]);
      }
    });
  }
}
