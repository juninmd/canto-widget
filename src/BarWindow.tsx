import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { api } from "./lib/api";

const EVENT = "bar-agenda";

/** The strip over the Windows taskbar: one line with the next event, click-through, nothing else. */
export default function BarWindow() {
  const [text, setText] = useState("");

  useEffect(() => {
    let gone = false;
    void api.barAgendaText().then((v) => !gone && setText(v ?? ""), () => {});
    const stop = listen<string | null>(EVENT, (e) => setText(e.payload ?? ""));
    return () => {
      gone = true;
      void stop.then((off) => off());
    };
  }, []);

  return (
    <div
      role="status"
      className="flex h-screen items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-black/60 px-3 text-xs font-medium text-white"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <span className="truncate">{text}</span>
    </div>
  );
}
