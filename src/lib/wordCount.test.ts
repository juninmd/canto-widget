import { expect, test } from "bun:test";
import { countWords, readingMinutes } from "./wordCount";

test("counts plain words and ignores Markdown markup", () => {
  expect(countWords("")).toBe(0);
  expect(countWords("# Título\n\n- **um** item\n- [ ] _dois_ `três`")).toBe(5);
});

test("ordered-list numbers and task checkboxes are markup, not words", () => {
  expect(countWords("1. migrar\n2) testar\n- [x] feito\n- [X] ok\n  * [ ] aninhado")).toBe(5);
  expect(countWords("são 24 h")).toBe(3);
});

test("image refs, link targets and bare URLs are not counted", () => {
  expect(countWords("![](canto-img:abc123) foto")).toBe(1);
  expect(countWords("veja [o doc](https://example.com/a/b) agora")).toBe(4);
  expect(countWords("link https://example.com/x?y=1 aqui")).toBe(2);
});

test("accented words count once each", () => {
  expect(countWords("ação, coração e pão.")).toBe(4);
});

test("reading time rounds at 200 words per minute", () => {
  expect(readingMinutes(50)).toBe(0);
  expect(readingMinutes(150)).toBe(1);
  expect(readingMinutes(1000)).toBe(5);
});
