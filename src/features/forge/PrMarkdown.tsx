import { api } from "../../lib/api";
import { block, useLexer, type Render } from "../../lib/markdown";
import type { PrBackend } from "./prApi";
import PrImage from "./PrImage";

/** A description or comment as markdown with its pictures; links open in the browser, raw HTML is never rendered. */
export default function PrMarkdown({ back, text }: { back: PrBackend; text: string }) {
  const lexer = useLexer("block");
  const render: Render = {
    text: (s) => s,
    link: (href, children, key) =>
      /^https?:\/\//i.test(href) ? (
        <a key={key} href={href} onClick={(e) => (e.preventDefault(), void api.openLink(href).catch(() => {}))} className="text-accent-text underline">
          {children}
        </a>
      ) : (
        <span key={key}>{children}</span>
      ),
    image: (src, alt, key) => <PrImage key={key} back={back} src={src} alt={alt} />,
  };
  return <div className="space-y-1.5 break-words text-xs text-fg">{lexer(text).map((tok, i) => block(tok, render, `m${i}`))}</div>;
}
