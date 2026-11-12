import type { CronListing, DockerState, GitView, PortEntry } from "../../src/lib/api";

const MB = 1024 ** 2;
const GB = 1024 ** 3;

const port = (o: Partial<PortEntry> & Pick<PortEntry, "port" | "pid" | "name" | "cmd">): PortEntry => ({ proto: "TCP", addr: "127.0.0.1", ppid: 1, cwd: "", mem: 120 * MB, exposed: false, ...o });

/** Fictitious listeners: a front end, an API, a database, a stray debugger and one open to the network. */
export const PORTS: PortEntry[] = [
  port({ port: 3000, pid: 4121, name: "node", cmd: "node ./node_modules/.bin/vite --port 3000", cwd: "~/projetos/loja/web", mem: 310 * MB }),
  port({ port: 5173, pid: 4388, name: "node", cmd: "node vite dev", cwd: "~/projetos/painel", mem: 240 * MB }),
  port({ port: 8080, pid: 5230, name: "java", cmd: "java -jar api-pedidos.jar --spring.profiles.active=dev", cwd: "~/projetos/loja/api", mem: 780 * MB, addr: "0.0.0.0", exposed: true }),
  port({ port: 5432, pid: 812, name: "postgres", cmd: "postgres -D /var/lib/postgresql/data", mem: 96 * MB }),
  port({ port: 6379, pid: 840, name: "redis-server", cmd: "redis-server *:6379", mem: 18 * MB }),
  port({ port: 9229, pid: 4121, name: "node", cmd: "node --inspect ./server.js", cwd: "~/projetos/loja/web", mem: 310 * MB }),
  port({ port: 5353, pid: 701, name: "avahi-daemon", cmd: "avahi-daemon: running", proto: "UDP", addr: "0.0.0.0", exposed: true, mem: 4 * MB }),
];

export const DOCKER: DockerState = {
  running: true,
  version: "27.3.1",
  containers: [
    { id: "a1b2c3d4e5f6", name: "loja-db", image: "postgres:16", state: "running", status: "Up 3 hours (healthy)", health: "ok", ports: [5432], project: "loja", cpu: 1.2, mem: 96 * MB },
    { id: "b2c3d4e5f6a1", name: "loja-cache", image: "redis:7-alpine", state: "running", status: "Up 3 hours", health: "", ports: [6379], project: "loja", cpu: 0.3, mem: 18 * MB },
    { id: "c3d4e5f6a1b2", name: "loja-api", image: "loja/api:dev", state: "running", status: "Up 2 hours (unhealthy)", health: "bad", ports: [8080], project: "loja", cpu: 12.4, mem: 412 * MB },
    { id: "d4e5f6a1b2c3", name: "mailpit", image: "axllent/mailpit", state: "exited", status: "Exited (0) 2 days ago", health: "", ports: [], project: "", cpu: 0, mem: 0 },
  ],
  images: [
    { id: "sha256:1111", name: "loja/api:dev", size: 412 * MB, age: "2 horas", used: true },
    { id: "sha256:2222", name: "postgres:16", size: 432 * MB, age: "3 semanas", used: true },
    { id: "sha256:3333", name: "node:18", size: 1.1 * GB, age: "5 meses", used: false },
    { id: "sha256:4444", name: "<none>", size: 780 * MB, age: "2 meses", used: false },
  ],
  volumes: [
    { name: "loja_pgdata", detail: "local", used: true },
    { name: "5f3a9c0d1e", detail: "local", used: false },
  ],
  networks: [
    { name: "loja_default", detail: "bridge", used: true },
    { name: "teste_net", detail: "bridge", used: false },
  ],
};

export const GIT: GitView = {
  roots: ["~/projetos"],
  depth: 2,
  repos: [
    { path: "~/projetos/loja", name: "loja", root: "~/projetos", branch: "main", dirty: 3, ahead: 0, behind: 2, last: "há 2 horas" },
    { path: "~/projetos/painel", name: "painel", root: "~/projetos", branch: "feat/graficos", dirty: 0, ahead: 4, behind: 0, last: "ontem" },
    { path: "~/projetos/docs", name: "docs", root: "~/projetos", branch: "main", dirty: 0, ahead: 0, behind: 0, last: "há 3 dias" },
  ],
  worktrees: [
    { repo: "loja", repo_path: "~/projetos/loja", path: "~/projetos/loja-fix-carrinho", branch: "fix/carrinho", safe: true, reason: "merged", count: 0 },
    { repo: "loja", repo_path: "~/projetos/loja", path: "~/projetos/loja-pix", branch: "feat/pix", safe: true, reason: "gone", count: 0 },
    { repo: "painel", repo_path: "~/projetos/painel", path: "~/projetos/painel-tema", branch: "feat/tema", safe: false, reason: "dirty", count: 2 },
    { repo: "painel", repo_path: "~/projetos/painel", path: "~/projetos/painel-graficos", branch: "feat/graficos", safe: false, reason: "open", count: 0 },
  ],
};

export const CRON: CronListing = {
  platform: "cron",
  available: true,
  can_create: true,
  items: [
    { id: "backup", name: "Backup do banco", expr: "0 2 * * *", command: "~/bin/backup-db.sh", enabled: true, last: "ok", next: "", raw: "0 2 * * * ~/bin/backup-db.sh # canto: Backup do banco" },
    { id: "limpeza", name: "Limpar cache", expr: "*/30 * * * *", command: "rm -rf ~/.cache/loja/*", enabled: true, last: "", next: "", raw: "*/30 * * * * rm -rf ~/.cache/loja/* # canto: Limpar cache" },
    { id: "relatorio", name: "Relatório semanal", expr: "0 9 * * 1", command: "node ~/projetos/loja/relatorio.js", enabled: false, last: "", next: "", raw: "#canto-off# 0 9 * * 1 node ~/projetos/loja/relatorio.js # canto: Relatório semanal" },
  ],
};

export const DEV = {
  dev_ports_list: PORTS,
  dev_docker_get: DOCKER,
  dev_docker_logs: ["2026-10-09 10:20:01 INFO  servidor iniciado na porta 8080", "2026-10-09 10:20:04 WARN  pool de conexões em 82%", "2026-10-09 10:21:15 ERROR timeout ao chamar pagamentos"],
  dev_git_get: GIT,
  dev_cron_list: CRON,
};
