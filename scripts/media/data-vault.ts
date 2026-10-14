import type { Note, Task } from "../../src/lib/api";
import { NOW } from "./stage";

export const DAY = "2026-10-09";
const at = (h: number, m = 0) => new Date(2026, 9, 9, h, m).getTime();
const task = (id: string, title: string, extra: Partial<Task> = {}): Task => ({
  id,
  title,
  done: false,
  day: DAY,
  created_at: at(8, 0),
  updated_at: at(8, 0),
  ...extra,
});

/** The day the README shows: one task in focus, one with subtasks and a PR, a recurring one, one already done. */
export const TASKS: Task[] = [
  task("t1", "Revisar o PR do filtro de relatórios", { hora: "10:30", priority: "high", estimate_min: 45, tracked_secs: 1260, pr_url: "https://github.com/acme/atlas/pull/482" }),
  task("t2", "Responder o time sobre a estimativa da migração", {
    priority: "medium",
    subtasks: [
      { id: "s1", title: "Levantar as tabelas afetadas", done: true },
      { id: "s2", title: "Estimar o tempo de cada etapa", done: false },
    ],
  }),
  task("t3", "Enviar relatório semanal", { hora: "16:30", repetir: { tipo: "semanal", dia: 5 }, priority: "low" }),
  task("t4", "Daily", { hora: "09:30", repetir: { tipo: "dias_uteis" }, done: true }),
  task("t5", "Atualizar a documentação de onboarding", { done: true, estimate_min: 30, tracked_secs: 1740 }),
  task("t6", "Marcar consulta de rotina"),
];

const note = (id: string, title: string, body: string, tags: string[], ago: number, extra: Partial<Note> = {}): Note => ({
  id,
  title,
  body,
  tags,
  created_at: NOW.getTime() - ago - 86_400_000,
  updated_at: NOW.getTime() - ago,
  ...extra,
});

const H = 3_600_000;
export const NOTES: Note[] = [
  note("n1", "Ideias para o onboarding", "- [x] Checklist interativo\n- [ ] Vídeo curto de 2 min\n- [ ] Tour pelas abas", ["produto", "ux"], 2 * H, { fixada: true }),
  note("n2", "Retro da sprint 42", "## O que funcionou\n\n- Revisões em até 24 h\n- Deploys menores\n\n## Melhorar\n\n1. Estimativas de migração\n2. Testes de carga antes do release", ["time"], 5 * H),
  note("n3", "Comandos úteis do git", "```bash\ngit switch -c feat/x\ngit rebase --onto main\ngit log --oneline -10\n```", ["dev"], 26 * H),
  note("n4", "Livros para ler", "**Refactoring**, de Fowler\n\nThe Pragmatic Programmer", ["pessoal"], 72 * H),
];
