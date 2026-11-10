import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { block, plainTokens, useLexer } from "./markdown";

function Text({ text }: { text: string }) {
  const lexer = useLexer("block");
  return <div>{lexer(text).map((tok, i) => block(tok, { text: (plain) => plain }, `t${i}`))}</div>;
}

test("before the parser loads a text shows one plain line per line", () => {
  const tokens = plainTokens("**reunião**\n\n- item");
  expect(tokens.map((tok) => tok.type)).toEqual(["paragraph", "paragraph"]);
  const { container } = render(<div>{tokens.map((tok, i) => block(tok, { text: (plain) => plain }, `p${i}`))}</div>);
  expect(container.textContent).toBe("**reunião**- item");
});

test("once loaded the same text renders as markdown", () => {
  const { container } = render(<Text text={"**reunião**\n\n- item"} />);
  expect(container.querySelector("strong")?.textContent).toBe("reunião");
  expect(container.querySelector("li")?.textContent).toBe("item");
});

test("the parser stays out of the startup chunk", async () => {
  const source = await Bun.file(new URL("./markdown.tsx", import.meta.url)).text();
  expect(source).not.toMatch(/^import \{[^}]*\} from "marked";$/m);
  expect(source).toContain('import("./markdownLexer")');
});
