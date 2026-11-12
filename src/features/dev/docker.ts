import type { DockerContainer, DockerImage, DockerNamed } from "./devTypes";

export type LogLevel = "error" | "warn" | "info" | "debug";

/** `docker logs` has no levels: the word that gives each line away stands in for one. */
export function logLevel(line: string): LogLevel {
  if (/(\b(error|fatal|panic|fail(ed)?)\b|exception)/i.test(line)) return "error";
  if (/\b(warn(ing)?|deprecated)\b/i.test(line)) return "warn";
  if (/\b(debug|trace)\b/i.test(line)) return "debug";
  return "info";
}

/** Containers of one compose project together; those started by hand (project "") come last. */
export function groupContainers(list: DockerContainer[]): [string, DockerContainer[]][] {
  const groups = new Map<string, DockerContainer[]>();
  for (const c of list) groups.set(c.project, [...(groups.get(c.project) ?? []), c]);
  return [...groups].sort(([a], [b]) => (a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)));
}

export const isUp = (c: DockerContainer) => c.state === "running";

export function filterContainers(list: DockerContainer[], query: string, onlyRunning: boolean): DockerContainer[] {
  const q = query.trim().toLowerCase();
  return list.filter((c) => (!onlyRunning || isUp(c)) && (!q || `${c.name} ${c.image} ${c.project}`.toLowerCase().includes(q)));
}

/** What a "Limpar" would free: the unused images' size, and how many volumes (whose size Docker doesn't list). */
export const reclaimable = (images: DockerImage[]) => images.filter((i) => !i.used).reduce((sum, i) => sum + i.size, 0);
export const unused = <T extends DockerImage | DockerNamed>(list: T[]) => list.filter((i) => !i.used);

export const shellCommand = (name: string) => `docker exec -it ${name} sh`;
export const logsCommand = (name: string) => `docker logs -f --tail 100 ${name}`;
