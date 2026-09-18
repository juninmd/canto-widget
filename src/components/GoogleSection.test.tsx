import { afterEach, expect, mock, test } from "bun:test";
import { act } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const PHOTO = "data:image/png;base64,iVBORw0KGgo=";
const connected = { configured: true, embedded: true, connected: true, email: "ana@exemplo.com", name: "Ana Souza", avatar: PHOTO };
let status: Record<string, unknown> = connected;
const calls: string[] = [];

mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string) => {
    calls.push(cmd);
    if (cmd === "drive_disconnect") status = { configured: true, embedded: true, connected: false, email: "", name: "", avatar: "" };
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
});

test("connected account shows photo, name and email", async () => {
  await mount();
  expect(screen.getByText("Ana Souza")).toBeTruthy();
  expect(screen.getByText("ana@exemplo.com")).toBeTruthy();
  expect(document.querySelector("img")?.getAttribute("src")).toBe(PHOTO);
});

test("signing out disconnects and returns to the sign-in state", async () => {
  await mount();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "sair da conta ana@exemplo.com" }));
  });
  expect(calls).toContain("drive_disconnect");
  expect(screen.getByText("pronto para entrar")).toBeTruthy();
  expect(screen.getByRole("button", { name: "entrar com o Google" })).toBeTruthy();
  expect(screen.queryByText("Ana Souza")).toBeNull();
});

test("a photo that isn't an image data: URL doesn't become an <img>; shows the initial instead", async () => {
  status = { ...connected, name: "", avatar: "https://rastreador.exemplo/pixel.png" };
  await mount();
  expect(document.querySelector("img")).toBeNull();
  expect(screen.getByText("A")).toBeTruthy();
  expect(screen.getByText("ana@exemplo.com")).toBeTruthy();
});
