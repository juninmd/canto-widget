import { useState } from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles.css";
import "@juninmd/sonido/styles.css";

// O adaptador da migração anterior: Tabs genérico + ConfirmButton sólido.
import LegacyConfirmButton from "./legacy-v2/ConfirmButton";
import LegacySubTabs from "./legacy-v2/SubTabs";

// O adaptador novo: SubTabs e ConfirmButton inline, agora vindos do pacote 2.3.0.
import ConfirmButton from "../../src/components/ConfirmButton";
import SubTabs from "../../src/components/SubTabs";

const TABS = [
  { key: "loja", label: "Loja", icon: <span aria-hidden>◈</span> },
  { key: "desejos", label: "Desejos", icon: <span aria-hidden>◇</span>, badge: 12 },
  { key: "jogos", label: "Jogos", icon: <span aria-hidden>▤</span> },
  { key: "updates", label: "Atualizações", icon: <span aria-hidden>↻</span>, badge: 1, tone: "hot" as const },
];

const card: React.CSSProperties = {
  background: "var(--color-panel)",
  border: "1px solid var(--color-edge)",
  borderRadius: 14,
  padding: 16,
  minWidth: 0,
};
const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  alignItems: "stretch",
};
const tag = (color: string): React.CSSProperties => ({
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color,
  fontWeight: 700,
  marginBottom: 10,
});
const page: React.CSSProperties = {
  background: "var(--color-ink)",
  color: "var(--color-fg)",
  fontFamily: "system-ui, sans-serif",
  padding: 28,
  minHeight: "100vh",
  display: "grid",
  gap: 22,
};
const CONFIRM_CLASS = "canto-hit min-h-[26px] rounded-md bg-accent px-2.5 text-[11.5px] font-semibold text-on-accent disabled:opacity-40";

function Row({ title, hint, before, after }: { title: string; hint: string; before: React.ReactNode; after: React.ReactNode }) {
  return (
    <section style={{ display: "grid", gap: 8 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 15 }}>{title}</h2>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-muted)" }}>{hint}</p>
      </div>
      <div style={grid}>
        <div style={card}>
          <div style={tag("var(--color-faint)")}>Antes · Sonido 2.2.2 (Tabs + ConfirmButton sólido)</div>
          <div style={{ display: "grid", gap: 10 }}>{before}</div>
        </div>
        <div style={card}>
          <div style={tag("var(--color-accent-text)")}>Depois · Sonido 2.3.0 (SubTabs + inline)</div>
          <div style={{ display: "grid", gap: 10 }}>{after}</div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [legacyTab, setLegacyTab] = useState("desejos");
  const [tab, setTab] = useState("desejos");
  const skin = new URLSearchParams(location.search).get("skin");
  if (skin) {
    const theme = skin === "claro" ? "light" : skin === "padrao" ? "dark" : skin;
    document.documentElement.dataset.skin = skin;
    document.documentElement.dataset.theme = theme;
  }
  return (
    <div style={page}>
      <header>
        <h1 style={{ margin: 0, fontSize: 20 }}>Canto · SubTabs e ConfirmButton originais no Sonido</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-muted)" }}>
          Mesmo conteúdo, mesma skin. A esquerda o que a migração anterior entregou; a direita o original do canto-widget, agora
          publicado no pacote.
        </p>
      </header>

      <Row
        title="SubTabs"
        hint="Controle segmentado com contador; antes usava o Tabs em pílula + ponte de CSS, depois o SubTabs original."
        before={<LegacySubTabs label="seções da steam" tabs={TABS} value={legacyTab} onChange={setLegacyTab} />}
        after={<SubTabs label="seções da steam" tabs={TABS} value={tab} onChange={setTab} />}
      />

      <Row
        title="SubTabs denso"
        hint="Sete abas que dividem a largura (Sistema)."
        before={<LegacySubTabs dense label="seções do sistema" tabs={TABS.slice(0, 3)} value={legacyTab} onChange={setLegacyTab} />}
        after={<SubTabs dense label="seções do sistema" tabs={TABS.slice(0, 3)} value={tab} onChange={setTab} />}
      />

      <Row
        title="SubTabs só ícones"
        hint="Rótulo visível apenas na aba selecionada."
        before={<LegacySubTabs iconsOnly label="seções do sistema" tabs={TABS} value={legacyTab} onChange={setLegacyTab} />}
        after={<SubTabs iconsOnly label="seções do sistema" tabs={TABS} value={tab} onChange={setTab} />}
      />

      <Row
        title="ConfirmButton"
        hint="Clique em “parar” dos dois lados para comparar a pergunta."
        before={<div style={{ justifySelf: "start" }}><LegacyConfirmButton ask="parar a sincronização?" yes="sim, parar" onConfirm={() => {}} className={CONFIRM_CLASS}>parar</LegacyConfirmButton></div>}
        after={<div style={{ justifySelf: "start" }}><ConfirmButton ask="parar a sincronização?" yes="sim, parar" onConfirm={() => {}} className={CONFIRM_CLASS}>parar</ConfirmButton></div>}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
