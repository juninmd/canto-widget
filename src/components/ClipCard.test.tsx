import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ClipCard from "./ClipCard";
import type { ClipItem } from "../lib/api";

afterEach(cleanup);

const item = (over: Partial<ClipItem>): ClipItem => ({
  id: "c1",
  preview: "texto",
  chars: 5,
  kept: 5,
  truncated: false,
  copied_at: Date.now(),
  pinned: false,
  ...over,
});

function show(i: ClipItem, extra: { copied?: boolean; privacy?: boolean; onCopy?: () => void; onCopyAs?: (m: string) => void } = {}) {
  return render(
    <ul>
      <ClipCard
        item={i}
        copied={!!extra.copied}
        privacy={!!extra.privacy}
        className=""
        onCopy={extra.onCopy ?? (() => {})}
        onCopyAs={extra.onCopyAs ?? (() => {})}
        onPin={() => {}}
        onDelete={() => {}}
      />
    </ul>,
  );
}

test("a huge copy says how much was kept, so copying back is not a surprise", () => {
  show(item({ preview: "log ".repeat(100), chars: 2_150_000, kept: 32_000, truncated: true }));
  expect(screen.getByText("Cópia grande (2,2 mi caracteres): guardei só os primeiros 32 mil.")).toBeDefined();
  expect(screen.getByTitle("copia só os primeiros 32 mil caracteres")).toBeDefined();
});

test("a normal item has no size warning and copies on click", () => {
  let copied = 0;
  show(item({}), { onCopy: () => copied++ });
  expect(screen.queryByText(/Cópia grande/)).toBeNull();
  fireEvent.click(screen.getByTitle("clique para copiar de novo"));
  expect(copied).toBe(1);
});

test("colors get a swatch and code keeps its line breaks", () => {
  const { container } = show(item({ preview: "#4f46e5", chars: 7, kept: 7 }));
  expect(screen.getByText("cor")).toBeDefined();
  expect((container.querySelector("[data-kind=color] span") as HTMLElement).style.background).toBe("#4f46e5");
  cleanup();
  const code = show(item({ preview: "fn main() {\n  run();\n}", chars: 22, kept: 22 }));
  expect(code.container.querySelector("pre")?.textContent).toBe("fn main() {\n  run();\n}");
});

test("the copy confirmation is announced and replaces the time", () => {
  show(item({}), { copied: true });
  expect(screen.getByRole("status").textContent).toBe("copiado ✓");
});

test("the pin button exposes its state to assistive tech", () => {
  show(item({ pinned: true }));
  expect(screen.getByRole("button", { name: "desafixar do histórico" }).getAttribute("aria-pressed")).toBe("true");
});

test("long code shows only its first lines and says there is more", () => {
  const rest = Array.from({ length: 9 }, (_, n) => `linha ${n}`).join("\n");
  const { container } = show(item({ preview: `const x = 1;\n${rest}`, chars: 80, kept: 80 }));
  expect(container.querySelector("pre")!.textContent).toBe("const x = 1;\nlinha 0\nlinha 1\nlinha 2…");
});

test("privacy mode blurs the text but the card and its actions stay usable", () => {
  let copied = 0;
  show(item({ preview: "conteúdo sensível" }), { privacy: true, onCopy: () => copied++ });
  expect(screen.getByText("conteúdo sensível").className).toContain("blur-sm");
  fireEvent.click(screen.getByTitle("clique para copiar de novo"));
  expect(copied).toBe(1);
});

test("a JSON item offers to be copied formatted or compact, and the click says which", () => {
  const modes: string[] = [];
  show(item({ preview: '{"a":1}', chars: 7, kept: 7 }), { onCopyAs: (m) => modes.push(m) });
  fireEvent.click(screen.getByRole("button", { name: "copiar como" }));
  fireEvent.click(screen.getByRole("button", { name: "JSON formatado" }));
  fireEvent.click(screen.getByRole("button", { name: "JSON compacto" }));
  expect(modes).toEqual(["json_pretty", "json_compact"]);
});

test("links get no rewrites and a cut-off copy is never rewritten", () => {
  show(item({ preview: "https://example.com", chars: 19, kept: 19 }));
  expect(screen.queryByRole("group", { name: "copiar como" })).toBeNull();
  cleanup();
  show(item({ preview: "texto longo", chars: 900, kept: 400, truncated: true }));
  expect(screen.queryByRole("group", { name: "copiar como" })).toBeNull();
});

test("multi-line text can be flattened, a single line cannot", () => {
  show(item({ preview: "um\ndois", chars: 7, kept: 7 }));
  fireEvent.click(screen.getByRole("button", { name: "copiar como" }));
  expect(screen.getByRole("button", { name: "em uma linha" })).toBeDefined();
  cleanup();
  show(item({ preview: "um dois", chars: 7, kept: 7 }));
  fireEvent.click(screen.getByRole("button", { name: "copiar como" }));
  expect(screen.queryByRole("button", { name: "em uma linha" })).toBeNull();
  expect(screen.getByRole("button", { name: "MAIÚSCULAS" })).toBeDefined();
});

test("the rewrite options stay out of the card until its button opens them, so the height never jumps on hover", () => {
  show(item({ preview: '{"a":1}', chars: 7, kept: 7 }));
  const toggle = screen.getByRole("button", { name: "copiar como" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("group", { name: "copiar como" })).toBeNull();
  fireEvent.click(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("group", { name: "copiar como" })).toBeDefined();
});

test("privacy mode also blurs a color swatch", () => {
  const { container } = show(item({ preview: "#ff0000" }), { privacy: true });
  expect(container.querySelector("[style]")!.className).toContain("blur-sm");
});

test("each card leads with a tile for its kind and reads 'Tipo · há X' underneath", () => {
  const cases: [string, string, string][] = [
    ["https://example.com", "link", "link"],
    ["#ff0000", "color", "cor"],
    ['{"a":1}', "json", "json"],
    ["const x = 1;", "code", "código"],
    ["só um texto", "text", "texto"],
  ];
  for (const [preview, kind, label] of cases) {
    const { container } = show(item({ preview, chars: preview.length, kept: preview.length, copied_at: Date.now() }));
    expect(container.querySelector(`[data-kind=${kind}]`)).not.toBeNull();
    expect(screen.getByText(label, { selector: "span.first-letter\\:uppercase" })).toBeDefined();
    expect(container.textContent).toContain("·");
    cleanup();
  }
});

test("the pin and delete actions are 24px-or-larger buttons shown on hover and on keyboard focus", () => {
  show(item({}));
  for (const name of ["fixar no histórico", "excluir do histórico"]) {
    const b = screen.getByRole("button", { name });
    expect(b.className).toContain("canto-hit");
    expect(b.className).toContain("size-7");
  }
  const bar = screen.getByRole("button", { name: "fixar no histórico" }).parentElement!;
  expect(bar.className).toContain("opacity-0");
  expect(bar.className).toContain("group-hover:opacity-100");
  expect(bar.className).toContain("group-focus-within:opacity-100");
});
