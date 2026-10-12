import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let calls: { cmd: string; args: unknown }[] = [];
let responses: Record<string, () => Promise<unknown>> = {};

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args: unknown) => {
    calls.push({ cmd, args });
    return (responses[cmd] ?? (() => Promise.resolve(null)))();
  },
}));

const { default: GithubTab } = await import("./GithubTab");
const { clearForgeCache } = await import("../lib/forgeCache");

const empty = { total: 0, items: [] };
const item = {
  repo: "octo/canto", number: 42, reference: "octo/canto#42", title: "Revisar o cofre", url: "https://github.com/octo/canto/pull/42",
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(), comments: 0, is_pr: true, draft: false, author: "octocat",
};
const lists = { assigned: empty, my_prs: { total: 1, items: [item] }, review_requested: empty, my_issues: empty };
const connected = { connected: true, login: "octocat", source: "pat", device_flow: true };
const settle = async () => {
  for (let i = 0; i < 5; i++) await act(async () => {});
};
const count = (cmd: string) => calls.filter((c) => c.cmd === cmd).length;

beforeEach(() => {
  calls = [];
  responses = {};
  clearForgeCache();
});
afterEach(cleanup);

test("a failed status check shows an alert with a retry that tries again", async () => {
  responses.github_status = () => Promise.reject("sem rede");
  render(<GithubTab onError={() => {}} />);
  await settle();
  expect(screen.getByRole("alert").textContent).toContain("sem rede");
  responses.github_status = () => Promise.resolve(connected);
  responses.github_lists = () => Promise.resolve(lists);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  });
  await settle();
  expect(screen.getByText("@octocat")).toBeTruthy();
});

test("coming back to the tab paints the last lists and filter at once, then refreshes", async () => {
  responses.github_status = () => Promise.resolve(connected);
  responses.github_lists = () => Promise.resolve(lists);
  const first = render(<GithubTab onError={() => {}} />);
  await settle();
  fireEvent.change(screen.getByLabelText("Filtrar issues e PRs"), { target: { value: "cofre" } });
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "filtrar" }));
  });
  await settle();
  first.unmount();

  const never = () => new Promise(() => {});
  responses.github_status = never;
  responses.github_lists = never;
  render(<GithubTab onError={() => {}} />);
  await settle();
  expect(screen.getByText("Revisar o cofre")).toBeTruthy();
  expect((screen.getByLabelText("Filtrar issues e PRs") as HTMLInputElement).value).toBe("cofre");
});

test("a failed refresh over cached lists keeps them, marks them as cached and offers a retry", async () => {
  responses.github_status = () => Promise.resolve(connected);
  responses.github_lists = () => Promise.resolve(lists);
  const first = render(<GithubTab onError={() => {}} />);
  await settle();
  expect(screen.queryByText("dados em cache")).toBeNull();
  first.unmount();

  responses.github_lists = () => Promise.reject("limite de requisições");
  render(<GithubTab onError={() => {}} />);
  await settle();
  expect(screen.getByText("Revisar o cofre")).toBeTruthy();
  expect(screen.getByText("dados em cache")).toBeTruthy();
  expect(screen.getByRole("alert").textContent).toContain("limite de requisições");
  const before = count("github_lists");
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  });
  expect(count("github_lists")).toBe(before + 1);
});

test("disconnecting asks inline first and only the confirmation drops the token", async () => {
  responses.github_status = () => Promise.resolve(connected);
  responses.github_lists = () => Promise.resolve(lists);
  await act(async () => {
    render(<GithubTab onError={() => {}} />);
  });
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "desconectar" }));
  expect(screen.getByText("desconectar esta conta?")).toBeTruthy();
  expect(count("github_disconnect")).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "cancelar" }));
  expect(screen.getByRole("button", { name: "desconectar" })).toBeTruthy();
  expect(count("github_disconnect")).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "desconectar" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "sim, desconectar" }));
  });
  expect(count("github_disconnect")).toBe(1);
});

test("the filter is the tab's search target, hints at Enter while focused, and rows carry the external-link glyph", async () => {
  responses.github_status = () => Promise.resolve(connected);
  responses.github_lists = () => Promise.resolve(lists);
  const { container } = render(<GithubTab onError={() => {}} />);
  await settle();
  const input = screen.getByLabelText("Filtrar issues e PRs");
  expect(input.getAttribute("data-shortcut")).toBe("search");
  expect(screen.queryByText("Enter para buscar")).toBeNull();
  fireEvent.focus(input);
  expect(screen.getByText("Enter para buscar")).toBeTruthy();
  expect(container.querySelector('li [title="abre no navegador"]')?.getAttribute("aria-hidden")).toBe("true");
});

test("the refresh button shows a spinner and is disabled while the lists load", async () => {
  responses.github_status = () => Promise.resolve(connected);
  responses.github_lists = () => Promise.resolve(lists);
  render(<GithubTab onError={() => {}} />);
  await settle();
  responses.github_lists = () => new Promise(() => {});
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "atualizar" }));
  });
  const busy = screen.getByRole("button", { name: "atualizar" }) as HTMLButtonElement;
  expect(busy.disabled).toBe(true);
  expect(busy.getAttribute("aria-busy")).toBe("true");
  expect(busy.textContent).not.toContain("...");
  expect(busy.querySelector("svg")).toBeTruthy();
});

test("the device code is announced, can be copied, and cancelling swallows a failure", async () => {
  const written: string[] = [];
  Object.defineProperty(navigator, "clipboard", { value: { writeText: (v: string) => (written.push(v), Promise.resolve()) }, configurable: true });
  responses.github_status = () => Promise.resolve({ connected: false, login: "", source: "", device_flow: true });
  responses.github_device_start = () => Promise.resolve({ user_code: "AB-12", url: "https://github.com/login/device", expires_in_s: 900 });
  responses.github_device_finish = () => new Promise(() => {});
  responses.github_device_cancel = () => Promise.reject("já fechado");
  render(<GithubTab onError={() => {}} />);
  await settle();
  expect(screen.getByText("Read-only")).toBeTruthy();
  await act(async () => {
    fireEvent.click(screen.getByText("entrar com o GitHub"));
  });
  await settle();
  expect(screen.getByRole("status").textContent).toBe("Seu código é A B - 1 2");
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "copiar código" }));
  });
  expect(written).toEqual(["AB-12"]);
  expect(screen.getByRole("status").textContent).toBe("código copiado");
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "cancelar" }));
  });
  expect(count("github_device_cancel")).toBe(1);
});

test("the palette's refresh request forces a fresh trip to GitHub", async () => {
  const { requestRefresh } = await import("../lib/refreshEvent");
  responses.github_status = () => Promise.resolve(connected);
  responses.github_lists = () => Promise.resolve(lists);
  render(<GithubTab onError={() => {}} />);
  await settle();
  await act(async () => requestRefresh("github"));
  await settle();
  expect(calls.filter((c) => c.cmd === "github_lists").at(-1)?.args).toMatchObject({ force: true });
});
