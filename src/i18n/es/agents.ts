import type { agents as source } from "../pt-BR/agents";

export const agents: Record<keyof typeof source, string> = {
  "agents.tab": "Agentes",
  "agents.loading": "consultando los agentes",
  "agents.header": "{installed} de {total} instalados",
  "agents.refresh": "actualizar",
  "agents.refreshTitle": "las versiones se buscan como máximo una vez cada 30 min",
  "agents.installed": "instalado",
  "agents.notInstalled": "no instalado",
  "agents.path": "encontrado en {path}",
  "agents.install": "instalar con {tool}",
  "agents.copy": "copiar",
  "agents.copied": "comando copiado",
  "agents.copyFailed": "no se pudo copiar el comando",
  "agents.release": "última versión {tag}",
  "agents.released": "publicada {ago}",
  "agents.releaseNone": "sin versión publicada en GitHub",
  "agents.open": "abrir en GitHub",
  "agents.empty": "ningún agente en la lista",
  "agents.hint": "el comando solo se copia: Canto no instala nada",
  "agents.source": "versiones de GitHub",
};
