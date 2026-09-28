import { afterEach, expect, mock, test } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import type { Editor } from "@tiptap/core";

const fetched: string[] = [];
mock.module("@tauri-apps/api/core", () => ({
  invoke: (cmd: string, args?: Record<string, unknown>) => {
    if (cmd === "note_image_get") fetched.push(args?.id as string);
    return Promise.resolve(cmd === "note_image_get" ? "data:image/png;base64,QUI=" : null);
  },
}));

const { default: NoteEditor } = await import("./NoteEditor");
const { serializeNote } = await import("../lib/noteMarkdown");

afterEach(cleanup);

function paste(html: string) {
  render(
    <NoteEditor
      draft={{ id: undefined, title: "", body: "", tags: "", link: null }}
      tasks={[]}
      agenda={[]}
      onChange={() => {}}
      onSave={() => {}}
      onCancel={() => {}}
    />,
  );
  const box = screen.getByRole("textbox", { name: "conteúdo do card" });
  const editor = (box as unknown as { editor: Editor }).editor;
  act(() => void editor.view.pasteHTML(html));
  return { box, markdown: serializeNote(editor.getJSON()) };
}

test("pasted HTML keeps only what the note schema knows: no styles, scripts, handlers or raw tags", () => {
  const { box, markdown } = paste(
    '<p style="color:red" onclick="alert(1)">olá <b>forte</b> <u>sub</u></p><script>alert(1)</script><iframe src="https://x.invalid"></iframe><h2 class="x">título</h2>',
  );
  expect(markdown).toBe("olá **forte** sub\n\n## título");
  expect(box.querySelector("[style], [onclick], script, iframe, [class='x']")).toBeNull();
});

test("a pasted link with a non-http(s) scheme becomes plain text", () => {
  const { box, markdown } = paste('<p><a href="javascript:alert(1)">clique</a> <a href="file:///etc/passwd">arquivo</a> <a href="https://ok.example">ok</a></p>');
  expect(markdown).toBe("clique arquivo [ok](https://ok.example)");
  expect([...box.querySelectorAll("a")].map((a) => a.getAttribute("href"))).toEqual(["https://ok.example"]);
});

test("pasted <img> tags never load: remote, file and data sources are all dropped", () => {
  const { box, markdown } = paste(
    '<p>a<img src="https://x.invalid/t.png"><img src="file:///c/a.png"><img src="data:image/png;base64,QUI=">b</p>',
  );
  expect(markdown).toBe("ab");
  expect(box.querySelector("img")).toBeNull();
});

test("a note image copied from another note pastes back as the same sealed reference", async () => {
  const { markdown } = paste('<p>x<span data-canto-img="ab12"></span><span data-canto-img="../evil"></span></p>');
  expect(markdown).toBe("x![](canto-img:ab12)");
  await act(async () => {
    await Promise.resolve();
  });
  expect(fetched).toEqual(["ab12"]);
});
