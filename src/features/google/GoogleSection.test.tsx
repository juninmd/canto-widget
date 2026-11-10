import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const PHOTO = "data:image/png;base64,iVBORw0KGgo=";
const connected = { configured: true, embedded: true, connected: true, email: "ana@exemplo.com", name: "Ana Souza", avatar: PHOTO };
let status: Record<string, unknown> = connected;
const calls: string[] = [];
let release: (() => void) | null = null;
let fail = false;
let hold = false;

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    if (cmd === "drive_disconnect") status = { configured: true, embedded: true, connected: false, email: "", name: "", avatar: "" };
    if (cmd === "drive_status" && fail) return Promise.reject("sem rede");
    if (cmd === "drive_status" && release === null && hold) return new Promise((r) => (release = () => r(status)));
    return Promise.resolve(cmd === "drive_status" ? status : null);
  },
}));

const { default: GoogleSection } = await import("./GoogleSection");

async function mount() {
  render(<GoogleSection onError={() => {}} />);
  await act(async () => {
    await Promise.resolve();
  });
}

afterEach(() => {
  cleanup();
  status = connected;
  calls.length = 0;
  release = null;
  fail = false;
  hold = false;
});

test("connected account shows photo, name and email", async () => {
  await mount();
  expect(screen.getByText("Ana Souza")).toBeTruthy();
  expect(screen.getByText("ana@exemplo.com")).toBeTruthy();
  expect(document.querySelector("img")?.getAttribute("src")).toBe(PHOTO);
});

test("signing out disconnects and returns to the sign-in state", async () => {
  await mount();
  fireEvent.click(screen.getByLabelText("sair da conta ana@exemplo.com"));
  expect(calls).not.toContain("drive_disconnect");
  await act(async () => {
    fireEvent.click(screen.getByText("sim, sair"));
  });
  expect(calls).toContain("drive_disconnect");
  expect(screen.getByText("pronto para entrar")).toBeTruthy();
  expect(screen.getByRole("button", { name: "entrar com o Google" })).toBeTruthy();
  expect(screen.queryByText("Ana Souza")).toBeNull();
});

test("sign-out asks first: cancelling keeps the account and revokes nothing", async () => {
  await mount();
  fireEvent.click(screen.getByLabelText("sair da conta ana@exemplo.com"));
  expect(screen.getByText("sair desta conta? a agenda do Google some do Canto até você entrar de novo")).toBeTruthy();
  fireEvent.click(screen.getByText("cancelar"));
  expect(calls).not.toContain("drive_disconnect");
  expect(screen.getByText("Ana Souza")).toBeTruthy();
  expect(document.activeElement?.getAttribute("aria-label")).toBe("sair da conta ana@exemplo.com");
});

test("a photo that isn't an image data: URL doesn't become an <img>; shows the initial instead", async () => {
  status = { ...connected, name: "", avatar: "https://rastreador.exemplo/pixel.png" };
  await mount();
  expect(document.querySelector("img")).toBeNull();
  expect(screen.getByText("A")).toBeTruthy();
  expect(screen.getByText("ana@exemplo.com")).toBeTruthy();
});

test("until the status answers there is a skeleton, never a 'não configurado' flash", async () => {
  hold = true;
  render(<GoogleSection onError={() => {}} />);
  expect(screen.getByRole("status", { name: "lendo a conta do Google" })).toBeTruthy();
  expect(screen.queryByText("não configurado")).toBeNull();
  await act(async () => {
    release!();
  });
  expect(screen.queryByRole("status", { name: "lendo a conta do Google" })).toBeNull();
  expect(screen.getByText("Ana Souza")).toBeTruthy();
});

test("a failed status read shows an alert with retry instead of spinning", async () => {
  fail = true;
  await mount();
  expect(screen.getByRole("alert").textContent).toContain("sem rede");
  fail = false;
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "tentar de novo" }));
  });
  expect(screen.getByText("Ana Souza")).toBeTruthy();
});
