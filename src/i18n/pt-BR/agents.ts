// A aba também é uma área de texto: a chave do rótulo fica aqui, e não no app.ts, para não deslocar as
// chaves já traduzidas nos catálogos gerados (scripts/expand-languages.py divide por ordem).
export const agents = {
  "agents.tab": "Agentes",
  "agents.loading": "consultando os agentes",
  "agents.header": "{installed} de {total} instalados",
  "agents.refresh": "atualizar",
  "agents.refreshTitle": "as releases são buscadas no máximo uma vez a cada 30 min",
  "agents.installed": "instalado",
  "agents.notInstalled": "não instalado",
  "agents.path": "encontrado em {path}",
  "agents.install": "instalar com {tool}",
  "agents.copy": "copiar",
  "agents.copied": "comando copiado",
  "agents.copyFailed": "não foi possível copiar o comando",
  "agents.release": "última versão {tag}",
  "agents.released": "publicada {ago}",
  "agents.releaseNone": "sem release publicada no GitHub",
  "agents.open": "abrir no GitHub",
  "agents.empty": "nenhum agente na lista",
  "agents.hint": "o comando é só copiado: nada é instalado pelo Canto",
  "agents.source": "releases do GitHub",
} as const;
