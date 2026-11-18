import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { CommenterGroup } from "./prCommenters";

let calls: { cmd: string; args: unknown }[] = [];
let fail = false;
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: unknown) => {
    calls.push({ cmd, args });
    if (cmd !== "github_profile") return Promise.resolve(null);
    if (fail) return Promise.reject("o GitHub respondeu 404");
    return Promise.resolve({ login: "ana", name: "Ana Souza", bio: "Cuida das rotas", company: "Acme", location: "Recife", public_repos: 12, followers: 3, since: 2019, url: "https://github.com/ana" });
  },
}));

const { default: PrCommentersCatalog } = await import("./PrCommentersCatalog");
const group = (login: string, isBot: boolean): CommenterGroup => ({ login, isBot, totalComments: 1, prsCount: 1, prs: [] });

beforeEach(() => {
  calls = [];
  fail = false;
});
afterEach(cleanup);

async function pick(login: string, profiles: boolean) {
  render(<PrCommentersCatalog commenters={[group("ana", false), group("ci[bot]", true)]} profiles={profiles} />);
  await act(async () => {
    fireEvent.click(screen.getByText(`@${login}`));
  });
  for (let i = 0; i < 3; i++) await act(async () => {});
}

test("picking a person shows their public profile", async () => {
  await pick("ana", true);
  const card = screen.getByRole("region", { name: "perfil de @ana" });
  expect(card.textContent).toContain("Ana Souza");
  expect(card.textContent).toContain("Acme · Recife");
  expect(card.textContent).toContain("Cuida das rotas");
  expect(card.textContent).toContain("12 repositórios · 3 seguidores · no GitHub desde 2019");
  expect(card.querySelector("a")?.getAttribute("href")).toBe("https://github.com/ana");
  expect(calls.find((c) => c.cmd === "github_profile")?.args).toEqual({ login: "ana" });
});

test("GitLab (no profiles) and bots never ask for a profile", async () => {
  await pick("ana", false);
  expect(calls.some((c) => c.cmd === "github_profile")).toBe(false);
  cleanup();
  await pick("ci[bot]", true);
  expect(calls.some((c) => c.cmd === "github_profile")).toBe(false);
});

test("a failed lookup leaves no card and no error", async () => {
  fail = true;
  await pick("ana", true);
  expect(screen.queryByRole("region", { name: "perfil de @ana" })).toBeNull();
  expect(screen.queryByRole("alert")).toBeNull();
});
