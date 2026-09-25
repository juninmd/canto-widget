import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const calls: { url: string }[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    if (cmd === "open_link") calls.push({ url: args?.url as string });
    return Promise.resolve(null);
  },
}));

const { renderMarkdown, toggleChecklist } = await import("./markdown");

afterEach(cleanup);

test("bold, italic and inline code render as their tags", () => {
  render(<div>{renderMarkdown("**forte** e *itálico* e `codigo`")}</div>);
  expect(screen.getByText("forte").tagName).toBe("STRONG");
  expect(screen.getByText("itálico").tagName).toBe("EM");
  expect(screen.getByText("codigo").tagName).toBe("CODE");
});

test("headings use the number of # as the level", () => {
  render(<div>{renderMarkdown("# um\n## dois\n### tres")}</div>);
  expect(screen.getByText("um").tagName).toBe("H1");
  expect(screen.getByText("dois").tagName).toBe("H2");
  expect(screen.getByText("tres").tagName).toBe("H3");
});

test("bullet and numbered lists render as ul/ol", () => {
  render(<div>{renderMarkdown("- a\n- b")}</div>);
  expect(screen.getByText("a").closest("ul")).toBeTruthy();
  cleanup();
  render(<div>{renderMarkdown("1. a\n2. b")}</div>);
  expect(screen.getByText("a").closest("ol")).toBeTruthy();
});

test("an http(s) link becomes a clickable button that opens through the validated command", async () => {
  render(<div>{renderMarkdown("veja [o site](https://exemplo.com)")}</div>);
  const link = screen.getByRole("button", { name: "o site" });
  fireEvent.click(link);
  await Promise.resolve();
  expect(calls).toContainEqual({ url: "https://exemplo.com" });
});

test("a non-http(s) link is kept as literal text, never turned into a clickable element", () => {
  render(<div>{renderMarkdown("[clique aqui](javascript:alert(1))")}</div>);
  expect(screen.queryByRole("button", { name: "clique aqui" })).toBeNull();
  expect(screen.getByText("[clique aqui](javascript:alert(1))")).toBeTruthy();
});

test("a fenced block shows as code with its markdown left literal", () => {
  const { container } = render(<div>{renderMarkdown("antes\n```\n# não é título\n**nem negrito**\n```\ndepois")}</div>);
  const pre = container.querySelector("pre code");
  expect(pre?.textContent).toBe("# não é título\n**nem negrito**");
  expect(container.querySelector("h1")).toBeNull();
  expect(container.querySelector("strong")).toBeNull();
  expect(screen.getByText("depois").tagName).toBe("P");
});

test("the fence language turns on syntax highlighting", () => {
  const { container } = render(<div>{renderMarkdown("```rust\nfn main() {}\n```")}</div>);
  expect(container.querySelector("pre")?.getAttribute("data-lang")).toBe("rust");
  expect(screen.getByText("fn").className).toContain("text-accent");
});

test("an unclosed fence keeps the rest of the note as code", () => {
  const { container } = render(<div>{renderMarkdown("```\n- item")}</div>);
  expect(container.querySelector("pre code")?.textContent).toBe("- item");
  expect(container.querySelector("li")).toBeNull();
});

test("checklist items render as checkboxes with their done state", () => {
  render(<div>{renderMarkdown("- [ ] leite\n- [x] pão")}</div>);
  const leite = screen.getByRole("checkbox", { name: "leite" }) as HTMLInputElement;
  const pao = screen.getByRole("checkbox", { name: "pão" }) as HTMLInputElement;
  expect([leite.checked, pao.checked]).toEqual([false, true]);
  expect(screen.getByText("pão").className).toContain("line-through");
});

test("clicking a checkbox reports its line in the source text", () => {
  const lines: number[] = [];
  render(<div>{renderMarkdown("# compras\n\n- [ ] leite\n- [ ] pão", (n) => lines.push(n))}</div>);
  fireEvent.click(screen.getByRole("checkbox", { name: "pão" }));
  expect(lines).toEqual([3]);
});

test("without a toggle handler the checkboxes are read-only", () => {
  render(<div>{renderMarkdown("- [ ] leite")}</div>);
  expect((screen.getByRole("checkbox", { name: "leite" }) as HTMLInputElement).disabled).toBe(true);
});

test("toggleChecklist flips only the box of the given line", () => {
  const text = "- [ ] leite\n- [x] pão\ntexto";
  expect(toggleChecklist(text, 0)).toBe("- [x] leite\n- [x] pão\ntexto");
  expect(toggleChecklist(text, 1)).toBe("- [ ] leite\n- [ ] pão\ntexto");
  expect(toggleChecklist(text, 2)).toBe(text);
  expect(toggleChecklist(text, 9)).toBe(text);
  expect(toggleChecklist("- [ ] ver [x] depois", 0)).toBe("- [x] ver [x] depois");
});

test("opening a link inside a checklist item does not tick it", async () => {
  const lines: number[] = [];
  render(<div>{renderMarkdown("- [ ] revisar [o PR](https://exemplo.com/pr/1)", (n) => lines.push(n))}</div>);
  fireEvent.click(screen.getByRole("button", { name: "o PR" }));
  await Promise.resolve();
  expect(lines).toEqual([]);
  expect(calls).toContainEqual({ url: "https://exemplo.com/pr/1" });
  expect(screen.getByRole("checkbox", { name: "revisar o PR" })).toBeTruthy();
});

test("a note saved with CRLF line endings still renders headings, checklists and fences", () => {
  const { container } = render(<div>{renderMarkdown("# lista\r\n- [x] leite\r\n```js\r\nconst a = 1\r\n```\r\nfim")}</div>);
  expect(screen.getByText("lista").tagName).toBe("H1");
  expect((screen.getByRole("checkbox", { name: "leite" }) as HTMLInputElement).checked).toBe(true);
  expect(container.querySelector("pre code")?.textContent).toBe("const a = 1");
  expect(screen.getByText("fim").tagName).toBe("P");
});

test("toggleChecklist keeps CRLF line endings intact", () => {
  expect(toggleChecklist("- [ ] leite\r\n- [ ] pão", 0)).toBe("- [x] leite\r\n- [ ] pão");
});
