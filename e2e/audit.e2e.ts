import { expect, test, type Page } from "@playwright/test";
import { mockTauri } from "./mock";

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


const TABS = ["Tarefas", "Notas", "Clipboard", "Agenda", "GitHub", "Status API", "Modelos IA", "Ajustes"];
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
        notes: notes as never, statuses: statuses as never, models: models as never, hiddenTabs: tab === "Status API" ? [] : undefined,
        fixed: {
          tasks_for_day: tasks, clip_list: { items: clips, max_pinned: 100 }, agenda_today: agenda,
          github_status: { connected: true, login: "voce", source: "token", device_flow: false }, github_lists: lists,
          my_pr_alerts_get: { ci: true, stalled: true, stalled_hours: 48, mentions: true }, review_alerts_get: true,
          activity_status: { supported: true, enabled: false },
        },
      });
      await page.goto("/");
      await page.getByRole("tab", { name: tab }).click();
      await page.waitForTimeout(500);
      expect(await smallTargets(page)).toEqual([]);
    });
  }
}
