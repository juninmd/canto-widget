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

function show(i: ClipItem, extra: { copied?: boolean; onCopy?: () => void } = {}) {
  return render(
    <ul>
      <ClipCard item={i} copied={!!extra.copied} className="" onCopy={extra.onCopy ?? (() => {})} onPin={() => {}} onDelete={() => {}} />
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
  expect((container.querySelector("[aria-hidden]") as HTMLElement).style.background).toBe("#4f46e5");
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
