import type { PortEntry } from "./devTypes";

const DEV_NAMES = new Set([
  "node", "bun", "deno", "npm", "npx", "yarn", "pnpm", "python", "python3", "pythonw", "java", "javaw", "dotnet", "go", "ruby", "php", "cargo", "rustc",
  "vite", "next", "ng", "esbuild", "webpack", "uvicorn", "gunicorn", "flask", "postgres", "mysqld", "mariadbd", "mongod", "redis-server", "memcached",
  "docker", "docker-proxy", "com.docker.backend", "vpnkit", "nginx", "httpd", "caddy", "code", "idea64", "webstorm64", "tsx", "php-fpm", "kubectl",
]);

const bare = (name: string) => name.toLowerCase().replace(/\.exe$/, "");

/** Tools a developer starts on purpose, as opposed to what the OS and desktop apps listen on. */
export const isDevProcess = (e: PortEntry) => DEV_NAMES.has(bare(e.name));

const SYSTEM_DIRS = /^(\/|\/usr.*|\/bin.*|\/sbin.*|[A-Za-z]:\\?(Windows.*)?)$/i;

/** The last segment of the process's folder names its project; a process with none is its own project. */
export function projectOf(e: PortEntry): string {
  const parts = e.cwd.replace(/[\\/]+$/, "").split(/[\\/]/);
  const last = parts[parts.length - 1];
  return !e.cwd || SYSTEM_DIRS.test(e.cwd) || !last ? bare(e.name) : last;
}

export type PortSort = "port" | "name" | "pid" | "mem";
export type Proto = "all" | "TCP" | "UDP";
export type PortFilter = { query: string; proto: Proto; onlyDev: boolean; exposed?: boolean };

export function filterPorts(list: PortEntry[], f: PortFilter): PortEntry[] {
  const q = f.query.trim().toLowerCase();
  return list.filter((e) => {
    if (f.proto !== "all" && e.proto !== f.proto) return false;
    if (f.onlyDev && !isDevProcess(e)) return false;
    if (f.exposed && !e.exposed) return false;
    return !q || [e.port, e.pid, e.name, e.cmd, projectOf(e)].join(" ").toLowerCase().includes(q);
  });
}

export function sortPorts(list: PortEntry[], by: PortSort): PortEntry[] {
  const cmp: Record<PortSort, (a: PortEntry, b: PortEntry) => number> = {
    port: (a, b) => a.port - b.port,
    name: (a, b) => a.name.localeCompare(b.name),
    pid: (a, b) => a.pid - b.pid,
    mem: (a, b) => b.mem - a.mem,
  };
  return [...list].sort((a, b) => cmp[by](a, b) || a.port - b.port);
}

export function groupByProject(list: PortEntry[]): [string, PortEntry[]][] {
  const groups = new Map<string, PortEntry[]>();
  for (const e of list) groups.set(projectOf(e), [...(groups.get(projectOf(e)) ?? []), e]);
  return [...groups].sort(([a], [b]) => a.localeCompare(b));
}

/** The other ports the same process holds (a Node server and its debugger). */
export const siblings = (list: PortEntry[], e: PortEntry) => list.filter((x) => x.pid === e.pid && x.port !== e.port).map((x) => x.port);

export function portCommands(e: PortEntry, windows: boolean): string[] {
  return windows
    ? [`netstat -ano | findstr :${e.port}`, `taskkill /PID ${e.pid} /F`, `taskkill /PID ${e.pid} /T /F`, `curl -I http://localhost:${e.port}`]
    : [`lsof -nP -i${e.proto}:${e.port}`, `kill ${e.pid}`, `kill -9 ${e.pid}`, `curl -I http://localhost:${e.port}`];
}

/** "3000" and nothing else: the search box then answers "who holds this port" directly. */
export function portQuery(q: string): number | null {
  const n = /^\d{1,5}$/.test(q.trim()) ? Number(q) : 0;
  return n > 0 && n < 65536 ? n : null;
}

/** Ports that were held and no longer are: what a "tell me when it frees" watch waits for. */
export const freed = (watched: readonly number[], now: PortEntry[]) => watched.filter((p) => !now.some((e) => e.port === p && e.proto === "TCP"));
