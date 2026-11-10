import { Extension } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { codeTokens } from "./codeHighlight";

function decorate(doc: PMNode): DecorationSet {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name !== "codeBlock") return true;
    for (const tk of codeTokens(node.textContent, node.attrs.language)) {
      decorations.push(Decoration.inline(pos + 1 + tk.from, pos + 1 + tk.to, { class: tk.className }));
    }
    return false;
  });
  return DecorationSet.create(doc, decorations);
}

/** Colors fenced code by its language with the app's own tokens, as classes (the CSP forbids inline styles). */
export const CodeHighlight = Extension.create({
  name: "codeHighlight",
  addProseMirrorPlugins() {
    const key = new PluginKey<DecorationSet>("codeHighlight");
    return [
      new Plugin<DecorationSet>({
        key,
        state: {
          init: (_, state) => decorate(state.doc),
          apply: (tr, set) => (tr.docChanged ? decorate(tr.doc) : set),
        },
        props: { decorations: (state) => key.getState(state) },
      }),
    ];
  },
});
