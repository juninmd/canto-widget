import { useState } from "react";
import { api } from "../lib/api";
import { t } from "../i18n";
import { READS } from "../lib/protos";
import ProtoFrame from "./ProtoFrame";

const LINK = "canto-hit min-h-[24px] shrink-0 rounded-md px-1.5 hover:bg-hover hover:text-fg active:bg-active";

/** Prototype: a reading queue from RSS/Atom, with what is unread and how long each piece takes to read. */
export default function ProtoReads() {
  const [read, setRead] = useState<Record<string, boolean>>(() => Object.fromEntries(READS.map((r) => [r.id, !r.unread])));
  const unread = READS.filter((item) => !read[item.id]).length;

  return (
    <ProtoFrame needs={t("protos.reads.needs")}>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="font-medium text-muted">{t("protos.reads.unread", { n: unread })}</span>
      </div>
      <ul className="flex flex-col gap-1">
        {READS.map((item) => (
          <li key={item.id} data-proto-read={item.id} className={`rounded-lg border border-edge/60 px-2 py-1.5 ${read[item.id] ? "opacity-60" : ""}`}>
            <div className="truncate text-xs font-semibold text-fg">{item.title}</div>
            <div className="text-[10px] text-faint">
              {item.source} · {t("protos.reads.minutes", { n: item.minutes })} · {item.ago}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <button
                type="button"
                aria-label={t("protos.reads.open")}
                onClick={() => void api.openLink("https://blog.exemplo.test/").catch(() => {})}
                className={LINK}
              >
                {t("protos.reads.open")}
              </button>
              {!read[item.id] && (
                <button
                  type="button"
                  onClick={() => setRead((prev) => ({ ...prev, [item.id]: true }))}
                  className={`${LINK} text-faint`}
                >
                  {t("protos.reads.markRead")}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </ProtoFrame>
  );
}
