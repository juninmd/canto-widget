import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import NoteImage from "../components/NoteImage";
import { imageMarkdown } from "./noteImages";

const IMAGE_ID = /^[0-9a-f]{1,64}$/;
const CANTO_SRC = /^canto-img:([0-9a-f]{1,64})$/;

/** Only a sealed image id survives; anything else (http, file, data) means "not ours". */
export function safeImageId(id: unknown): string | null {
  return typeof id === "string" && IMAGE_ID.test(id) ? id : null;
}

function ImageView({ node, selected }: ReactNodeViewProps) {
  return (
    <NodeViewWrapper as="span" data-canto-img={node.attrs.id} className={`inline-block max-w-full align-top ${selected ? "rounded ring-2 ring-accent" : ""}`}>
      <NoteImage id={node.attrs.id} alt={node.attrs.alt} />
    </NodeViewWrapper>
  );
}

/**
 * A note image is only its sealed id (plus the alt text written in the markdown, so it isn't lost): there is no
 * `src`, so pasted HTML or markdown can never make the editor load a remote, file or data URL.
 */
export const CantoImage = Node.create({
  name: "cantoImage",
  group: "inline",
  inline: true,
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      id: { default: null, parseHTML: (el) => safeImageId(el.getAttribute("data-canto-img")), renderHTML: () => ({}) },
      alt: { default: "", parseHTML: (el) => el.getAttribute("data-alt") ?? "", renderHTML: () => ({}) },
    };
  },

  parseHTML() {
    return [
      {
        tag: "[data-canto-img]",
        getAttrs: (el) => (safeImageId((el as HTMLElement).getAttribute("data-canto-img")) ? null : false),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-canto-img": node.attrs.id, "data-alt": node.attrs.alt || null })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView, { as: "span" });
  },

  markdownTokenName: "image",

  parseMarkdown: (token) => {
    const id = CANTO_SRC.exec(String(token.href ?? ""))?.[1];
    // Remote or file images were never loaded by Canto; they stay as the literal text the user wrote.
    if (!id) return { type: "text", text: token.raw ?? "" };
    return { type: "cantoImage", attrs: { id, alt: String(token.text ?? "").replace(/[[\]]/g, "") } };
  },

  renderMarkdown: (node) => {
    const id = safeImageId(node.attrs?.id);
    if (!id) return "";
    const alt = String(node.attrs?.alt ?? "");
    return alt ? `![${alt}](canto-img:${id})` : imageMarkdown(id);
  },
});
