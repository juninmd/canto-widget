import { test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { OUT, shootLossy } from "./out";

const data = (file: string, type: string) => `data:${type};base64,${readFileSync(file).toString("base64")}`;
const shot = (name: string) => data(`${OUT}/${name}.webp`, "image/webp");

const COPY = {
  en: {
    file: "banner",
    headline: 'Your whole day <b>in the corner of the screen.</b>',
    body: "Tasks with reminders, notes, clipboard, agenda with meeting alerts, status checks and your PRs, in one small window.",
    chips: ["🔒 encrypted", "🏠 100% local", "🦀 Tauri + Rust", "🪟 Win · macOS · Linux"],
  },
  pt: {
    file: "banner.pt-BR",
    headline: 'Seu dia inteiro <b>no canto da tela.</b>',
    body: "Tarefas com lembrete, notas, clipboard, agenda com aviso de reunião, status de serviços e seus PRs, numa janela pequena.",
    chips: ["🔒 cifrado", "🏠 100% local", "🦀 Tauri + Rust", "🪟 Win · macOS · Linux"],
  },
};

function html(copy: (typeof COPY)["en"]) {
  const window = (src: string, style: string) => `<img src="${src}" style="position:absolute;width:420px;filter:drop-shadow(0 34px 38px rgba(0,0,0,.55));${style}">`;
  return `<!doctype html><meta charset="utf-8"><style>
    *{box-sizing:border-box}html,body{margin:0}
    .card{position:relative;width:1920px;height:900px;overflow:hidden;border-radius:44px;font-family:"Segoe UI",system-ui,sans-serif;color:#e6edf6;
      background:radial-gradient(900px 600px at 82% 78%,rgba(34,197,94,.28),transparent 70%),radial-gradient(1000px 700px at 12% 0%,#16324a 0%,transparent 60%),#0a1322}
    .copy{position:absolute;left:112px;top:150px;width:860px}
    .brand{display:flex;align-items:center;gap:30px}.brand img{width:128px;height:128px;border-radius:30px}
    .brand span{font-size:150px;font-weight:800;letter-spacing:-4px}
    h1{font-size:54px;line-height:1.1;margin:44px 0 22px;font-weight:700}h1 b{color:#4ade80}
    p{font-size:30px;line-height:1.45;margin:0 0 40px;color:#9fb0c5;width:820px}
    .chips{display:flex;gap:16px;flex-wrap:wrap}.chips span{border:2px solid #1f5a45;background:rgba(34,197,94,.08);border-radius:999px;padding:12px 22px;font-size:26px;font-weight:600}
    .stage{position:absolute;inset:0;perspective:1800px}
  </style><div class="card"><div class="copy">
    <div class="brand"><img src="${data("src-tauri/icons/icon.png", "image/png")}"><span>Canto</span></div>
    <h1>${copy.headline}</h1><p>${copy.body}</p>
    <div class="chips">${copy.chips.map((c) => `<span>${c}</span>`).join("")}</div></div>
    <div class="stage">
      ${window(shot("tasks"), "left:1010px;top:200px;transform:rotateY(18deg) rotateZ(-7deg);opacity:.9")}
      ${window(shot("github"), "left:1220px;top:90px;transform:rotateY(12deg) rotateZ(-3deg)")}
      ${window(shot("alert-meeting"), "left:1450px;top:360px;transform:rotateY(8deg) rotateZ(4deg);filter:drop-shadow(0 0 40px rgba(74,222,128,.35)) drop-shadow(0 34px 38px rgba(0,0,0,.55))")}
    </div></div>`;
}

for (const [lang, copy] of Object.entries(COPY)) {
  test(`banner: ${lang}`, async ({ browser }) => {
    const page = await (await browser.newContext({ viewport: { width: 1920, height: 900 }, deviceScaleFactor: 1 })).newPage();
    await page.setContent(html(copy));
    await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
    await shootLossy(page, copy.file, 92);
  });
}
