import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";

const PNG_URL = "data:image/png;base64,iVBORw0KGgo=";
const calls: { cmd: string; args?: Record<string, unknown> }[] = [];
let images: Record<string, string> = {};
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    calls.push({ cmd, args });
    if (cmd === "note_image_get") {
      const url = images[args?.id as string];
      return url ? Promise.resolve(url) : Promise.reject("imagem indisponível");
    }
    if (cmd === "note_image_save") return Promise.resolve("abc123");
    return Promise.resolve(null);
  },
}));

const { renderMarkdown } = await import("./markdown");
const { attachImage, imageIds, insertAt, isSafeImageUrl, MAX_IMAGE_BYTES, stripImageRefs } = await import("./noteImages");

beforeEach(() => {
  calls.length = 0;
  images = {};
});
afterEach(cleanup);

test("a canto-img reference renders the sealed image as a data URL", async () => {
  images.ab12 = PNG_URL;
  render(<div>{renderMarkdown("antes\n![planta](canto-img:ab12)")}</div>);
  const img = (await screen.findByRole("img", { name: "planta" })) as HTMLImageElement;
  expect(img.getAttribute("src")).toBe(PNG_URL);
});

test("a missing image degrades to an unavailable placeholder", async () => {
  render(<div>{renderMarkdown("![](canto-img:dead)")}</div>);
  expect(await screen.findByRole("img", { name: "imagem indisponível" })).toBeTruthy();
  expect(document.querySelector("img")).toBeNull();
});

test("a non-data URL from the backend never reaches an img", async () => {
  images.ab12 = "http://exemplo.invalid/x.png";
  render(<div>{renderMarkdown("![](canto-img:ab12)")}</div>);
  expect(await screen.findByText("imagem indisponível")).toBeTruthy();
  expect(document.querySelector("img")).toBeNull();
});

test("remote or file image markdown is not loaded", () => {
  render(<div>{renderMarkdown("![x](https://exemplo.invalid/a.png) ![y](file:///c/a.png)")}</div>);
  expect(document.querySelector("img")).toBeNull();
  expect(calls.some((c) => c.cmd === "note_image_get")).toBe(false);
});

test("only base64 data URLs of the four accepted types are safe", () => {
  expect(isSafeImageUrl(PNG_URL)).toBe(true);
  expect(isSafeImageUrl("data:image/webp;base64,UklGRg==")).toBe(true);
  expect(isSafeImageUrl("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
  expect(isSafeImageUrl("file:///c/a.png")).toBe(false);
  expect(isSafeImageUrl(null)).toBe(false);
});

test("attaching sends base64 to Rust and returns the markdown reference", async () => {
  const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "a.png", { type: "image/png" });
  expect(await attachImage(file)).toBe("![](canto-img:abc123)");
  expect(calls.at(-1)).toEqual({ cmd: "note_image_save", args: { data: "iVBORw==" } });
});

test("a wrong type or an oversized image is refused before the round trip", async () => {
  const svg = new File(["<svg/>"], "a.svg", { type: "image/svg+xml" });
  await expect(attachImage(svg)).rejects.toThrow("formato de imagem não suportado");
  const big = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "a.png", { type: "image/png" });
  await expect(attachImage(big)).rejects.toThrow("máximo de 2 MB");
  expect(calls.length).toBe(0);
});

test("the reference lands on its own line at the caret", () => {
  expect(insertAt("ab", 1, "IMG")).toEqual({ body: "a\nIMG\nb", caret: 6 });
  expect(insertAt("", 0, "IMG")).toEqual({ body: "IMG\n", caret: 4 });
  expect(insertAt("a\n", 2, "IMG")).toEqual({ body: "a\nIMG\n", caret: 6 });
});

test("cards drop the raw reference; the image shows as a thumbnail", () => {
  expect(stripImageRefs("veja ![](canto-img:ab12) aqui")).toBe("veja  aqui");
  expect(stripImageRefs("topo\n\n![](canto-img:ab12)\n\nfim")).toBe("topo\n\nfim");
});

test("image ids come out in order, each once", () => {
  expect(imageIds("a ![](canto-img:ab12)\n![x](canto-img:cd34) ![](canto-img:ab12)")).toEqual(["ab12", "cd34"]);
  expect(imageIds("![](https://example.com/x.png)")).toEqual([]);
});
