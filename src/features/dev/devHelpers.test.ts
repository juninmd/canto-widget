import { expect, test } from "bun:test";
import { filterPorts, freed, groupByProject, isDevProcess, portCommands, portQuery, projectOf, siblings, sortPorts } from "./ports";
import { filterContainers, groupContainers, logLevel, reclaimable } from "./docker";
import { byRoot, cleanScript, filterRepos } from "./gitView";
import type { DockerContainer, GitRepo, GitWorktree, PortEntry } from "./devTypes";

const port = (o: Partial<PortEntry>): PortEntry => ({ port: 3000, proto: "TCP", addr: "0.0.0.0", pid: 10, ppid: 1, name: "node.exe", cmd: "node next dev", cwd: "C:\\code\\canto-site", mem: 100, exposed: true, ...o });

test("dev tools are told from system listeners, with or without .exe", () => {
  expect(isDevProcess(port({ name: "node.exe" }))).toBe(true);
  expect(isDevProcess(port({ name: "Redis-Server" }))).toBe(true);
  expect(isDevProcess(port({ name: "svchost.exe" }))).toBe(false);
});

test("the project is the last folder of the process, or the process itself when it has none", () => {
  expect(projectOf(port({}))).toBe("canto-site");
  expect(projectOf(port({ cwd: "/home/a/api/" }))).toBe("api");
  expect(projectOf(port({ cwd: "/", name: "sshd" }))).toBe("sshd");
  expect(projectOf(port({ cwd: "", name: "Spotify.exe" }))).toBe("spotify");
});

test("ports filter by text, protocol and dev, sort and group", () => {
  const all = [port({}), port({ port: 5353, proto: "UDP", name: "svchost.exe", pid: 2, cwd: "" }), port({ port: 5173, pid: 11, cwd: "/p/widget" })];
  expect(filterPorts(all, { query: "", proto: "all", onlyDev: true }).map((e) => e.port)).toEqual([3000, 5173]);
  expect(filterPorts(all, { query: "widget", proto: "all", onlyDev: false }).map((e) => e.port)).toEqual([5173]);
  expect(filterPorts(all, { query: "", proto: "UDP", onlyDev: false }).map((e) => e.port)).toEqual([5353]);
  expect(sortPorts(all, "mem").map((e) => e.port)).toEqual([3000, 5173, 5353]);
  expect(sortPorts(all, "pid")[0].pid).toBe(2);
  expect(groupByProject(all).map(([k]) => k)).toEqual(["canto-site", "svchost", "widget"]);
});

test("the OS picks the commands, and a bare number is a port question", () => {
  expect(portCommands(port({ port: 8080, pid: 7 }), true)[0]).toBe("netstat -ano | findstr :8080");
  expect(portCommands(port({ port: 8080, pid: 7 }), false)[1]).toBe("kill 7");
  expect(portQuery(" 3000 ")).toBe(3000);
  expect(portQuery("70000")).toBeNull();
  expect(portQuery("node")).toBeNull();
});

test("sibling ports and freed watches read the live list", () => {
  const all = [port({ port: 3000, pid: 5 }), port({ port: 9229, pid: 5 })];
  expect(siblings(all, all[0])).toEqual([9229]);
  expect(freed([3000, 4000], all)).toEqual([4000]);
});

const box = (o: Partial<DockerContainer>): DockerContainer => ({ id: "a", name: "api", image: "x", state: "running", status: "Up", health: "", ports: [], project: "backend", cpu: 0, mem: 0, ...o });

test("containers group by compose project with hand-started ones last, and filter", () => {
  const all = [box({ name: "z", project: "" }), box({ name: "b", project: "backend" }), box({ name: "m", project: "ferramentas", state: "exited" })];
  expect(groupContainers(all).map(([k]) => k)).toEqual(["backend", "ferramentas", ""]);
  expect(filterContainers(all, "", true).map((c) => c.name)).toEqual(["z", "b"]);
  expect(filterContainers(all, "ferram", false).map((c) => c.name)).toEqual(["m"]);
});

test("log lines get a level from their words, and unused images add up", () => {
  expect(logLevel("NullPointerException em X")).toBe("error");
  expect(logLevel("WARN pool em 82%")).toBe("warn");
  expect(logLevel("DEBUG heartbeat")).toBe("debug");
  expect(logLevel("GET /api 200")).toBe("info");
  expect(reclaimable([{ id: "1", name: "a", size: 5, age: "", used: false }, { id: "2", name: "b", size: 7, age: "", used: true }])).toBe(5);
});

const repo = (o: Partial<GitRepo>): GitRepo => ({ path: "/r/a", name: "a", root: "/r", branch: "main", dirty: 0, ahead: 0, behind: 0, last: "", ...o });

test("repositories filter by state and group by folder in the order added", () => {
  const all = [repo({ name: "api", dirty: 3 }), repo({ name: "site", root: "/s", ahead: 1 }), repo({ name: "docs", behind: 2 })];
  expect(filterRepos(all, "", "dirty").map((r) => r.name)).toEqual(["api"]);
  expect(filterRepos(all, "", "ahead").map((r) => r.name)).toEqual(["site"]);
  expect(filterRepos(all, "DOC", "all").map((r) => r.name)).toEqual(["docs"]);
  expect(byRoot(all, ["/s", "/r", "/vazia"]).map(([k, l]) => [k, l.length])).toEqual([["/s", 1], ["/r", 2]]);
});

test("the cleaning script removes each worktree, optionally its branch, then prunes each repository once", () => {
  const w = (path: string, branch: string): GitWorktree => ({ repo: "app", repo_path: "/r/app", path, branch, safe: true, reason: "merged", count: 0 });
  const list = [w("/r/app.wt/a", "fix/a"), w("/r/app.wt/b", "fix/b")];
  expect(cleanScript(list, true).split("\n")).toEqual([
    'git -C "/r/app" worktree remove "/r/app.wt/a"', 'git -C "/r/app" branch -d "fix/a"',
    'git -C "/r/app" worktree remove "/r/app.wt/b"', 'git -C "/r/app" branch -d "fix/b"', 'git -C "/r/app" worktree prune',
  ]);
  expect(cleanScript(list, false)).not.toContain("branch -d");
});
