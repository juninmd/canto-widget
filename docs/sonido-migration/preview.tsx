import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@juninmd/sonido";
import "../../src/styles.css";
import "@juninmd/sonido/styles.css";

// O componente de antes: cópia literal de origin/main, só o caminho do import foi ajustado.
import LegacyConfirmButton from "./legacy/ConfirmButton";
import LegacyEmptyState from "./legacy/EmptyState";
import LegacySkeleton from "./legacy/Skeleton";
import LegacySpinner from "./legacy/Spinner";
import LegacyCountUp from "./legacy/CountUp";
import LegacySubTabs from "./legacy/SubTabs";

// O componente de depois: o mesmo arquivo do app, agora apoiado no Sonido.
import ConfirmButton from "../../src/components/ConfirmButton";
import EmptyState from "../../src/components/EmptyState";
import Skeleton from "../../src/components/Skeleton";
import Spinner from "../../src/components/Spinner";
import CountUp from "../../src/components/CountUp";
import SubTabs from "../../src/components/SubTabs";
import { ChecklistIcon, ClockIcon, NoteIcon, SearchIcon } from "../../src/components/Icons";

const TABS = [
  { key: "loja", label: "Loja", icon: <ClockIcon /> },
  { key: "desejos", label: "Desejos", icon: <SearchIcon />, badge: 12 },
  { key: "jogos", label: "Jogos", icon: <ChecklistIcon /> },
  { key: "atualizacoes", label: "Atualizações", icon: <NoteIcon />, badge: 1, tone: "hot" as const },
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

function Row({ title, hint, before, after }: { title: string; hint: string; before: React.ReactNode; after: React.ReactNode }) {
  return (
    <section style={{ display: "grid", gap: 8 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 15 }}>{title}</h2>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-muted)" }}>{hint}</p>
      </div>
      <div style={grid}>
        <div style={card}>
          <div style={tag("var(--color-faint)")}>Antes · componente do canto-widget</div>
          <div style={{ display: "grid", gap: 10 }}>{before}</div>
        </div>
        <div style={card}>
          <div style={tag("var(--color-accent-text)")}>Depois · @juninmd/sonido</div>
          <div style={{ display: "grid", gap: 10 }}>{after}</div>
        </div>
      </div>
    </section>
  );
}

const CONFIRM_CLASS = "canto-hit min-h-[26px] rounded-md bg-accent px-2.5 text-[11.5px] font-semibold text-on-accent disabled:opacity-40";

function App() {
  const [legacyTab, setLegacyTab] = useState("desejos");
  const [sonidoTab, setSonidoTab] = useState("desejos");
  // A mesma página serve para as duas skins: ?skin=hueco-mundo pinta data-skin (app) e data-theme (Sonido).
  const skin = new URLSearchParams(location.search).get("skin");
  if (skin) {
    const theme = skin === "claro" ? "light" : skin === "padrao" ? "dark" : skin;
    document.documentElement.dataset.skin = skin;
    document.documentElement.dataset.theme = theme;
  }
  return (
    <div style={page}>
      <header>
        <h1 style={{ margin: 0, fontSize: 20 }}>Canto · trocas de componentes pelo Sonido</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-muted)" }}>
          Mesmo conteúdo, mesma skin (padrão e Hueco Mundo). À esquerda o componente que o app tinha; à direita o do design system.
        </p>
      </header>

      <Row
        title="Skeleton"
        hint="Skeleton de carregamento das listas (agenda, notas, tarefas, GitHub)."
        before={<LegacySkeleton label="carregando a agenda" />}
        after={<Skeleton label="carregando a agenda" />}
      />

      <Row
        title="Spinner"
        hint="Girinho dentro dos botões ocupados."
        before={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <LegacySpinner /> sincronizando…
          </span>
        }
        after={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <Spinner /> sincronizando…
          </span>
        }
      />

      <Row
        title="CountUp"
        hint="Número que sobe até o valor; a nota dos modelos usa este contador."
        before={<LegacyCountUp value={73.2} format={(n) => n.toFixed(1).replace(".", ",")} />}
        after={<CountUp value={73.2} format={(n) => n.toFixed(1).replace(".", ",")} />}
      />

      <Row
        title="ConfirmButton"
        hint="Ação destrutiva em dois passos: clique em “parar” dos dois lados para ver a pergunta."
        before={<div style={{ justifySelf: "start" }}><LegacyConfirmButton ask="parar a sincronização?" yes="sim, parar" onConfirm={() => {}} className={CONFIRM_CLASS}>parar</LegacyConfirmButton></div>}
        after={<div style={{ justifySelf: "start" }}><ConfirmButton ask="parar a sincronização?" yes="sim, parar" onConfirm={() => {}} className={CONFIRM_CLASS}>parar</ConfirmButton></div>}
      />

      <Row
        title="EmptyState"
        hint="Lista vazia com ícone, motivo e uma saída (tentar de novo)."
        before={
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <LegacyEmptyState icon={<ChecklistIcon />}>nada para hoje</LegacyEmptyState>
          </ul>
        }
        after={
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <EmptyState
              icon={<ChecklistIcon />}
              title="nada para hoje"
              description="as tarefas do dia aparecem aqui"
              action={<Button size="sm" variant="secondary">tentar de novo</Button>}
            />
          </ul>
        }
      />

      <Row
        title="SubTabs"
        hint="Controle segmentado das abas internas (Steam, Status, Sistema)."
        before={<LegacySubTabs label="seções da steam" tabs={TABS} value={legacyTab} onChange={setLegacyTab} />}
        after={<SubTabs label="seções da steam" tabs={TABS} value={sonidoTab} onChange={setSonidoTab} />}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

